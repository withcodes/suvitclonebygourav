import { ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, FileWarning, IndianRupee } from 'lucide-react';
import type { SummaryStats } from '../App';
import { formatLakh } from '../utils/gst';

interface DashboardStatsProps {
  summary: SummaryStats | null;
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  const isLoaded = summary !== null;

  const stats = [
    {
      label: 'ITC Matched',
      value: isLoaded ? formatLakh(summary.totalReconciled) : '₹0',
      sub: isLoaded ? 'Exact matches' : 'Waiting…',
      positive: true,
      icon: CheckCircle,
      kpi: 'kpi-emerald',
      iconColor: '#0ea5e9', // cyan-500
    },
    {
      label: 'ITC at Risk',
      value: isLoaded ? formatLakh(summary.itcAtRisk) : '₹0',
      sub: isLoaded ? 'Action required' : 'Waiting…',
      positive: isLoaded ? summary.itcAtRisk === 0 : true,
      icon: XCircle,
      kpi: 'kpi-rose',
      iconColor: '#ef4444',
    },
    {
      label: 'Pending Invoices',
      value: isLoaded ? String(summary.pendingInvoices) : '0',
      sub: isLoaded ? 'Needs review' : 'Waiting…',
      positive: isLoaded ? summary.pendingInvoices === 0 : true,
      icon: FileWarning,
      kpi: 'kpi-amber',
      iconColor: '#f97316',
    },
    {
      label: 'Total 2B ITC',
      value: isLoaded ? formatLakh(summary.totalTaxSaved) : '₹0',
      sub: isLoaded ? 'Available ITC' : 'Waiting…',
      positive: true,
      icon: IndianRupee,
      kpi: 'kpi-blue',
      iconColor: '#8b5cf6', // purple-500
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
      {stats.map((s, i) => (
        <div key={i} className={`kpi-card ${s.kpi} p-5`}>
          {/* Icon + trend */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: `${s.iconColor}20`, border: `1px solid ${s.iconColor}30` }}
            >
              <s.icon size={20} style={{ color: s.iconColor }} />
            </div>
            <span
              className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                background: s.positive ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                color: s.positive ? '#10b981' : '#f43f5e',
              }}
            >
              {s.positive
                ? <ArrowUpRight size={12} />
                : <ArrowDownRight size={12} />}
              {s.positive ? 'Good' : 'Risk'}
            </span>
          </div>

          {/* Values */}
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {s.label}
          </p>
          <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {s.value}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
