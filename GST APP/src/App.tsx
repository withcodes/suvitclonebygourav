import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import FileUploadArea from './components/FileUploadArea';
import ReconciliationGrid from './components/ReconciliationGrid';
import MonthlyDeltaView from './components/MonthlyDeltaView';
import { ToastContainer } from './components/Toast';
import { Bell, Search, UserCircle } from 'lucide-react';

export type ReconciledItem = {
  id: number;
  vendor: string;
  gstin: string;
  invoiceNo: string;
  date: string;
  prAmount: number;
  gstrAmount: number;
  status: string;
  _prRaw?: any;
  _gstrRaw?: any;
};

export type SummaryStats = {
  totalReconciled: number;
  itcAtRisk: number;
  pendingInvoices: number;
  totalTaxSaved: number;
};

/** Top-level tab IDs */
type Tab = 'dashboard' | 'gstr1' | 'gstr2b' | 'monthly' | 'clients' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data,    setData]    = useState<ReconciledItem[] | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);

  // Called when a voucher is saved — flip that row's status to Manual-Matched
  const handleVoucherSaved = useCallback((id: number) => {
    setData(prev =>
      prev
        ? prev.map(r => r.id === id ? { ...r, status: 'Manual-Matched' } : r)
        : prev
    );
  }, []);

  const handleReconciliationComplete = useCallback(
    (d: ReconciledItem[], s: SummaryStats) => {
      setData(d);
      setSummary(s);
      // Auto-navigate to the results grid
      setActiveTab('gstr2b');
    },
    []
  );

  /** Render the main content area based on activeTab */
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DashboardStats summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
              {/* Recent Reco Panel */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 h-full">
                  <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                    Recent Reconciliations
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Acme Corp',        status: 'Completed',       time: '2h ago',   errors: 0  },
                      { name: 'Globex Inc',        status: 'Action Required', time: '5h ago',   errors: 12 },
                      { name: 'Stark Industries',  status: 'In Progress',     time: '1 day ago',errors: 0  },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                        style={{ background: 'var(--bg-hover)', border: '1px solid transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{
                              background:
                                item.status === 'Completed'       ? 'rgba(16,185,129,0.12)' :
                                item.status === 'Action Required' ? 'rgba(245,158,11,0.12)' :
                                                                    'rgba(59,130,246,0.12)',
                              color:
                                item.status === 'Completed'       ? '#10b981' :
                                item.status === 'Action Required' ? '#d97706' :
                                                                    '#3b82f6',
                            }}
                          >
                            {item.status}
                          </span>
                          {item.errors > 0 && (
                            <p className="text-xs mt-1" style={{ color: '#f43f5e', fontWeight: 600 }}>
                              {item.errors} mismatches
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('gstr2b')}
                    className="w-full mt-5 py-2 text-xs font-medium rounded-lg transition-colors"
                    style={{ color: 'var(--text-accent)', background: 'var(--bg-hover)' }}
                  >
                    View All History →
                  </button>
                </div>
              </div>

              {/* Quick Action Panel */}
              <div className="lg:col-span-2">
                <FileUploadArea
                  mode="gstr2b"
                  onReconciliationComplete={handleReconciliationComplete}
                />
              </div>
            </div>
            <MonthlyDeltaView data={null} onMonthClick={() => setActiveTab('monthly')} />
          </>
        );

      case 'gstr1':
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                GSTR-1 Reconciliation
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Compare Sales Register (Tally) vs GSTR-1 filed on Portal
              </p>
            </div>
            <FileUploadArea mode="gstr1" onReconciliationComplete={handleReconciliationComplete} />
            <ReconciliationGrid
              liveData={data}
              summary={summary}
              onVoucherSaved={handleVoucherSaved}
            />
          </>
        );

      case 'gstr2b':
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                GSTR-2B Reconciliation
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Compare Purchase Register (Tally) vs GSTR-2B available on Portal
              </p>
            </div>
            <FileUploadArea mode="gstr2b" onReconciliationComplete={handleReconciliationComplete} />
            <ReconciliationGrid
              liveData={data}
              summary={summary}
              onVoucherSaved={handleVoucherSaved}
            />
          </>
        );

      case 'monthly':
        return (
          <>
            <div className="mb-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Monthly Delta View
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Month-wise mismatch between Tally books and GST Portal
              </p>
            </div>
            <MonthlyDeltaView data={null} />
          </>
        );

      case 'clients':
        return (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
            <span style={{ fontSize: 48 }}>👥</span>
            <h3 className="text-xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>
              Multi-Client Management
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)', maxWidth: 380 }}>
              Manage multiple GSTIN clients from one dashboard. Coming soon in v2.
            </p>
          </div>
        );

      case 'settings':
        return (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
            <span style={{ fontSize: 48 }}>⚙️</span>
            <h3 className="text-xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Configuration panel — coming soon.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', width: '100%', overflow: 'hidden' }}>
      {/* Toast container — global */}
      <ToastContainer />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={tab => setActiveTab(tab as Tab)} />

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {/* Header */}
        <header
          className="glass-header sticky top-0 z-40 px-8"
          style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Welcome back, Gaurav 👋
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              GST Reconciliation · FY 2024-25
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search clients or GSTIN…"
                className="field-input"
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: '0.8rem', width: 230 }}
              />
            </div>

            {/* Bell */}
            <button
              style={{ position: 'relative', padding: 7, borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            >
              <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', border: '2px solid var(--bg-base)' }} />
              <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>

            {/* Profile */}
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            >
              <UserCircle size={28} style={{ color: 'var(--text-muted)' }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Gaurav Patel</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>Admin</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: '28px 32px', maxWidth: 1280, width: '100%', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
