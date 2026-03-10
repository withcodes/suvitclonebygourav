'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { MOCK_CLIENTS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { BarChart3, Download, TrendingUp, ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const clientReportData = MOCK_CLIENTS.map(c => ({
  name: c.name.split(' ')[0],
  itc: c.totalITC,
  risk: c.riskAmount,
}));

export default function DashboardReportsPage() {
  return (
    <DashboardLayout title="Reports" subtitle="Portfolio overview">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* ITC by client bar chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">ITC by Client</h2>
              <p className="text-xs text-slate-400">October 2024</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientReportData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v) => [formatCurrency(Number(v)), '']} />
              <Bar dataKey="itc" name="Total ITC" radius={[6, 6, 0, 0]}>
                {clientReportData.map((_, i) => (
                  <Cell key={i} fill={['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk ITC chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">ITC Risk by Client</h2>
              <p className="text-xs text-slate-400">October 2024</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientReportData.filter(c => c.risk > 0)} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: number) => [formatCurrency(v), '']} />
              <Bar dataKey="risk" name="Risk ITC" fill="#DC2626" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client-wise report access */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Client Reports</h3>
          <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">
            <Download className="w-3.5 h-3.5" /> Export All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Industry</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Total ITC</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk ITC</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Reports</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLIENTS.map(c => (
                <tr key={c.id} className="border-b border-slate-50 table-row-hover">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.industry}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {c.totalITC > 0 ? formatCurrency(c.totalITC) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {c.riskAmount > 0
                      ? <span className="font-medium text-red-600">{formatCurrency(c.riskAmount)}</span>
                      : <span className="text-green-600 text-xs">No risk</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/clients/${c.id}/reports`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                      View Reports <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
