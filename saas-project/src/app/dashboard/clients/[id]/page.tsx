'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { MOCK_CLIENTS, MOCK_INVOICES, MOCK_VENDORS, RECONCILIATION_SUMMARY } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  FileText,
  CheckCircle,
  Upload,
  BarChart3,
  ArrowRight,
  Building2,
  Shield,
} from 'lucide-react';

const tabs = ['Overview', '2B Reconciliation', 'Purchase Register', 'Vendor Status', 'Reports'];

export default function ClientWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Overview');

  const client = MOCK_CLIENTS.find(c => c.id === id) ?? MOCK_CLIENTS[0];
  const invoices = MOCK_INVOICES;
  const vendors = MOCK_VENDORS;
  const reconSummary = RECONCILIATION_SUMMARY;

  return (
    <DashboardLayout title={client.name} subtitle={`GSTIN: ${client.gstin}`}>
      {/* Client header card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 mb-5 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{client.name}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-blue-200 text-sm font-mono">{client.gstin}</span>
                <span className="text-blue-300 text-xs">•</span>
                <span className="text-blue-200 text-sm">{client.industry}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/clients/${id}/upload`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl transition-all border border-white/20">
              <Upload className="w-4 h-4" /> Upload Files
            </Link>
            <Link href={`/dashboard/clients/${id}/reports`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-all">
              <BarChart3 className="w-4 h-4" /> Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total ITC" value={formatCurrency(client.totalITC)} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" />
            <StatCard title="ITC at Risk" value={formatCurrency(client.riskAmount)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
            <StatCard title="Matched Invoices" value={String(reconSummary.matched)} change={`${reconSummary.matched}/${reconSummary.total}`} changeType="positive" icon={CheckCircle} iconColor="text-blue-600" iconBg="bg-blue-50" />
            <StatCard title="Pending Recon" value={String(client.pendingRecon)} icon={FileText} iconColor="text-amber-600" iconBg="bg-amber-50" />
          </div>
          {/* Risk alert */}
          {client.riskAmount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">ITC Risk Detected</p>
                <p className="text-sm text-red-700 mt-0.5">
                  2 vendors have not filed GSTR-1. Total ITC at risk:{' '}
                  <strong>{formatCurrency(client.riskAmount)}</strong>. Follow up before filing GSTR-3B.
                </p>
                <Link href={`/dashboard/clients/${id}/vendors`}
                  className="inline-flex items-center gap-1 text-xs text-red-600 font-medium mt-2 hover:underline">
                  View vendor compliance <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: `upload`, label: 'Upload GSTR-2B & Register', icon: Upload, desc: 'Upload files to start reconciliation' },
              { href: `reconciliation`, label: 'View Reconciliation', icon: CheckCircle, desc: `${reconSummary.total} invoices processed` },
              { href: `vendors`, label: 'Vendor Compliance', icon: Shield, desc: `${vendors.filter(v => v.filingStatus !== 'filed').length} vendors at risk` },
            ].map(action => (
              <Link key={action.label} href={`/dashboard/clients/${id}/${action.href}`}
                className="bg-white rounded-xl border border-slate-100 p-4 card-hover shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === '2B Reconciliation' && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Reconciliation Results</h3>
              <Link href={`/dashboard/clients/${id}/reconciliation`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Full view <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice No</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Vendor</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">GST</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 6).map(inv => (
                    <tr key={inv.id} className="border-b border-slate-50 table-row-hover">
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3">
                        <p className="text-slate-900 font-medium">{inv.vendorName}</p>
                        <p className="text-xs text-slate-400 font-mono">{inv.vendorGstin}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{formatCurrency(inv.gstAmount)}</td>
                      <td className="px-5 py-3"><Badge value={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Purchase Register' && (
        <div className="animate-fade-in bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">Purchase Register</h3>
          <p className="text-sm text-slate-400 mb-4">{invoices.filter(i => i.source === 'purchase').length} invoices from purchase register</p>
          <Link href={`/dashboard/clients/${id}/upload`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
            <Upload className="w-4 h-4" /> Upload New File
          </Link>
        </div>
      )}

      {activeTab === 'Vendor Status' && (
        <div className="animate-fade-in">
          <Link href={`/dashboard/clients/${id}/vendors`}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Vendor Filing Status</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Vendor</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">GSTIN</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">ITC Amount</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.slice(0, 5).map(v => (
                      <tr key={v.id} className="border-b border-slate-50 table-row-hover">
                        <td className="px-5 py-3 font-medium text-slate-900">{v.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{v.gstin}</td>
                        <td className="px-5 py-3"><Badge value={v.filingStatus} /></td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{formatCurrency(v.itcAmount)}</td>
                        <td className="px-5 py-3"><Badge value={v.riskLevel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Link>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="animate-fade-in">
          <Link href={`/dashboard/clients/${id}/reports`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Reconciliation Report', desc: 'Full invoice-by-invoice match results', formats: ['Excel', 'PDF'] },
                { title: 'Vendor Risk Report', desc: 'Non-compliant vendors & ITC at risk', formats: ['Excel', 'PDF'] },
                { title: 'ITC Summary', desc: 'Period-wise ITC claim summary', formats: ['Excel'] },
              ].map(r => (
                <div key={r.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 card-hover">
                  <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-1">{r.title}</h4>
                  <p className="text-xs text-slate-400 mb-3">{r.desc}</p>
                  <div className="flex gap-2">
                    {r.formats.map(f => (
                      <span key={f} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
