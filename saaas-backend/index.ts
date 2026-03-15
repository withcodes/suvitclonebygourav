import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import path from 'path';

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

// ── Dynamic Excel Parsing Utilities ──

// Convert Excel serial dates (e.g. 45778) to JS Dates
const excelDateToJSDate = (serial: number | string) => {
  if (typeof serial === 'number') {
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const dateInfo  = new Date(utc_value * 1000);
    return dateInfo.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  return serial;
};

// Normalize string dates (e.g. 09/05/2025 -> 2025-05-09)
const normalizeDateString = (dateStr: string | number) => {
  if (!dateStr) return 'N/A';
  if (typeof dateStr === 'number') return excelDateToJSDate(dateStr);
  const str = dateStr.toString().trim();
  // Handle DD/MM/YYYY
  const parts = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
  return str;
};

// Dynamic Heuristic Header Scanner & Data Extractor
const parseDynamicSheet = (sheet: xlsx.WorkSheet, sheetName: string) => {
  // Strip hidden control characters (e.g., zero-width spaces)
  const cleanSheetName = sheetName.replace(/[^\x20-\x7E]/g, '').trim().toUpperCase();

  const SKIP_SHEET_NAMES = ['READ ME', 'ITC AVAILABLE', 'ITC NOT AVAILABLE', 'ITC REVERSAL', 'ITC REJECTED'];
  if (SKIP_SHEET_NAMES.some(s => cleanSheetName === s || cleanSheetName.includes(s))) {
    return [];
  }

  // Read absolute raw 2D array
  console.log(`[parseDynamicSheet] Processing ${sheetName} (cleaned: ${cleanSheetName}), !ref = ${sheet['!ref']}`);
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
  console.log(`[parseDynamicSheet] ${sheetName} rawData contains ${rawData.length} rows.`);
  let headerIndex = -1;

  // The keywords that define a true data table inside GST files
  const requiredKeywords = ['GSTIN', 'INVOICE', 'TAXABLE'];
  
  // Scan down to row 20 to find the floating header
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i];
    if (!row) continue;
    const rowString = row.join('').toUpperCase();
    
    // We require these substrings to exist aggressively
    const hasGstin = rowString.includes('GSTIN');
    const hasInvoice = rowString.includes('INVOICE') || rowString.includes('DOCUMENT') || rowString.includes('VOUCHER') || rowString.includes('NOTE');
    const hasTaxable = rowString.includes('TAXABLE') || rowString.includes('TAX PAID') || rowString.includes('AMOUNT');
    
    // Require a cell that STARTS WITH 'GSTIN' (not just contains it in a description)
    const hasGstinHeader = row.some((cell: any) => cell && cell.toString().toUpperCase().trim().startsWith('GSTIN'));
    


    // If it hits header-level match, also verify the NEXT rows look like real GSTIN data (15-char alphanumeric)
    if (hasGstinHeader && (hasInvoice || hasTaxable)) {
      // Quick-verify: does one of the next 3 rows have a GSTIN-looking value?
      let nextRowHasGstinData = false;
      for (let j = 1; j <= 3; j++) {
          const nextRow = rawData[i + j];
          if (nextRow && nextRow.some((cell: any) => {
            const s = cell ? cell.toString().trim() : '';
            const isValid = s.length === 15 && /^[0-9A-Z]+$/.test(s);
            return isValid;
          })) {
              nextRowHasGstinData = true;
              break;
          }
      }

      if (nextRowHasGstinData || i === 0) {
        headerIndex = i;
        break;
      }
    }
  }

  if (headerIndex === -1) {
    console.log(`[parseDynamicSheet] ${sheetName}: No headers found. (rawData length: ${rawData.length})`);
    return [];
  }

  const headers = rawData[headerIndex].map((h: any) => h ? h.toString().trim().replace(/[\n\r]/g, '') : `UNKNOWN_${Math.random()}`);
  const extractedRecords = [];
  
  console.log(`[parseDynamicSheet] ${sheetName}: Found headers on row ${headerIndex+1}:`, headers.filter(h => !h.startsWith('UNKNOWN_')).join(', ').substring(0, 200));

  // Parse pure data rows underneath the found header
  let loggedRows = 0;
  for (let i = headerIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    // Skip completely empty arrays or arrays with no length
    if (!row || row.length === 0 || row.every(cell => cell === "" || cell == null)) continue;

    const record: any = { _sourceSheet: sheetName };
    headers.forEach((header, index) => {
      // Add data mapped to its header
      record[header] = row[index];
    });
    
    // Extra safety: If the record has NO gstin and NO invoice, it's just a rogue totals row or footer
    const possibleGstins = record['GSTIN of supplier'] || record['GSTIN of Supplier'] || record['GSTIN'] || record['GSTIN/UIN'] || record['GSTIN of ECO'] || record['GSTIN of ISD'];
    const possibleInvoices = record['Invoice number'] || record['Invoice Number'] || record['Invoice No'] || record['Voucher Number'] || record['Document number'] || record['Note number'];
    
    const gstinStr = possibleGstins ? possibleGstins.toString().trim() : '';
    const invoiceStr = possibleInvoices ? possibleInvoices.toString().trim() : '';
    
    const isValidGstin = gstinStr.length > 0 && gstinStr.length <= 30;
    const isValidInvoice = invoiceStr.length > 0 && invoiceStr.length <= 50;
    
    if (loggedRows < 3) {
      console.log(`[parseDynamicSheet] ${sheetName} Row ${i+1} check: gstin='${gstinStr}' (valid=${isValidGstin}), invoice='${invoiceStr}' (valid=${isValidInvoice})`);
      loggedRows++;
    }

    if (isValidGstin || isValidInvoice) {
        extractedRecords.push(record);
    }
  }

  console.log(`[parseDynamicSheet] ${sheetName}: Loaded ${extractedRecords.length} records.`);
  return extractedRecords;

  return extractedRecords;
};

// Reconciliation Logic
app.post('/api/reconcile', upload.fields([{ name: 'prFile' }, { name: 'gstr2bFile' }]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.prFile || !files.gstr2bFile) {
        return res.status(400).json({ error: 'Both Purchase Register and GSTR-2B files are required.' });
    }

    // 1. Parse Purchase Register (Dynamically finds headers)
    const tempPrPath = path.join(require('os').tmpdir(), 'temp_pr.xlsx');
    const fs = require('fs');
    fs.writeFileSync(tempPrPath, files.prFile[0].buffer);
    const prWorkbook = xlsx.readFile(tempPrPath);
    
    let prData: any[] = [];
    // Sheets in Tally GSTR-2 export that contain invoice-level data (actual names from file)
    const PR_DATA_SHEETS = ['B2B', 'b2bur', 'cdnr', 'cdnur', 'impg', 'imps'];
    for (const sheetName of prWorkbook.SheetNames) {
        if (PR_DATA_SHEETS.some(s => sheetName.toLowerCase() === s.toLowerCase())) {
            const sheetData = parseDynamicSheet(prWorkbook.Sheets[sheetName], sheetName);
            console.log(`PR sheet [${sheetName}]: ${sheetData.length} rows parsed`);
            prData = prData.concat(sheetData);
        } else {
            console.log(`PR: Skipping non-data sheet: ${sheetName}`);
        }
    }

    // 2. Parse GSTR-2B (Loops all data sheets dynamically)
    const tempGstrPath = path.join(require('os').tmpdir(), 'temp_gstr2b.xlsx');
    fs.writeFileSync(tempGstrPath, files.gstr2bFile[0].buffer);
    const gstrWorkbook = xlsx.readFile(tempGstrPath);
    
    let gstrData: any[] = [];
    // Skip summary/instruction sheets — process ALL other sheets as data sheets
    const GSTR_SKIP_SHEETS = ['Read me', 'ITC Available', 'ITC not available', 'ITC Reversal', 'ITC Rejected'];
    for (const sheetName of gstrWorkbook.SheetNames) {
        if (GSTR_SKIP_SHEETS.some(s => sheetName.toLowerCase() === s.toLowerCase())) {
            console.log(`GSTR-2B: Skipping summary/instruction sheet: ${sheetName}`);
            continue;
        }
        let sheetData = parseDynamicSheet(gstrWorkbook.Sheets[sheetName], sheetName);
        console.log(`GSTR-2B sheet [${sheetName}]: ${sheetData.length} rows parsed`);
        // --- ARCHITECTURE PROTOCOL: Negate Reversals & Amendments ---
        sheetData = sheetData.map(row => {
            const isReversal = sheetName.includes('CDNR') || sheetName.includes('Reversal');
            const isAmendment = sheetName.includes('A'); // B2BA, CDNRA
            
            // For amendments, shift the revised figures into the main figures
            if (isAmendment) {
                if (row['Revised Taxable value (₹)']) row['Taxable Value (₹)'] = row['Revised Taxable value (₹)'];
                if (row['Revised Tax Amount']) row['Tax Amount'] = row['Revised Tax Amount']; // generic fallback
                if (row['Revised Integrated Tax(₹)']) row['Integrated Tax(₹)'] = row['Revised Integrated Tax(₹)'];
                if (row['Revised Central Tax(₹)']) row['Central Tax(₹)'] = row['Revised Central Tax(₹)'];
                if (row['Revised State/UT Tax(₹)']) row['State/UT Tax(₹)'] = row['Revised State/UT Tax(₹)'];
            }

            // For Reversals & Credit Notes, negate the values so they subtract 
            if (isReversal) {
                // Determine absolute tax amount
                let absAmount = parseAmount(row['Tax Amount'] || row['Integrated Tax(₹)'] || row['Central Tax(₹)']);
                if (row['Integrated Tax(₹)'] && row['Central Tax(₹)']) {
                     absAmount = parseAmount(row['Integrated Tax(₹)']) + parseAmount(row['Central Tax(₹)']) + parseAmount(row['State/UT Tax(₹)']);
                }
                row['Tax Amount'] = absAmount * -1; 
                row['Taxable Value (₹)'] = parseAmount(row['Taxable Value (₹)']) * -1;
            }

            return row;
        });

        gstrData = gstrData.concat(sheetData);
    }

    // --- PURITY FILTER: Drop blank rows only — require GSTIN or Invoice to exist ---
    prData = prData.filter(row => {
        // Tally uses 'GSTIN of Supplier' (capital S) and 'Invoice Number' (capital N)
        const gst = String(row['GSTIN of Supplier'] || row['GSTIN/UIN'] || row['GSTIN'] || '').replace(/undefined/g, '').trim();
        const inv = String(row['Invoice Number'] || row['Voucher Number'] || row['Invoice No'] || '').replace(/undefined/g, '').trim();
        return gst.length > 2 || inv.length > 2;
    });

    gstrData = gstrData.filter(row => {
        const gst = String(row['GSTIN of supplier'] || row['GSTIN of Supplier'] || row['GSTIN'] || row['GSTIN of ECO'] || row['GSTIN of ISD'] || '').replace(/undefined/g, '').trim();
        const inv = String(row['Invoice number'] || row['Invoice Number'] || row['Invoice No'] || row['Document number'] || row['Note number'] || '').replace(/undefined/g, '').trim();
        return gst.length > 2 || inv.length > 2;
    });

    console.log("=== RAW PR DATA SAMPLE ===");
    console.log(prData.slice(0, 3));
    console.log("=== RAW GSTR DATA SAMPLE ===");
    console.log(gstrData.slice(0, 3));

    const results = [];
    const matchedGstrIndices = new Set<number>();
    let idCounter = 1;

    const TOLERANCE_LIMIT = 2.00;

    // MULTI-PASS ENGINE

    // PASS 1: Strict Exact Matches
    for (const prRow of prData) {
        // Tally exact column names (confirmed from file analysis)
        const prGstin = prRow['GSTIN of Supplier'] || prRow['GSTIN/UIN'] || prRow['GSTIN'];
        const prInvoice = prRow['Invoice Number'] || prRow['Voucher Number'] || prRow['Invoice No'];
        const prDate = normalizeDateString(prRow['Invoice date'] || prRow['Voucher Date'] || prRow['Invoice Date']);
        const prAmount = parseAmount(prRow['Integrated Tax Paid'] || prRow['Central Tax Paid'] || prRow['Tax Amount'] || 0);
        
        if (!prGstin || prGstin === 'undefined' || !prInvoice || prInvoice === 'undefined') continue;
        
        let pass1Match = false;

        for (let i = 0; i < gstrData.length; i++) {
            if (matchedGstrIndices.has(i)) continue;

            const gstrRow = gstrData[i];
            // GSTR-2B exact column names (confirmed from file analysis)
            const gstrGstin = gstrRow['GSTIN of supplier'] || gstrRow['GSTIN of Supplier'] || gstrRow['GSTIN'] || gstrRow['GSTIN of ECO'] || gstrRow['GSTIN of ISD'];
            // B2B sheet: row 5 header is 'Invoice Details' (parent), actual invoice number col
            const gstrInvoice = gstrRow['Invoice number'] || gstrRow['Invoice Number'] || gstrRow['Invoice Details'] || gstrRow['Document number'] || gstrRow['Note number'];
            const gstrDate = normalizeDateString(gstrRow['Invoice date'] || gstrRow['Invoice Date'] || gstrRow['Document date']);
            // GSTR-2B tax: Integrated Tax(₹) for IGST, Central Tax(₹) for CGST
            const gstrAmount = parseAmount(gstrRow['Integrated Tax(\u20b9)'] || gstrRow['Central Tax(\u20b9)'] || gstrRow['Tax Amount'] || 0);
            
            if (!gstrGstin && !gstrInvoice) continue;

            if (normalizeString(prGstin) === normalizeString(gstrGstin) &&
                normalizeString(prInvoice) === normalizeString(gstrInvoice) &&
                Math.abs(prAmount - gstrAmount) <= 2.0) {
                results.push({
                    id: idCounter++,
                    vendor: prRow['Supplier Name'] || gstrRow['Trade/Legal name'] || prGstin,
                    gstin: prGstin,
                    invoiceNo: prInvoice,
                    date: prDate || gstrDate,
                    prAmount: prAmount,
                    gstrAmount: gstrAmount,
                    status: 'Exact Match',
                    _prRaw: prRow,
                    _gstrRaw: gstrRow
                });
                matchedGstrIndices.add(i);
                pass1Match = true;
                prRow._matched = true;
                break;
            }
        }
    }

    // PASS 2: Fuzzy Invoice Matches & Amount Tolerance
    for (const prRow of prData) {
        if (prRow._matched) continue;

        const prGstin = prRow['GSTIN of Supplier'] || prRow['GSTIN/UIN'] || prRow['GSTIN'];
        const prInvoice = prRow['Invoice Number'] || prRow['Voucher Number'] || prRow['Invoice No'];
        const prDate = normalizeDateString(prRow['Invoice date'] || prRow['Voucher Date']);
        const prAmount = parseAmount(prRow['Integrated Tax Paid'] || prRow['Central Tax Paid'] || prRow['Tax Amount'] || 0);
        
        if (!prGstin || prGstin === 'undefined' || !prInvoice || prInvoice === 'undefined') continue;
        
        let pass2Match = false;

        for (let i = 0; i < gstrData.length; i++) {
            if (matchedGstrIndices.has(i)) continue;

            const gstrRow = gstrData[i];
            const gstrGstin = gstrRow['GSTIN of supplier'] || gstrRow['GSTIN of Supplier'] || gstrRow['GSTIN'] || gstrRow['GSTIN of ECO'] || gstrRow['GSTIN of ISD'];
            
            if (normalizeString(prGstin) !== normalizeString(gstrGstin)) continue;

            // B2B sheet: row 5 header is 'Invoice Details' (parent merged cell)
            const gstrInvoice = gstrRow['Invoice number'] || gstrRow['Invoice Number'] || gstrRow['Invoice Details'] || gstrRow['Document number'] || gstrRow['Note number'];
            const gstrDate = normalizeDateString(gstrRow['Invoice date'] || gstrRow['Invoice Date'] || gstrRow['Document date']);
            const gstrAmount = parseAmount(gstrRow['Integrated Tax(\u20b9)'] || gstrRow['Central Tax(\u20b9)'] || gstrRow['Tax Amount'] || 0);

            const prInvNorm = normalizeInvoice(prInvoice);
            const gstrInvNorm = normalizeInvoice(gstrInvoice);
            
            const prDigits = prInvNorm.match(/\d+$/)?.[0] || prInvNorm;
            const gstrDigits = gstrInvNorm.match(/\d+$/)?.[0] || gstrInvNorm;

            const isFuzzyInvoiceMatch = (prInvNorm.length >= 3 && gstrInvNorm.length >= 3) && (
                                        (prInvNorm === gstrInvNorm) || 
                                        ((prDigits.length >= 2 && gstrDigits.length >= 2) && 
                                        (prDigits.includes(gstrDigits) || gstrDigits.includes(prDigits))) ||
                                        (gstrInvNorm.includes(prInvNorm)) ||
                                        (prInvNorm.includes(gstrInvNorm))
                                      );

            const amountDiff = Math.abs(prAmount - gstrAmount);

            if (isFuzzyInvoiceMatch && amountDiff <= TOLERANCE_LIMIT) {
                results.push({
                    id: idCounter++,
                    vendor: prRow['Supplier Name'] || gstrRow['Trade/Legal name'] || prGstin,
                    gstin: prGstin,
                    invoiceNo: prInvoice,
                    date: prDate || gstrDate,
                    prAmount: prAmount,
                    gstrAmount: gstrAmount,
                    status: amountDiff <= 0.01 ? 'Fuzzy Match' : 'Amount Mismatch',
                    _prRaw: prRow,
                    _gstrRaw: gstrRow
                });
                matchedGstrIndices.add(i);
                pass2Match = true;
                prRow._matched = true;
                break;
            }
        }

        if (!pass2Match) {
            results.push({
                id: idCounter++,
                vendor: prRow['Supplier Name'] || prGstin || 'Unknown',
                gstin: prGstin || 'N/A',
                invoiceNo: prInvoice || 'N/A',
                date: prDate || 'N/A',
                prAmount: prAmount,
                gstrAmount: 0,
                status: 'Missing in 2B',
                _prRaw: prRow
            });
        }
    }

    // 5. Final Pass: Sweep GSTR-2B data for Missing in PR
    for (let i = 0; i < gstrData.length; i++) {
        if (!matchedGstrIndices.has(i)) {
            const gstrRow = gstrData[i];
            const gstrInvoice = gstrRow['Invoice number'] || gstrRow['Invoice Number'] || gstrRow['Invoice Details'] || gstrRow['Document number'] || gstrRow['Note number'];
            const gstrDate = normalizeDateString(gstrRow['Invoice date'] || gstrRow['Invoice Date'] || gstrRow['Document date'] || gstrRow['ISD Document date'] || gstrRow['Note date']);
            const gstrAmount = parseAmount(gstrRow['Integrated Tax(\u20b9)'] || gstrRow['Central Tax(\u20b9)'] || gstrRow['Tax Amount'] || 0);

            results.push({
                id: idCounter++,
                vendor: gstrRow['Trade/Legal name'] || 'Unknown',
                gstin: gstrRow['GSTIN of supplier'] || gstrRow['GSTIN of Supplier'] || gstrRow['GSTIN'] || gstrRow['GSTIN of ECO'] || gstrRow['GSTIN of ISD'] || 'N/A',
                invoiceNo: gstrInvoice || 'N/A',
                date: gstrDate || 'N/A',
                prAmount: 0,
                gstrAmount: gstrAmount,
                status: 'Missing in PR',
                _gstrRaw: gstrRow
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
