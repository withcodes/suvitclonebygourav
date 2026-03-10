'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import { MOCK_CLIENTS } from '@/lib/mock-data';
import {
  generateReconciliationRows,
  generateSummary,
  downloadReconciliationExcel,
  downloadReconciliationCSV,
  ReconciliationRow,
} from '@/lib/reconciliation-engine';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText as FileCsv,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  Loader2,
  Eye,
  Table,
} from 'lucide-react';

const STATUS_BADGE_MAP: Record<string, 'matched' | 'missing_2b' | 'missing_books' | 'value_mismatch'> = {
  'Matched': 'matched',
  'Missing in 2B': 'missing_2b',
  'Missing in Books': 'missing_books',
  'Value Mismatch': 'value_mismatch',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'Matched': <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
  'Missing in 2B': <XCircle className="w-3.5 h-3.5 text-red-500" />,
  'Missing in Books': <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  'Value Mismatch': <TrendingDown className="w-3.5 h-3.5 text-purple-500" />,
};

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function FinalSheetPage() {
  const { id } = useParams<{ id: string }>();
  const client = MOCK_CLIENTS.find(c => c.id === id) ?? MOCK_CLIENTS[0];
  const rows = generateReconciliationRows(client.name);
  const summary = generateSummary(client.name, client.gstin, rows);

  const [filter, setFilter] = useState<'all' | ReconciliationRow['reconciliationStatus']>('all');
  const [downloading, setDownloading] = useState<'excel' | 'csv' | null>(null);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.reconciliationStatus === filter);

  const handleDownload = (type: 'excel' | 'csv') => {
    setDownloading(type);
    setTimeout(() => {
      if (type === 'excel') downloadReconciliationExcel(client.name, client.gstin);
      else downloadReconciliationCSV(client.name, client.gstin);
      setDownloading(null);
    }, 800);
  };

  const filterOpts: { key: typeof filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: rows.length },
    { key: 'Matched', label: 'Matched', count: rows.filter(r => r.reconciliationStatus === 'Matched').length },
    { key: 'Missing in 2B', label: 'Missing in 2B', count: rows.filter(r => r.reconciliationStatus === 'Missing in 2B').length },
    { key: 'Missing in Books', label: 'Missing in Books', count: rows.filter(r => r.reconciliationStatus === 'Missing in Books').length },
    { key: 'Value Mismatch', label: 'Value Mismatch', count: rows.filter(r => r.reconciliationStatus === 'Value Mismatch').length },
  ];

  return (
    <DashboardLayout title="Final Reconciliation Sheet" subtitle={client.name}>
      <Link href={`/dashboard/clients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to client
      </Link>

      {/* Header actions */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Table className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Reconciliation Report — October 2024</h2>
          </div>
          <p className="text-sm text-slate-400">
            {rows.length} invoices processed • Generated {summary.generatedAt}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleDownload('excel')}
            disabled={!!downloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 shadow-sm"
          >
            {downloading === 'excel' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Excel...</>
            ) : (
              <><FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)</>
            )}
          </button>
          <button
            onClick={() => handleDownload('csv')}
            disabled={!!downloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 shadow-sm"
          >
            {downloading === 'csv' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating CSV...</>
            ) : (
              <><FileCsv className="w-4 h-4" /> Download CSV</>
            )}
          </button>
        </div>
      </div>

      {/* Summary section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm font-semibold text-white">Reconciliation Summary</h3>
          <span className="text-slate-500 text-xs ml-auto">Client GSTIN: {client.gstin}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            label="Total Purchase ITC"
            value={formatCurrency(summary.totalPurchaseITC)}
            color="bg-blue-900 border-blue-700 text-blue-100"
          />
          <SummaryCard
            label="ITC in 2B"
            value={formatCurrency(summary.totalITC2B)}
            color="bg-indigo-900 border-indigo-700 text-indigo-100"
          />
          <SummaryCard
            label="ITC at Risk"
            value={formatCurrency(summary.itcAtRisk)}
            color="bg-red-900 border-red-700 text-red-100"
          />
          <SummaryCard
            label="Matched"
            value={String(summary.totalMatchedInvoices)}
            sub="invoices"
            color="bg-green-900 border-green-700 text-green-100"
          />
          <SummaryCard
            label="Missing in 2B"
            value={String(summary.totalMissing2B)}
            sub="invoices"
            color="bg-red-900 border-red-700 text-red-100"
          />
          <SummaryCard
            label="Missing in Books"
            value={String(summary.totalMissingBooks)}
            sub="invoices"
            color="bg-amber-900 border-amber-700 text-amber-100"
          />
        </div>
      </div>

      {/* ITC risk banner */}
      {summary.itcAtRisk > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              ⚠ ITC Risk Alert — {formatCurrency(summary.itcAtRisk)} at risk
            </p>
            <p className="text-sm text-red-700">
              {summary.totalMissing2B} invoices missing in GSTR-2B and {summary.totalValueMismatch} value mismatches detected.
              Resolve these before filing GSTR-3B to avoid ITC reversal.
            </p>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex gap-1 bg-slate-50 rounded-lg p-1 flex-wrap">
            {filterOpts.map(o => (
              <button
                key={o.key}
                onClick={() => setFilter(o.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === o.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {o.label} <span className="text-slate-400 ml-0.5">({o.count})</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => handleDownload('excel')}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {[
                  'Vendor Name', 'GSTIN', 'Invoice No', 'Date',
                  'Purchase Taxable', '2B Taxable', 'GST (Books)',
                  'GST (2B)', 'Difference', 'Status', 'Remarks'
                ].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-50 last:border-0 table-row-hover ${
                    row.reconciliationStatus !== 'Matched' ? 'bg-red-50/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap text-xs">{row.vendorName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{row.vendorGstin}</td>
                  <td className="px-4 py-3 font-mono font-medium text-xs text-slate-700 whitespace-nowrap">{row.invoiceNumber}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.invoiceDate))}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 text-right whitespace-nowrap">
                    {row.purchaseTaxableValue != null ? formatCurrency(row.purchaseTaxableValue) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 text-right whitespace-nowrap">
                    {row.gstr2bTaxableValue != null ? formatCurrency(row.gstr2bTaxableValue) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900 text-right whitespace-nowrap">
                    {row.gstAmountBooks != null ? formatCurrency(row.gstAmountBooks) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900 text-right whitespace-nowrap">
                    {row.gstAmount2B != null ? formatCurrency(row.gstAmount2B) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {row.differenceAmount > 0 ? (
                      <span className="text-xs font-bold text-red-600">{formatCurrency(row.differenceAmount)}</span>
                    ) : (
                      <span className="text-slate-200 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICONS[row.reconciliationStatus]}
                      <Badge value={STATUS_BADGE_MAP[row.reconciliationStatus] ?? 'matched'} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                    <span className="block truncate" title={row.remarks}>{row.remarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Showing {filtered.length} of {rows.length} invoices</p>
          <p className="text-xs text-slate-500">
            Filing Period: <strong>October 2024</strong> • GSTIN: <strong className="font-mono">{client.gstin}</strong>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
