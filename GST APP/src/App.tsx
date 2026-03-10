import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import FileUploadArea from './components/FileUploadArea';
import ReconciliationGrid from './components/ReconciliationGrid';
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
}

export type SummaryStats = {
  totalReconciled: number;
  itcAtRisk: number;
  pendingInvoices: number;
  totalTaxSaved: number;
}

function App() {
  const [data, setData] = useState<ReconciledItem[] | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 w-full overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 glass sticky top-0 z-10 px-8 flex items-center justify-between border-b border-slate-200/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Welcome back, Gaurav 👋</h2>
            <p className="text-sm text-slate-500">Here's what's happening with your GST filings today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients or GSTIN..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64 transition-all"
              />
            </div>
            <button className="p-2 relative text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button className="flex items-center gap-2 hover:bg-slate-100 py-1 px-2 rounded-lg transition-colors">
              <UserCircle size={32} className="text-slate-400" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium leading-none mb-1">Guarav Patel</p>
                <p className="text-xs text-slate-500 leading-none">Admin</p>
              </div>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <DashboardStats summary={summary} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FileUploadArea onReconciliationComplete={(data, summary) => {
                setData(data);
                setSummary(summary);
              }} />
            </div>
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 h-full border border-slate-100">
                <h3 className="font-semibold text-lg mb-4">Recent Reconciliation</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Acme Corp', status: 'Completed', time: '2 hours ago', errors: 0 },
                    { name: 'Globex Inc', status: 'Action Required', time: '5 hours ago', errors: 12 },
                    { name: 'Stark Industries', status: 'In Progress', time: '1 day ago', errors: 0 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm cursor-pointer">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.time}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          item.status === 'Action Required' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                        {item.errors > 0 && <p className="text-xs text-rose-500 font-medium mt-1">{item.errors} Mismatches</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors">
                  View All History
                </button>
              </div>
            </div>
          </div>
          
          {/* Real Live Grid */}
          <ReconciliationGrid liveData={data} summary={summary} />
        </div>
      </main>
    </div>
  )
}

export default App
