'use client';

import { useState } from 'react';
import { Search, Bell, Settings, Calendar, Download, RefreshCw, UploadCloud, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [showFy, setShowFy] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shadow-slate-100/50">
      
      {/* Left side utilities */}
      <div className="flex items-center gap-6">
        {/* Global Search command palette trigger */}
        <div className="relative group cursor-pointer w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-blue-500 transition-colors" />
          <div className="w-full bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-xl pl-9 pr-3 py-2 flex items-center justify-between group-hover:border-blue-300 group-hover:bg-blue-50/30 transition-all">
            <span>Search clients, GSTIN, reports...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Financial Year Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowFy(!showFy)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            FY 2024-25 <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showFy && (
            <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 py-1 z-50">
              {['FY 2024-25', 'FY 2023-24', 'FY 2022-23'].map(fy => (
                <button key={fy} onClick={() => setShowFy(false)} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  {fy}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Quick Sync Button */}
        <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all shadow-sm">
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Sync Tally
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <Link href="/dashboard/settings" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
