'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import { MOCK_CLIENTS, MOCK_VENDORS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react';

export default function VendorsPage() {
  const { id } = useParams<{ id: string }>();
  const client = MOCK_CLIENTS.find(c => c.id === id) ?? MOCK_CLIENTS[0];
  const [search, setSearch] = useState('');

  const vendors = MOCK_VENDORS.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.gstin.toLowerCase().includes(search.toLowerCase())
  );

  const highRisk = MOCK_VENDORS.filter(v => v.filingStatus === 'not_filed');
  const mediumRisk = MOCK_VENDORS.filter(v => v.filingStatus === 'partial');
  const totalRiskITC = MOCK_VENDORS.filter(v => v.filingStatus !== 'filed').reduce((s, v) => s + v.itcAmount, 0);

  return (
    <DashboardLayout title="Vendor Compliance" subtitle={client.name}>
      <Link href={`/dashboard/clients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to client
      </Link>

      {/* Risk summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">High Risk</span>
          </div>
          <p className="text-2xl font-black text-red-700">{highRisk.length} vendors</p>
          <p className="text-sm text-red-600 mt-1">
            ITC at risk: <strong>{formatCurrency(highRisk.reduce((s, v) => s + v.itcAmount, 0))}</strong>
          </p>
          <p className="text-xs text-red-500 mt-0.5">GSTR-1 not filed</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Medium Risk</span>
          </div>
          <p className="text-2xl font-black text-amber-700">{mediumRisk.length} vendors</p>
          <p className="text-sm text-amber-600 mt-1">
            ITC at risk: <strong>{formatCurrency(mediumRisk.reduce((s, v) => s + v.itcAmount, 0))}</strong>
          </p>
          <p className="text-xs text-amber-500 mt-0.5">Partial filing</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Compliant</span>
          </div>
          <p className="text-2xl font-black text-green-700">{MOCK_VENDORS.filter(v => v.filingStatus === 'filed').length} vendors</p>
          <p className="text-sm text-green-600 mt-1">GSTR-1 filed on time</p>
          <p className="text-xs text-green-500 mt-0.5">No ITC risk</p>
        </div>
      </div>

      {/* Alerts for non-filers */}
      {highRisk.length > 0 && (
        <div className="space-y-2 mb-5">
          {highRisk.map(v => (
            <div key={v.id} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  {v.name} has not filed GSTR-1
                </p>
                <p className="text-sm text-red-700">
                  ITC of <strong>{formatCurrency(v.itcAmount)}</strong> may be disallowed. Last filed: {v.lastFiledMonth}.
                </p>
                <p className="text-xs text-red-600 mt-0.5 font-medium">
                  → Recommendation: Follow up with vendor before filing GSTR-3B.
                </p>
              </div>
              <span className="font-mono text-xs text-red-400 flex-shrink-0">{v.gstin}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total risk banner */}
      <div className="bg-slate-900 rounded-xl p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-300">Total ITC at Risk</p>
          <p className="text-2xl font-black text-white">{formatCurrency(totalRiskITC)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Filing GSTR-3B?</p>
          <p className="text-sm text-amber-400 font-semibold">Resolve vendor issues first to protect your ITC claim.</p>
        </div>
      </div>

      {/* Vendor table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
          <h3 className="font-semibold text-slate-900">All Vendors ({MOCK_VENDORS.length})</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search vendor..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 transition-all" />
            </div>
            <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Vendor Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">GSTIN</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Filing Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Last Filed</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">ITC Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk Level</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id} className={`table-row-hover border-b border-slate-50 last:border-0 ${v.filingStatus !== 'filed' ? 'bg-red-50/20' : ''}`}>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{v.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{v.gstin}</td>
                  <td className="px-5 py-3.5"><Badge value={v.filingStatus} /></td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{v.lastFiledMonth}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold ${v.filingStatus !== 'filed' ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatCurrency(v.itcAmount)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><Badge value={v.riskLevel} /></td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{v.invoiceCount} invoices</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
