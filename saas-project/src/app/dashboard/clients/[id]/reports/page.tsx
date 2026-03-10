'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MOCK_CLIENTS } from '@/lib/mock-data';
import Link from 'next/link';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  Loader2,
  BarChart3,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  formats: ('Excel' | 'PDF')[];
  size: string;
  generatedAt: string;
}

const REPORTS: Report[] = [
  {
    id: 'recon',
    title: 'Reconciliation Report',
    description: 'Complete invoice-level matching results — Matched, Missing in Books, Missing in 2B, and Value Mismatch.',
    icon: BarChart3,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    formats: ['Excel', 'PDF'],
    size: '245 KB',
    generatedAt: 'Oct 31, 2024',
  },
  {
    id: 'vendor',
    title: 'Vendor Risk Report',
    description: 'List of vendors who have not filed GSTR-1, with ITC amounts at risk and compliance recommendations.',
    icon: ShieldAlert,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    formats: ['Excel', 'PDF'],
    size: '128 KB',
    generatedAt: 'Oct 31, 2024',
  },
  {
    id: 'itc',
    title: 'ITC Summary',
    description: 'Period-wise ITC claim summary with matched ITC, risk ITC, and net claimable ITC breakdown.',
    icon: TrendingUp,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    formats: ['Excel'],
    size: '89 KB',
    generatedAt: 'Oct 31, 2024',
  },
];

export default function ReportsPage() {
  const { id } = useParams<{ id: string }>();
  const client = MOCK_CLIENTS.find(c => c.id === id) ?? MOCK_CLIENTS[0];
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const handleDownload = (reportId: string, format: string) => {
    const key = `${reportId}-${format}`;
    setDownloading(key);
    setTimeout(() => {
      setDownloading(null);
      setDownloaded(prev => [...prev, key]);
    }, 1500);
  };

  return (
    <DashboardLayout title="Reports" subtitle={client.name}>
      <Link href={`/dashboard/clients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to client
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Downloadable Reports</h2>
          <p className="text-sm text-slate-400">October 2024 Filing Period</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Download All (Excel)
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            <FileText className="w-4 h-4 text-red-500" /> Download All (PDF)
          </button>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {REPORTS.map(report => (
          <div key={report.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover flex flex-col">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${report.iconBg}`}>
              <report.icon className={`w-5 h-5 ${report.iconColor}`} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">{report.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">{report.description}</p>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-3 border-t border-slate-50">
              <span>Generated: {report.generatedAt}</span>
              <span>{report.size}</span>
            </div>

            <div className="flex gap-2">
              {report.formats.map(format => {
                const key = `${report.id}-${format}`;
                const isDownloading = downloading === key;
                const isDone = downloaded.includes(key);
                return (
                  <button
                    key={format}
                    onClick={() => handleDownload(report.id, format)}
                    disabled={isDownloading}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : format === 'Excel'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    } disabled:opacity-60`}
                  >
                    {isDownloading ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                    ) : isDone ? (
                      <><CheckCircle2 className="w-3 h-3" /> Downloaded</>
                    ) : (
                      <><Download className="w-3 h-3" /> {format}</>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Report history */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Report History</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { month: 'Sep 2024', reports: 3, downloads: 6, status: 'complete' },
            { month: 'Aug 2024', reports: 3, downloads: 4, status: 'complete' },
            { month: 'Jul 2024', reports: 2, downloads: 3, status: 'complete' },
            { month: 'Jun 2024', reports: 3, downloads: 5, status: 'complete' },
          ].map(row => (
            <div key={row.month} className="px-5 py-3.5 flex items-center justify-between table-row-hover">
              <div>
                <p className="text-sm font-medium text-slate-900">{row.month} Reconciliation</p>
                <p className="text-xs text-slate-400">{row.reports} reports • {row.downloads} downloads</p>
              </div>
              <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Re-download
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
