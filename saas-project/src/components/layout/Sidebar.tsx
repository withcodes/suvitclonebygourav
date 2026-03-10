'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Calculator,
  FileText,
  RefreshCw,
  Database,
  BarChart4,
  Briefcase,
  AlertCircle,
  FileDown,
  FileCheck,
  Building2,
  Cpu,
  LogOut,
  ChevronDown
} from 'lucide-react';

const MENU_GROUPS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { name: 'Client Master', icon: Building2, href: '/dashboard/clients' },
    ]
  },
  {
    title: 'Data Ingestion',
    items: [
      { name: 'Smart Data Entry', icon: Cpu, href: '/dashboard/data-entry' },
      { name: 'Accounting Sync', icon: RefreshCw, href: '/dashboard/sync' },
      { name: 'Bank Recon', icon: Database, href: '/dashboard/bank-recon' },
    ]
  },
  {
    title: 'GST Compliance',
    items: [
      { name: 'GSTR-1 (Sales)', icon: FileText, href: '/dashboard/gstr1' },
      { name: 'GSTR-2A/2B Recon', icon: FileCheck, href: '/dashboard/clients/1/reconciliation' },
      { name: 'GSTR-3B Filing', icon: FileDown, href: '/dashboard/gstr3b' },
      { name: 'GSTR-9 (Annual)', icon: Briefcase, href: '/dashboard/gstr9' },
    ]
  },
  {
    title: 'Insights & Risks',
    items: [
      { name: 'Vendor Compliance', icon: AlertCircle, href: '/dashboard/clients/1/vendors' },
      { name: 'Tax Analytics', icon: BarChart4, href: '/dashboard/reports' },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Team Settings', icon: Users, href: '/dashboard/settings' },
      { name: 'Preferences', icon: Settings, href: '/dashboard/preferences' },
    ]
  }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-40 bg-slate-950 border-r border-slate-800 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} transition-all`}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">GST Reconcile</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors mx-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu scroll area */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-800 px-3">
        {MENU_GROUPS.map((group, i) => (
          <div key={i} className="mb-6">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-70">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : ''}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400 font-semibold border-l-2 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                    {!collapsed && <span className="text-sm truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User profile section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-slate-200 text-sm font-bold">CA</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Rajan Mehta</p>
              <p className="text-xs text-slate-400 truncate">Admin | Mehta & Co.</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 hover:border-slate-700">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
