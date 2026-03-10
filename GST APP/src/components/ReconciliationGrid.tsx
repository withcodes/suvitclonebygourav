import { useState } from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, FileCheck, Search, Filter } from 'lucide-react';
import type { ReconciledItem, SummaryStats } from '../App';

interface ReconciliationGridProps {
  liveData: ReconciledItem[] | null;
  summary: SummaryStats | null;
}

export default function ReconciliationGrid({ liveData, summary }: ReconciliationGridProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  if (!liveData) {
      return (
          <div className="glass rounded-2xl p-6 mt-8 py-16 text-center border whitespace-nowrap border-slate-100 flex flex-col items-center justify-center">
              <Search size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No Data Available</h3>
              <p className="text-slate-500 text-sm mt-1">Upload Purchase Register and GSTR-2B files above to view the reconciliation results.</p>
          </div>
      );
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const handleExport = async () => {
    if (!liveData || !summary) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary, data: liveData })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_Recon_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download reconciliation sheet');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Reconciliation Results</h2>
          <p className="text-sm text-slate-500">Live preview of your analyzed Purchase Register vs GSTR-2B</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input type="text" placeholder="Search invoices..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filter
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting || !liveData || liveData.length === 0}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-primary-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Vendor Name</th>
              <th className="px-4 py-3 font-semibold">GSTIN</th>
              <th className="px-4 py-3 font-semibold">Invoice No</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold text-right">As per PR (₹)</th>
              <th className="px-4 py-3 font-semibold text-right">As per 2B (₹)</th>
              <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">Match Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {liveData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-4 font-medium text-slate-800">{row.vendor}</td>
                <td className="px-4 py-4 text-slate-600 font-mono text-xs">{row.gstin}</td>
                <td className="px-4 py-4 text-slate-600">{row.invoiceNo}</td>
                <td className="px-4 py-4 text-slate-500">{row.date}</td>
                <td className="px-4 py-4 text-right font-medium text-slate-700">{formatCurrency(row.prAmount)}</td>
                <td className="px-4 py-4 text-right font-medium text-slate-700">{formatCurrency(row.gstrAmount)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    {row.status === 'Exact Match' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                        <CheckCircle size={14} /> Exact Match
                      </span>
                    )}
                    {row.status === 'Amount Mismatch' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                        <HelpCircle size={14} /> Amt Mismatch
                      </span>
                    )}
                    {row.status === 'Fuzzy Match' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        <FileCheck size={14} /> Fuzzy Match
                      </span>
                    )}
                    {(row.status === 'Missing in 2B' || row.status === 'Missing in PR') && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium border border-rose-200">
                        <AlertTriangle size={14} /> {row.status}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">Showing {liveData.length} entries</p>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-500 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm font-medium">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
