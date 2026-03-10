import { ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, FileWarning, IndianRupee } from 'lucide-react';
import type { SummaryStats } from '../App';

interface DashboardStatsProps {
  summary: SummaryStats | null;
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  // Use real data if available, else zero out or show placeholders
  const isDataLoaded = summary !== null;
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const stats = [
    { 
      label: 'ITC Claimed (Exact Match)', 
      value: isDataLoaded ? formatCurrency(summary.totalReconciled) : '₹0', 
      trend: isDataLoaded ? 'Matched' : 'Waiting', 
      positive: true,
      icon: CheckCircle,
      textColor: 'text-white',
      bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'ITC at Risk (Missing 2B)', 
      value: isDataLoaded ? formatCurrency(summary.itcAtRisk) : '₹0', 
      trend: isDataLoaded ? 'Action Req' : 'Waiting', 
      positive: !isDataLoaded || summary.itcAtRisk === 0,
      icon: XCircle,
      textColor: 'text-white',
      bgGradient: 'bg-gradient-to-br from-rose-500 to-red-600',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'Pending Invoices', 
      value: isDataLoaded ? summary.pendingInvoices.toString() : '0', 
      trend: isDataLoaded ? 'Total' : 'Waiting', 
      positive: !isDataLoaded || summary.pendingInvoices === 0,
      icon: FileWarning,
      textColor: 'text-white',
      bgGradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'Total Portal ITC (2B)', 
      value: isDataLoaded ? formatCurrency(summary.totalTaxSaved) : '₹0', 
      trend: isDataLoaded ? 'Available' : 'Waiting', 
      positive: true,
      icon: IndianRupee,
      textColor: 'text-white',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconBg: 'bg-white/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className={`${stat.bgGradient} ${stat.textColor} rounded-2xl p-6 shadow-lg shadow-slate-200/50 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`${stat.iconBg} p-3 rounded-xl backdrop-blur-sm`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
              {stat.positive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {stat.trend}
            </span>
          </div>
          <h3 className="text-white/80 font-medium text-sm">{stat.label}</h3>
          <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
