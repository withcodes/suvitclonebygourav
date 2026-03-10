import { LayoutDashboard, FileSpreadsheet, Settings, LogOut, FileSearch, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: FileSearch, label: 'Reconciliation', active: false },
    { icon: FileSpreadsheet, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col pt-6 sticky top-0">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="bg-primary-500 rounded-lg p-2 text-white shadow-lg shadow-primary-500/20">
          <FileSearch size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Suvit<span className="text-primary-400">Clone</span></h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">GST Automation</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item, i) => (
          <button 
            key={i} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={item.active ? 'text-primary-400' : 'text-slate-400'} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mb-4">
        <div className="bg-slate-800 rounded-xl p-4 text-sm border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2 text-white font-medium">
            <HelpCircle size={16} /> Need help?
          </div>
          <p className="text-xs text-slate-400 mb-3">Check out our guide on how to resolve mismatches efficiently.</p>
          <button className="text-xs text-primary-400 font-medium hover:text-primary-300">Read Docs</button>
        </div>
      </div>

      <div className="border-t border-slate-800 p-4">
        <button className="flex items-center gap-3 text-sm font-medium hover:text-white transition-colors w-full px-4 py-2">
          <LogOut size={18} className="text-rose-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
