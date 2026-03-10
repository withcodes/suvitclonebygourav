'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CloudLightning,
  Download,
  FileCheck,
  FileSignature,
  FileText,
  Lock,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function GSTR3BPage() {
  const [activeTab, setActiveTab] = useState<'3.1_outward' | '4_itc' | '5_exempt' | '5.1_late_fee'>('3.1_outward');
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <DashboardLayout title="GSTR-3B Filing" subtitle="Prepare, validate, and file returns to the GST Portal">

      {/* Top Meta Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Select Client</p>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
              Raj Enterprises Pvt Ltd <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Return Period</p>
            <p className="text-sm font-bold text-slate-900">October 2024</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Status</p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Filing
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <CloudLightning className={`w-4 h-4 ${syncing ? 'animate-pulse' : ''}`} /> 
            {syncing ? 'Fetching...' : 'Auto-Fill from 1 & 2B'}
          </button>
        </div>
      </div>

      {/* Stepper Wizard */}
      <div className="mb-6 flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        {[
          { step: 1, label: 'Prepare Liability', status: 'done' },
          { step: 2, label: 'Calculate ITC', status: 'done' },
          { step: 3, label: 'Review Summary', status: 'active' },
          { step: 4, label: 'Offset & Pay Tax', status: 'pending' },
          { step: 5, label: 'File with EVC', status: 'pending' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              s.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' :
              s.status === 'active' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' :
              'bg-white border-slate-300 text-slate-400'
            }`}>
              {s.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-white" /> : s.step}
            </div>
            <span className={`text-xs font-semibold ${s.status === 'active' ? 'text-indigo-900' : s.status === 'done' ? 'text-slate-700' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Left Side: Dense Tables */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/50">
              {[
                { id: '3.1_outward', label: '3.1 Outward Supplies', count: '₹2.1M Liab' },
                { id: '4_itc', label: '4. Eligible ITC', count: '₹1.8M ITC' },
                { id: '5_exempt', label: '5. Exempt', count: '₹0' },
                { id: '5.1_late_fee', label: '5.1 Interest & Late Fee', count: '₹0' },
              ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                     activeTab === tab.id 
                     ? 'border-indigo-600 text-indigo-700 bg-white' 
                     : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                   }`}
                 >
                   {tab.label}
                   <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{tab.count}</span>
                 </button>
              ))}
            </div>

            {/* Table Content - Dense Data */}
            <div className="flex-1 overflow-auto p-0">
               <table className="w-full text-sm text-right">
                 <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200">
                   <tr>
                     <th className="px-4 py-2.5 text-left font-bold text-slate-700 text-xs w-[40%]">Nature of Supplies</th>
                     <th className="px-4 py-2.5 font-bold text-slate-700 text-xs">Total Taxable Value</th>
                     <th className="px-4 py-2.5 font-bold text-slate-700 text-xs">Integrated Tax (IGST)</th>
                     <th className="px-4 py-2.5 font-bold text-slate-700 text-xs">Central Tax (CGST)</th>
                     <th className="px-4 py-2.5 font-bold text-slate-700 text-xs">State/UT Tax (SGST)</th>
                     <th className="px-4 py-2.5 font-bold text-slate-700 text-xs">Cess</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-mono text-xs">
                   {/* 3.1 Data Row Example */}
                   <tr className="hover:bg-slate-50 group">
                     <td className="px-4 py-3.5 text-left font-sans text-slate-700 text-sm border-r border-slate-100">(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 15,40,000.00</td>
                     <td className="px-4 py-3.5 bg-white">₹ 1,80,000.00</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 48,600.00</td>
                     <td className="px-4 py-3.5 bg-white">₹ 48,600.00</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 group">
                     <td className="px-4 py-3.5 text-left font-sans text-slate-700 text-sm border-r border-slate-100">(b) Outward taxable supplies (zero rated)</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-white">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-white">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 group">
                     <td className="px-4 py-3.5 text-left font-sans text-slate-700 text-sm border-r border-slate-100">(c) Other outward supplies (Nil rated, exempted)</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-white">—</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">—</td>
                     <td className="px-4 py-3.5 bg-white">—</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">—</td>
                   </tr>
                   <tr className="hover:bg-slate-50 group">
                     <td className="px-4 py-3.5 text-left font-sans text-slate-700 text-sm border-r border-slate-100">(d) Inward supplies (liable to reverse charge)</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 1,20,000.00</td>
                     <td className="px-4 py-3.5 bg-white">₹ 21,600.00</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-white">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 group">
                     <td className="px-4 py-3.5 text-left font-sans text-slate-700 text-sm border-r border-slate-100">(e) Non-GST outward supplies</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">₹ 0.00</td>
                     <td className="px-4 py-3.5 bg-white">—</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">—</td>
                     <td className="px-4 py-3.5 bg-white">—</td>
                     <td className="px-4 py-3.5 bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">—</td>
                   </tr>
                   
                   {/* Total Row */}
                   <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                     <td className="px-4 py-4 text-left font-bold text-indigo-900 text-sm">Total Value</td>
                     <td className="px-4 py-4 font-bold text-indigo-900">₹ 16,60,000.00</td>
                     <td className="px-4 py-4 font-bold text-indigo-900">₹ 2,01,600.00</td>
                     <td className="px-4 py-4 font-bold text-indigo-900">₹ 48,600.00</td>
                     <td className="px-4 py-4 font-bold text-indigo-900">₹ 48,600.00</td>
                     <td className="px-4 py-4 font-bold text-indigo-900">₹ 0.00</td>
                   </tr>
                 </tbody>
               </table>
            </div>

            <div className="p-3 border-t border-slate-200 bg-amber-50/50 flex items-center gap-2 text-xs text-amber-700">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Wait for GSTR-2B to generate fully on the 14th before utilizing ITC.
            </div>
          </div>
        </div>

        {/* Right Side: Execution Context */}
        <div className="xl:col-span-1 space-y-4">
          
          {/* Summary Box */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
            </div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Tax Offset Summary</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <span className="text-sm text-slate-400">Total Output Tax Liability</span>
                <span className="text-lg font-bold font-mono">₹ 2,98,800</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <span className="text-sm text-slate-400">(-) Eligible ITC (Table 4)</span>
                <span className="text-lg font-bold font-mono text-emerald-400">₹ 2,10,000</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-sm font-bold text-white">Net Tax Payable (Cash)</span>
                <span className="text-2xl font-black font-mono text-white tracking-tight">₹ 88,800</span>
              </div>
            </div>
          </div>

          {/* Ledger Balances */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-400" /> Electronic Ledger Balances
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">IGST</span>
                <span className="text-sm font-bold font-mono text-slate-900">₹ 45,000</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">CGST</span>
                <span className="text-sm font-bold font-mono text-slate-900">₹ 1,500</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">SGST</span>
                <span className="text-sm font-bold font-mono text-slate-900">₹ 1,500</span>
              </div>
              <button className="w-full mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 text-center py-1">
                Create Challan (₹ 40,800 shortfall)
              </button>
            </div>
          </div>

          {/* Filing Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col gap-2">
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm">
              <Download className="w-4 h-4" /> Save GSTR-3B Draft to Portal
            </button>
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md shadow-indigo-500/30">
              <FileSignature className="w-4 h-4" /> Proceed to Offset & File
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 px-2 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secure EVC/DSC integration active.
            </p>
          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}
