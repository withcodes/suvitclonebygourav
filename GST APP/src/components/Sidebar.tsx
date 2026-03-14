import {
  LayoutDashboard, FileText, BookOpen, BarChart3,
  Users, Settings, LogOut, FileSearch
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'gstr1',      icon: FileText,        label: 'GSTR-1 Reco' },
    { id: 'gstr2b',     icon: BookOpen,        label: 'GSTR-2B Reco' },
    { id: 'monthly',    icon: BarChart3,        label: 'Monthly View' },
    { id: 'clients',    icon: Users,            label: 'Clients' },
    { id: 'settings',   icon: Settings,         label: 'Settings' },
  ];

  return (
    <div
      className="glass-sidebar flex flex-col pt-6 sticky top-0 h-screen"
      style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)' }}
    >
      {/* ── Logo ── */}
      <div className="px-5 mb-8 flex items-center gap-3">
        <div
          className="p-2 rounded-xl animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
        >
          <FileSearch size={22} color="white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            GST<span style={{ color: '#818cf8' }}>Sync</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            GST Automation
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item w-full text-left ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Theme Toggle ── */}
      <div className="px-3 mb-3">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <div className="flex items-center gap-2">
            <span style={{ color: !isDark ? '#f59e0b' : 'var(--text-muted)', fontSize: 15 }}>☀️</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: isDark ? '#818cf8' : 'var(--text-muted)', fontSize: 15 }}>🌙</span>
            {/* Track */}
            <div className="toggle-track">
              <div className="toggle-thumb" />
            </div>
          </div>
        </button>
      </div>

      {/* ── User + Logout ── */}
      <div
        className="mx-3 mb-4 p-3 rounded-xl flex items-center gap-3"
        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
        >
          G
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            Gaurav Patel
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Admin</p>
        </div>
        <button
          className="flex-shrink-0 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut size={15} color="#f43f5e" />
        </button>
      </div>
    </div>
  );
}
