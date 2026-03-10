'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import { MOCK_CLIENTS, MOCK_INVOICES, RECONCILIATION_SUMMARY } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Filter, Download, CheckCircle, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

type FilterType = 'all' | 'matched' | 'missing_books' | 'missing_2b' | 'value_mismatch';

const filterOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'missing_books', label: 'Missing in Books' },
  { key: 'missing_2b', label: 'Missing in 2B' },
  { key: 'value_mismatch', label: 'Value Mismatch' },
];

const statusIcons = {
  matched: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  missing_books: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  missing_2b: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  value_mismatch: <TrendingDown className="w-3.5 h-3.5 text-purple-500" />,
};

export default function ReconciliationPage() {
  const { id } = useParams<{ id: string }>();
  const client = MOCK_CLIENTS.find(c => c.id === id) ?? MOCK_CLIENTS[0];
  const [filter, setFilter] = useState<FilterType>('all');
  const recon = RECONCILIATION_SUMMARY;

  const invoices = filter === 'all' ? MOCK_INVOICES : MOCK_INVOICES.filter(i => i.status === filter);

  return (
    <DashboardLayout title="Reconciliation Results" subtitle={client.name}>
      <Link href={`/dashboard/clients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to client
      </Link>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Matched', value: recon.matched, color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { label: 'Missing in Books', value: recon.missingBooks, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
          { label: 'Missing in 2B', value: recon.missing2B, color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-4 h-4 text-red-500" /> },
          { label: 'Value Mismatch', value: recon.valueMismatch, color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <TrendingDown className="w-4 h-4 text-purple-500" /> },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs opacity-70">of {recon.total} invoices</p>
          </div>
        ))}
      </div>

      {/* ITC summary bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-900">ITC Distribution</span>
          <span className="text-xs text-slate-400">Total: {formatCurrency(recon.totalITC)}</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <div className="bg-green-500 rounded-l-full transition-all"
            style={{ width: `${(recon.matchedITC / recon.totalITC) * 100}%` }}></div>
          <div className="bg-red-400 rounded-r-full transition-all"
            style={{ width: `${(recon.riskITC / recon.totalITC) * 100}%` }}></div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            Matched ITC: <strong>{formatCurrency(recon.matchedITC)}</strong>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            Risk ITC: <strong>{formatCurrency(recon.riskITC)}</strong>
          </div>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 flex-wrap">
            {filterOptions.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === f.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {f.label}
                {f.key !== 'all' && (
                  <span className="ml-1.5 text-slate-400">
                    ({MOCK_INVOICES.filter(i => i.status === f.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 font-medium">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Taxable Value</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">GST Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mismatch</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className={`table-row-hover border-b border-slate-50 last:border-0 ${
                  inv.status !== 'matched' ? 'bg-red-50/20' : ''
                }`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900 text-xs">{inv.vendorName}</p>
                    <p className="text-xs text-slate-400 font-mono">{inv.vendorGstin}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-medium text-xs">{formatCurrency(inv.taxableValue)}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 text-xs">{formatCurrency(inv.gstAmount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inv.source === 'purchase' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {inv.source === 'purchase' ? 'Purchase' : 'GSTR-2B'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[inv.status]}
                      <Badge value={inv.status} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {inv.mismatchAmount ? (
                      <span className="text-xs font-semibold text-red-600">
                        {formatCurrency(inv.mismatchAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-200 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Showing {invoices.length} invoices</p>
          <p className="text-xs text-slate-500 font-medium">
            Last reconciled: <span className="text-slate-700">Oct 31, 2024</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
