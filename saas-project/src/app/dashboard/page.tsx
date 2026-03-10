'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart4,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  RefreshCw,
  Search,
  UploadCloud,
  XCircle,
  Building2,
  Wallet,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// Detailed Mock Data for "Heavy Frontend"
const ADVANCED_STATS = {
  totalTaxLiability: 12500400,
  availableITC: 8500200,
  cashLedgerBalance: 450000,
  pendingGstr3b: 14,
  overdueGstr1: 3,
};

const CHART_DATA = [
  { month: 'May', liability: 2100000, itc: 1800000, cash: 300000 },
  { month: 'Jun', liability: 2400000, itc: 1900000, cash: 500000 },
  { month: 'Jul', liability: 1800000, itc: 1600000, cash: 200000 },
  { month: 'Aug', liability: 2800000, itc: 2100000, cash: 700000 },
  { month: 'Sep', liability: 2200000, itc: 2000000, cash: 200000 },
  { month: 'Oct', liability: 2600000, itc: 1900000, cash: 700000 },
];

const COMPLIANCE_GRID = [
  { id: '1', name: 'Raj Enterprises Pvt Ltd', gstin: '27AADCR4532B1Z1', lastSync: '2 hours ago', gstr1: 'filed', gstr2b: 'recon_done', gstr3b: 'pending' },
  { id: '2', name: 'Metro BuildTech', gstin: '07BBPPM8991C1Z4', lastSync: '1 day ago', gstr1: 'overdue', gstr2b: 'pending', gstr3b: 'pending' },
  { id: '3', name: 'Global Logistics Solutions', gstin: '29AAACG2341D1Z9', lastSync: '10 mins ago', gstr1: 'filed', gstr2b: 'recon_done', gstr3b: 'filed' },
  { id: '4', name: 'TechVision Software', gstin: '24BBBCD5678E1Z2', lastSync: '3 days ago', gstr1: 'filed', gstr2b: 'pending', gstr3b: 'pending' },
  { id: '5', name: 'Sunrise Traders', gstin: '33AAECS1234F1Z5', lastSync: '5 hours ago', gstr1: 'filed', gstr2b: 'recon_done', gstr3b: 'filed' },
];

function StatusDot({ status }: { status: string }) {
  if (status === 'filed' || status === 'recon_done') {
    return <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Completed" />;
  }
  if (status === 'overdue') {
    return <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Overdue" />;
  }
  return <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" title="Pending" />;
}

export default function DashboardPage() {
  return (
    <DashboardLayout title="GST Workspace" subtitle="Complete automated tax & compliance overview">
      
      {/* 1. Global Alert Banner */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-semibold text-red-900">
            Critical Action: 3 clients have overdue GSTR-1 filings for September 2024. Late fees are accumulating.
          </p>
        </div>
        <button className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
          View Defaulters
        </button>
      </div>

      {/* 2. Heavy KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-16 h-16 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tax Liability</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(ADVANCED_STATS.totalTaxLiability)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" /> 12.5% YoY
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available ITC (2B)</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(ADVANCED_STATS.availableITC)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Reconciled
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart4 className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cash Ledger Bal</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(ADVANCED_STATS.cashLedgerBalance)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            Across 45 active GSTINs
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Pending GSTR-3B</p>
          <p className="text-2xl font-black text-amber-900">{ADVANCED_STATS.pendingGstr3b} <span className="text-sm font-medium text-amber-700">clients</span></p>
          <p className="mt-2 text-xs font-medium text-amber-700">Due in 5 days</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Tally Auto-Sync</p>
          <p className="text-2xl font-black text-white">Active</p>
          <p className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-emerald-400" /> Last sync 10 mins ago
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* 3. Advanced Dual Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tax Obligation vs ITC Offset</h2>
              <p className="text-xs text-slate-500">6-Month trailing overview of output liability matched against input credit</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                 <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></div> Output Liab
               </span>
               <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                 <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div> ITC Setup
               </span>
               <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                 <div className="w-2.5 h-2.5 rounded-sm bg-slate-800"></div> Cash Paid
               </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `₹${(v/100000)}L`} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 500 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="liability" name="Output Liability" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="itc" name="ITC Adjusted" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="cash" name="Cash Paid" fill="#1E293B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Quick Actions Heavy Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Task Center</h2>
            <p className="text-xs text-slate-500">Quick automated actions for October 2024</p>
          </div>
          <div className="p-2 flex-1 flex flex-col gap-1">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors text-left group">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                <RefreshCw className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Sync Master Data from Tally</p>
                <p className="text-xs text-slate-500">Pull latest sales & purchase vouchers</p>
              </div>
            </button>

            <Link href="/dashboard/clients/1/upload" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors text-left group">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                <FileCheck className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">GSTR-2B Auto-Reconciliation</p>
                <p className="text-xs text-slate-500">Match 2B with PR and identify risks</p>
              </div>
            </Link>

            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                <UploadCloud className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Smart Document OCR</p>
                <p className="text-xs text-slate-500">Upload PDF invoices to extract data</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group mt-auto">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-800 transition-colors">
                <Download className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Download Consilated JSON</p>
                <p className="text-xs text-slate-500">Export prepared payload for GST portal</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Dense Compliance Grid Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Client Compliance Matrix — Oct 2024
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status of GST filings across all managed clients.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-1.5"><StatusDot status="filed" /> Completed</div>
              <div className="flex items-center gap-1.5"><StatusDot status="pending" /> Pending</div>
              <div className="flex items-center gap-1.5"><StatusDot status="overdue" /> Overdue</div>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                placeholder="Filter clients..." 
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 shadow-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-5 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider">Client Details</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider">GSTR-1 (Sales)</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider">GSTR-2B Recon</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider">GSTR-3B (Filing)</th>
                <th className="px-5 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider text-right">Accounting Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPLIANCE_GRID.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs group-hover:border-indigo-300 transition-colors">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[13px]">{client.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">{client.gstin}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                       <StatusDot status={client.gstr1} />
                       <span className={`text-xs font-semibold ${client.gstr1 === 'overdue' ? 'text-red-600' : client.gstr1 === 'filed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                         {client.gstr1 === 'filed' ? 'Filed' : client.gstr1 === 'overdue' ? 'Overdue (Action Req)' : 'Pending Data Entry'}
                       </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                       <StatusDot status={client.gstr2b} />
                       <span className={`text-xs font-semibold ${client.gstr2b === 'recon_done' ? 'text-emerald-600' : 'text-amber-600'}`}>
                         {client.gstr2b === 'recon_done' ? 'Reconciled (0 Risk)' : 'Pending 2B Fetch'}
                       </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                       <StatusDot status={client.gstr3b} />
                       <span className={`text-xs font-semibold ${client.gstr3b === 'filed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                         {client.gstr3b === 'filed' ? 'Filed Successfully' : 'Ready to File'}
                       </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <p className="text-xs font-medium text-slate-700">Tally Connected</p>
                    <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {client.lastSync}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-center">
          <Link href="/dashboard/clients" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors">
            View Expanded Compliance Matrix <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </DashboardLayout>
  );
}
