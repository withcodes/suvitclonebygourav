import * as XLSX from 'xlsx';
import { MOCK_INVOICES, MOCK_VENDORS, RECONCILIATION_SUMMARY } from './mock-data';
import { formatCurrency } from './utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReconciliationRow {
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  purchaseTaxableValue: number | null;
  gstr2bTaxableValue: number | null;
  gstAmountBooks: number | null;
  gstAmount2B: number | null;
  differenceAmount: number;
  reconciliationStatus: 'Matched' | 'Missing in 2B' | 'Missing in Books' | 'Value Mismatch';
  remarks: string;
}

export interface ReconciliationSummary {
  totalPurchaseITC: number;
  totalITC2B: number;
  itcAtRisk: number;
  totalMatchedInvoices: number;
  totalMissing2B: number;
  totalMissingBooks: number;
  totalValueMismatch: number;
  period: string;
  clientName: string;
  clientGstin: string;
  generatedAt: string;
}

// ─── Status label map ─────────────────────────────────────────────────────────

const STATUS_MAP = {
  matched: 'Matched',
  missing_2b: 'Missing in 2B',
  missing_books: 'Missing in Books',
  value_mismatch: 'Value Mismatch',
} as const;

const REMARKS_MAP = {
  matched: 'Invoice matched in both Purchase Register and GSTR-2B',
  missing_2b: 'Invoice not found in GSTR-2B — vendor may not have filed GSTR-1',
  missing_books: 'Invoice present in GSTR-2B but missing in Purchase Register',
  value_mismatch: 'Tax amount mismatch detected between Purchase Register and GSTR-2B',
} as const;

// ─── Engine: build rows from mock data ───────────────────────────────────────

export function generateReconciliationRows(clientName: string = 'Raj Enterprises Pvt Ltd'): ReconciliationRow[] {
  // Find non-filing vendors for remarks override
  const nonFilingGstins = new Set(
    MOCK_VENDORS.filter(v => v.filingStatus === 'not_filed').map(v => v.gstin)
  );

  return MOCK_INVOICES.map((inv): ReconciliationRow => {
    const isPurchase = inv.source === 'purchase';
    const isMatchedOrMismatch = inv.status === 'matched' || inv.status === 'value_mismatch';
    const mismatch = inv.mismatchAmount ?? 0;

    const purchaseTaxable = isPurchase || isMatchedOrMismatch ? inv.taxableValue : null;
    const gstr2bTaxable = inv.source === '2b' || isMatchedOrMismatch ? inv.taxableValue : null;
    const gstBooks = isPurchase || isMatchedOrMismatch ? inv.gstAmount : null;
    const gst2b = inv.source === '2b' || isMatchedOrMismatch ? inv.gstAmount - (inv.status === 'value_mismatch' ? mismatch : 0) : null;

    let remarks = REMARKS_MAP[inv.status];
    if (inv.status === 'missing_2b' && nonFilingGstins.has(inv.vendorGstin)) {
      remarks = `Vendor has not filed GSTR-1 — ITC of ${formatCurrency(inv.gstAmount)} may be disallowed`;
    }

    return {
      vendorName: inv.vendorName,
      vendorGstin: inv.vendorGstin,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      purchaseTaxableValue: purchaseTaxable,
      gstr2bTaxableValue: gstr2bTaxable,
      gstAmountBooks: gstBooks,
      gstAmount2B: gst2b,
      differenceAmount: mismatch,
      reconciliationStatus: STATUS_MAP[inv.status],
      remarks,
    };
  });
}

export function generateSummary(
  clientName: string,
  clientGstin: string,
  rows: ReconciliationRow[]
): ReconciliationSummary {
  const matched = rows.filter(r => r.reconciliationStatus === 'Matched');
  const missing2B = rows.filter(r => r.reconciliationStatus === 'Missing in 2B');
  const missingBooks = rows.filter(r => r.reconciliationStatus === 'Missing in Books');
  const valueMismatch = rows.filter(r => r.reconciliationStatus === 'Value Mismatch');

  const totalPurchaseITC = rows.reduce((s, r) => s + (r.gstAmountBooks ?? 0), 0);
  const totalITC2B = rows.reduce((s, r) => s + (r.gstAmount2B ?? 0), 0);
  const itcAtRisk = [...missing2B, ...valueMismatch].reduce((s, r) => s + (r.gstAmountBooks ?? 0), 0);

  return {
    totalPurchaseITC,
    totalITC2B,
    itcAtRisk,
    totalMatchedInvoices: matched.length,
    totalMissing2B: missing2B.length,
    totalMissingBooks: missingBooks.length,
    totalValueMismatch: valueMismatch.length,
    period: 'October 2024',
    clientName,
    clientGstin,
    generatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };
}

// ─── Excel generation ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  'Matched': 'FF16A34A',
  'Missing in 2B': 'FFDC2626',
  'Missing in Books': 'FFF59E0B',
  'Value Mismatch': 'FF7C3AED',
};

function currency(n: number | null): string {
  if (n === null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

function formatDateStr(d: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

export function downloadReconciliationExcel(
  clientName: string,
  clientGstin: string
): void {
  const rows = generateReconciliationRows(clientName);
  const summary = generateSummary(clientName, clientGstin, rows);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  const summaryAoA: (string | number)[][] = [
    ['GST RECONCILE — FINAL RECONCILIATION SHEET'],
    [],
    ['Client Name:', summary.clientName],
    ['GSTIN:', summary.clientGstin],
    ['Filing Period:', summary.period],
    ['Generated At:', summary.generatedAt],
    [],
    ['━━━━ RECONCILIATION SUMMARY ━━━━'],
    [],
    ['Metric', 'Value'],
    ['Total Purchase ITC', currency(summary.totalPurchaseITC)],
    ['Total ITC Available in 2B', currency(summary.totalITC2B)],
    ['ITC at Risk', currency(summary.itcAtRisk)],
    ['Total Matched Invoices', summary.totalMatchedInvoices],
    ['Total Missing in 2B', summary.totalMissing2B],
    ['Total Missing in Books', summary.totalMissingBooks],
    ['Total Value Mismatch', summary.totalValueMismatch],
    ['Total Invoices Processed', rows.length],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoA);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Reconciliation Detail ──────────────────────────────────────────
  const headers = [
    'Vendor Name',
    'Vendor GSTIN',
    'Invoice Number',
    'Invoice Date',
    'Purchase Taxable Value',
    'GSTR-2B Taxable Value',
    'GST Amount (Books)',
    'GST Amount (2B)',
    'Difference Amount',
    'Reconciliation Status',
    'Remarks',
  ];

  const data = rows.map(r => [
    r.vendorName,
    r.vendorGstin,
    r.invoiceNumber,
    formatDateStr(r.invoiceDate),
    r.purchaseTaxableValue ?? 0,
    r.gstr2bTaxableValue ?? 0,
    r.gstAmountBooks ?? 0,
    r.gstAmount2B ?? 0,
    r.differenceAmount,
    r.reconciliationStatus,
    r.remarks,
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Column widths
  wsDetail['!cols'] = [
    { wch: 28 }, // Vendor Name
    { wch: 20 }, // GSTIN
    { wch: 18 }, // Invoice No
    { wch: 14 }, // Date
    { wch: 22 }, // Purchase Taxable
    { wch: 22 }, // 2B Taxable
    { wch: 20 }, // GST Books
    { wch: 18 }, // GST 2B
    { wch: 18 }, // Difference
    { wch: 22 }, // Status
    { wch: 55 }, // Remarks
  ];

  // Auto-filter on headers
  wsDetail['!autofilter'] = { ref: `A1:K${rows.length + 1}` };

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Reconciliation Detail');

  // ── Sheet 3: Vendor Risk ─────────────────────────────────────────────────────
  const vendorHeaders = [
    'Vendor Name', 'Vendor GSTIN', 'Filing Status', 'ITC Amount', 'Risk Level', 'Invoices Count', 'Last Filed'
  ];
  const vendorData = MOCK_VENDORS.map(v => [
    v.name, v.gstin,
    v.filingStatus === 'filed' ? 'Filed' : v.filingStatus === 'not_filed' ? 'Not Filed' : 'Partial',
    v.itcAmount, v.riskLevel.toUpperCase(), v.invoiceCount, v.lastFiledMonth
  ]);
  const wsVendor = XLSX.utils.aoa_to_sheet([vendorHeaders, ...vendorData]);
  wsVendor['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsVendor, 'Vendor Risk');

  // ── Write file ────────────────────────────────────────────────────────────
  const fileName = `GST_Reconciliation_${clientName.replace(/\s+/g, '_')}_Oct2024.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export function downloadReconciliationCSV(
  clientName: string,
  clientGstin: string
): void {
  const rows = generateReconciliationRows(clientName);
  const headers = [
    'Vendor Name', 'Vendor GSTIN', 'Invoice Number', 'Invoice Date',
    'Purchase Taxable Value', 'GSTR-2B Taxable Value', 'GST Amount (Books)',
    'GST Amount (2B)', 'Difference Amount', 'Reconciliation Status', 'Remarks',
  ];

  const escape = (v: string | number | null): string => {
    const s = String(v ?? '');
    return s.includes(',') ? `"${s}"` : s;
  };

  const csvRows = [
    headers.map(escape).join(','),
    ...rows.map(r => [
      r.vendorName, r.vendorGstin, r.invoiceNumber, formatDateStr(r.invoiceDate),
      r.purchaseTaxableValue ?? '', r.gstr2bTaxableValue ?? '',
      r.gstAmountBooks ?? '', r.gstAmount2B ?? '',
      r.differenceAmount, r.reconciliationStatus, r.remarks,
    ].map(escape).join(',')),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GST_Reconciliation_${clientName.replace(/\s+/g, '_')}_Oct2024.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
