import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as xlsx from 'xlsx';
import ExcelJS from 'exceljs';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set up Multer for memory storage (no saving to disk to process faster)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to normalize text for fuzzy matching
const normalizeString = (str: string | undefined | null) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
};

const parseAmount = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(val.toString().replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

// Advanced Invoice Normalizer
// Strips 0s, symbols, and FY tags (e.g. INV/045/23-24 -> 45)
const normalizeInvoice = (str: string | undefined | null) => {
    if (!str) return '';
    let cleaned = str.toString().toUpperCase();
    
    // Remove FY tags like "23-24" or "2023"
    cleaned = cleaned.replace(/\b(20\d{2}(-\d{2})?)\b/g, '');
    
    // Keep only numbers and letters
    cleaned = cleaned.replace(/[^A-Z0-9]/g, '');
    
    // Strip leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    return cleaned;
};

// Reconciliation Logic
app.post('/api/reconcile', upload.fields([{ name: 'prFile' }, { name: 'gstr2bFile' }]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.prFile || !files.gstr2bFile) {
        return res.status(400).json({ error: 'Both Purchase Register and GSTR-2B files are required.' });
    }

    // 1. Parse Purchase Register
    const prWorkbook = xlsx.read(files.prFile[0].buffer, { type: 'buffer' });
    const prSheetName = prWorkbook.SheetNames[0];
    const prData = xlsx.utils.sheet_to_json(prWorkbook.Sheets[prSheetName]) as any[];

    // 2. Parse GSTR-2B
    const gstrWorkbook = xlsx.read(files.gstr2bFile[0].buffer, { type: 'buffer' });
    const gstrSheetName = gstrWorkbook.SheetNames[0];
    const gstrData = xlsx.utils.sheet_to_json(gstrWorkbook.Sheets[gstrSheetName]) as any[];

    const results = [];
    const matchedGstrIndices = new Set<number>();
    let idCounter = 1;

    const TOLERANCE_LIMIT = 2.00;

    // MULTI-PASS ENGINE

    // PASS 1: Strict Exact Matches
    for (const prRow of prData) {
        const prGstin = prRow['GSTIN/UIN'] || prRow['GSTIN'];
        const prInvoice = prRow['Voucher Number'] || prRow['Invoice No'];
        const prAmount = parseAmount(prRow['Tax Amount']);
        
        let pass1Match = false;

        for (let i = 0; i < gstrData.length; i++) {
            if (matchedGstrIndices.has(i)) continue;

            const gstrRow = gstrData[i];
            const gstrGstin = gstrRow['GSTIN of supplier'] || gstrRow['GSTIN'];
            const gstrInvoice = gstrRow['Invoice number'] || gstrRow['Invoice No'];
            const gstrAmount = parseAmount(gstrRow['Tax Amount']);

            if (prGstin === gstrGstin && normalizeString(prInvoice) === normalizeString(gstrInvoice) && Math.abs(prAmount - gstrAmount) <= 0.01) {
                results.push({
                    id: idCounter++,
                    vendor: prRow['Party Name'] || gstrRow['Trade/Legal name'] || 'Unknown',
                    gstin: prGstin,
                    invoiceNo: prInvoice,
                    date: prRow['Voucher Date'] || gstrRow['Invoice date'],
                    prAmount: prAmount,
                    gstrAmount: gstrAmount,
                    status: 'Exact Match'
                });
                matchedGstrIndices.add(i);
                pass1Match = true;
                prRow._matched = true; // Mark PR row as matched
                break;
            }
        }
    }

    // PASS 2: Fuzzy Invoice Matches & Amount Tolerance
    for (const prRow of prData) {
        if (prRow._matched) continue;

        const prGstin = prRow['GSTIN/UIN'] || prRow['GSTIN'];
        const prInvoice = prRow['Voucher Number'] || prRow['Invoice No'];
        const prAmount = parseAmount(prRow['Tax Amount']);
        
        let pass2Match = false;

        for (let i = 0; i < gstrData.length; i++) {
            if (matchedGstrIndices.has(i)) continue;

            const gstrRow = gstrData[i];
            const gstrGstin = gstrRow['GSTIN of supplier'] || gstrRow['GSTIN'];
            
            // Only fuzzy match against same GSTIN
            if (prGstin !== gstrGstin) continue;

            const gstrInvoice = gstrRow['Invoice number'] || gstrRow['Invoice No'];
            const gstrAmount = parseAmount(gstrRow['Tax Amount']);

            const prInvNorm = normalizeInvoice(prInvoice);
            const gstrInvNorm = normalizeInvoice(gstrInvoice);
            
            // Extract purely the trailing numerical digits to match `00045` with `INV45`
            const prDigits = prInvNorm.match(/\d+$/)?.[0] || prInvNorm;
            const gstrDigits = gstrInvNorm.match(/\d+$/)?.[0] || gstrInvNorm;

            // Allow matched invoice if normalized strings hit
            // Check for trailing digit matches if one is a substring of the other
            const isFuzzyInvoiceMatch = (prInvNorm === gstrInvNorm) || 
                                        ((prDigits.length >= 2 && gstrDigits.length >= 2) && 
                                        (prDigits.includes(gstrDigits) || gstrDigits.includes(prDigits))) ||
                                        (prInvNorm.length >= 3 && gstrInvNorm.includes(prInvNorm)) ||
                                        (gstrInvNorm.length >= 3 && prInvNorm.includes(gstrInvNorm));

            const amountDiff = Math.abs(prAmount - gstrAmount);

            if (isFuzzyInvoiceMatch && amountDiff <= TOLERANCE_LIMIT) {
                results.push({
                    id: idCounter++,
                    vendor: prRow['Party Name'] || gstrRow['Trade/Legal name'] || 'Unknown',
                    gstin: prGstin,
                    invoiceNo: prInvoice,
                    date: prRow['Voucher Date'] || gstrRow['Invoice date'],
                    prAmount: prAmount,
                    gstrAmount: gstrAmount,
                    status: amountDiff <= 0.01 ? 'Fuzzy Match' : 'Amount Mismatch'
                });
                matchedGstrIndices.add(i);
                pass2Match = true;
                prRow._matched = true;
                break;
            }
        }

        // Output Missing in 2B
        if (!pass2Match) {
            results.push({
                id: idCounter++,
                vendor: prRow['Party Name'] || 'Unknown',
                gstin: prGstin || 'N/A',
                invoiceNo: prInvoice || 'N/A',
                date: prRow['Voucher Date'] || 'N/A',
                prAmount: prAmount,
                gstrAmount: 0,
                status: 'Missing in 2B'
            });
        }
    }

    // 5. Final Pass: Sweep GSTR-2B data for Missing in PR
    for (let i = 0; i < gstrData.length; i++) {
        if (!matchedGstrIndices.has(i)) {
            const gstrRow = gstrData[i];
            results.push({
                id: idCounter++,
                vendor: gstrRow['Trade/Legal name'] || 'Unknown',
                gstin: gstrRow['GSTIN of supplier'] || gstrRow['GSTIN'] || 'N/A',
                invoiceNo: gstrRow['Invoice number'] || gstrRow['Invoice No'] || 'N/A',
                date: gstrRow['Invoice date'] || 'N/A',
                prAmount: 0,
                gstrAmount: parseAmount(gstrRow['Tax Amount']),
                status: 'Missing in PR'
            });
        }
    }

    // Sort to bring exact matches to top, then missing, then mismatches
    results.sort((a, b) => a.status.localeCompare(b.status));

    // Calculate Summary Stats
    const summary = {
        totalReconciled: results.reduce((acc, curr) => acc + (curr.status === 'Exact Match' || curr.status === 'Fuzzy Match' || curr.status === 'Amount Mismatch' ? curr.gstrAmount : 0), 0),
        itcAtRisk: results.reduce((acc, curr) => acc + (curr.status === 'Missing in 2B' ? curr.prAmount : 0), 0),
        pendingInvoices: results.filter(r => r.status === 'Missing in PR' || r.status === 'Missing in 2B').length,
        totalTaxSaved: results.reduce((acc, curr) => acc + curr.gstrAmount, 0)
    };

    res.json({
        success: true,
        summary,
        data: results
    });

  } catch (error) {
    console.error('Reconciliation error:', error);
    res.status(500).json({ error: 'Failed to process files. Please ensure they are valid Excel files.' });
  }
});

app.post('/api/export', async (req, res) => {
  try {
    const { summary, data } = req.body;
    if (!summary || !data) {
        return res.status(400).json({ error: 'Summary and reconciled data are required' });
    }

    const workbook = new ExcelJS.Workbook();
    
    // 1. Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 }
    ];
    summarySheet.addRow({ metric: 'Total Reconciled Amount (₹)', value: summary.totalReconciled });
    summarySheet.addRow({ metric: 'ITC At Risk (₹)', value: summary.itcAtRisk });
    summarySheet.addRow({ metric: 'Pending Invoices', value: summary.pendingInvoices });
    summarySheet.addRow({ metric: 'Total Tax Saved (₹)', value: summary.totalTaxSaved });
    
    // 2. Matches Sheet
    const matchesSheet = workbook.addWorksheet('Matches');
    matchesSheet.columns = [
        { header: 'Vendor Name', key: 'vendor', width: 30 },
        { header: 'GSTIN', key: 'gstin', width: 20 },
        { header: 'Invoice No', key: 'invoiceNo', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'As per PR (₹)', key: 'prAmount', width: 15 },
        { header: 'As per 2B (₹)', key: 'gstrAmount', width: 15 },
        { header: 'Match Status', key: 'status', width: 20 }
    ];
    
    // 3. Mismatches & Missing Sheet
    const missingSheet = workbook.addWorksheet('Mismatches & Missing');
    missingSheet.columns = [
        { header: 'Vendor Name', key: 'vendor', width: 30 },
        { header: 'GSTIN', key: 'gstin', width: 20 },
        { header: 'Invoice No', key: 'invoiceNo', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'As per PR (₹)', key: 'prAmount', width: 15 },
        { header: 'As per 2B (₹)', key: 'gstrAmount', width: 15 },
        { header: 'Match Status', key: 'status', width: 20 }
    ];

    // Format headers
    [summarySheet, matchesSheet, missingSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
    });

    data.forEach((row: any) => {
        const isMatch = row.status === 'Exact Match' || row.status === 'Fuzzy Match';
        const sheet = isMatch ? matchesSheet : missingSheet;
        const addedRow = sheet.addRow(row);
        
        // Color coding
        if (isMatch) {
            addedRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }; // Light Green
        } else if (row.status === 'Amount Mismatch') {
            addedRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } }; // Light Yellow/Amber
        } else {
            addedRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }; // Light Red
        }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reconciliation_Result.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// ── In-memory Voucher Store (replace with DB in production) ──
const voucherStore: any[] = [];

// POST /api/vouchers — Save a new voucher created from the reco grid
app.post('/api/vouchers', (req, res) => {
  try {
    const body = req.body;
    if (!body.invoiceId || !body.voucherNo || !body.partyName) {
      return res.status(400).json({ error: 'invoiceId, voucherNo, and partyName are required.' });
    }
    const voucher = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...body,
    };
    voucherStore.push(voucher);
    console.log(`📋 Voucher saved: ${voucher.voucherNo} for invoice ${voucher.invoiceId}`);
    res.json({
      success: true,
      voucher,
      updatedRow: { id: body.invoiceId, status: 'Manual-Matched' },
    });
  } catch (error) {
    console.error('Voucher save error:', error);
    res.status(500).json({ error: 'Failed to save voucher.' });
  }
});

// GET /api/vouchers — List all saved vouchers
app.get('/api/vouchers', (_req, res) => {
  res.json({ count: voucherStore.length, vouchers: voucherStore });
});

// ── GSTR-1 Reconciliation (Sales Register vs GSTR-1 Portal) ──
app.post('/api/reconcile/gstr1', upload.fields([{ name: 'salesFile' }, { name: 'gstr1File' }]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.salesFile || !files.gstr1File) {
      return res.status(400).json({ error: 'Both Sales Register and GSTR-1 files are required.' });
    }

    // Parse Sales Register (Tally export)
    const salesWb   = xlsx.read(files.salesFile[0].buffer, { type: 'buffer' });
    const salesData = xlsx.utils.sheet_to_json(salesWb.Sheets[salesWb.SheetNames[0]]) as any[];

    // Parse GSTR-1 Portal file
    const gstr1Wb   = xlsx.read(files.gstr1File[0].buffer, { type: 'buffer' });
    const gstr1Data = xlsx.utils.sheet_to_json(gstr1Wb.Sheets[gstr1Wb.SheetNames[0]]) as any[];

    const results: any[] = [];
    const matchedPortalIdx = new Set<number>();
    let idCounter = 1;
    const TOLERANCE = 2.00;

    // PASS 1 — Exact Match (GSTIN + Invoice + Amount)
    for (const sr of salesData) {
      const srGstin   = sr['GSTIN/UIN'] || sr['Buyer GSTIN'] || sr['GSTIN'];
      const srInvoice = sr['Voucher Number'] || sr['Invoice No'] || sr['Invoice Number'];
      const srAmount  = parseAmount(sr['Tax Amount'] || sr['IGST'] || sr['CGST']);
      let matched = false;

      for (let i = 0; i < gstr1Data.length; i++) {
        if (matchedPortalIdx.has(i)) continue;
        const g = gstr1Data[i];
        const gGstin   = g['Receiver GSTIN'] || g['GSTIN'] || g['GSTIN/UIN'];
        const gInvoice = g['Invoice Number'] || g['Invoice No'] || g['Voucher Number'];
        const gAmount  = parseAmount(g['Tax Amount'] || g['IGST'] || g['CGST']);

        if (srGstin === gGstin && normalizeString(srInvoice) === normalizeString(gInvoice) && Math.abs(srAmount - gAmount) <= 0.01) {
          results.push({
            id: idCounter++,
            vendor: sr['Party Name'] || g['Receiver Name'] || 'Unknown',
            gstin: srGstin,
            invoiceNo: srInvoice,
            date: sr['Voucher Date'] || g['Invoice Date'],
            prAmount: srAmount,
            gstrAmount: gAmount,
            status: 'Exact Match',
          });
          matchedPortalIdx.add(i);
          sr._matched = true;
          matched = true;
          break;
        }
      }

      // PASS 2 — Fuzzy match for same GSTIN
      if (!matched) {
        for (let i = 0; i < gstr1Data.length; i++) {
          if (matchedPortalIdx.has(i)) continue;
          const g = gstr1Data[i];
          const gGstin  = g['Receiver GSTIN'] || g['GSTIN'] || g['GSTIN/UIN'];
          if (srGstin !== gGstin) continue;

          const gInvoice = g['Invoice Number'] || g['Invoice No'] || g['Voucher Number'];
          const gAmount  = parseAmount(g['Tax Amount'] || g['IGST'] || g['CGST']);
          const srN = normalizeInvoice(srInvoice);
          const gN  = normalizeInvoice(gInvoice);
          const srD = srN.match(/\d+$/)?.[0] || srN;
          const gD  = gN.match(/\d+$/)?.[0] || gN;
          const fuzzy = srN === gN || (srD.length >= 2 && gD.length >= 2 && (srD.includes(gD) || gD.includes(srD)));
          const diff  = Math.abs(srAmount - gAmount);

          if (fuzzy && diff <= TOLERANCE) {
            results.push({
              id: idCounter++,
              vendor: sr['Party Name'] || g['Receiver Name'] || 'Unknown',
              gstin: srGstin,
              invoiceNo: srInvoice,
              date: sr['Voucher Date'] || g['Invoice Date'],
              prAmount: srAmount,
              gstrAmount: gAmount,
              status: diff <= 0.01 ? 'Fuzzy Match' : 'Amount Mismatch',
            });
            matchedPortalIdx.add(i);
            sr._matched = true;
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        results.push({
          id: idCounter++,
          vendor: sr['Party Name'] || 'Unknown',
          gstin: srGstin || 'N/A',
          invoiceNo: srInvoice || 'N/A',
          date: sr['Voucher Date'] || 'N/A',
          prAmount: parseAmount(sr['Tax Amount'] || sr['IGST'] || sr['CGST']),
          gstrAmount: 0,
          status: 'Not In Portal',  // Was Missing in 2B/GSTR-1
        });
      }
    }

    // Sweep GSTR-1 for unmatched portal entries
    for (let i = 0; i < gstr1Data.length; i++) {
      if (!matchedPortalIdx.has(i)) {
        const g = gstr1Data[i];
        results.push({
          id: idCounter++,
          vendor: g['Receiver Name'] || g['Trade Name'] || 'Unknown',
          gstin: g['Receiver GSTIN'] || g['GSTIN'] || 'N/A',
          invoiceNo: g['Invoice Number'] || g['Invoice No'] || 'N/A',
          date: g['Invoice Date'] || 'N/A',
          prAmount: 0,
          gstrAmount: parseAmount(g['Tax Amount'] || g['IGST'] || g['CGST']),
          status: 'Not In Tally', // Was Missing in PR
        });
      }
    }

    results.sort((a, b) => a.status.localeCompare(b.status));

    const summary = {
      totalReconciled: results.filter(r => ['Exact Match','Fuzzy Match','Amount Mismatch'].includes(r.status))
        .reduce((sum, r) => sum + r.gstrAmount, 0),
      itcAtRisk: results.filter(r => r.status === 'Not In Portal').reduce((sum, r) => sum + r.prAmount, 0),
      pendingInvoices: results.filter(r => ['Not In Tally','Not In Portal'].includes(r.status)).length,
      totalTaxSaved: results.reduce((sum, r) => sum + r.gstrAmount, 0),
    };

    res.json({ success: true, summary, data: results });
  } catch (err) {
    console.error('GSTR-1 reconciliation error:', err);
    res.status(500).json({ error: 'Failed to process GSTR-1 files.' });
  }
});

app.get('/health', (req, res) => {
  res.send('GST Reconciliation Engine is healthy 🚀');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
