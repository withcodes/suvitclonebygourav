import { useState, useMemo } from 'react';
import {
  Search, Filter, Download, Plus, Loader2, X,
} from 'lucide-react';
import type { ReconciledItem, SummaryStats } from '../App';
import { STATUS_META, RECO_STATUSES, type RecoStatus } from '../utils/gst';
import AddVoucherModal from './AddVoucherModal';
import { toast } from './Toast';

interface ReconciliationGridProps {
  liveData: ReconciledItem[] | null;
  summary:  SummaryStats   | null;
  onVoucherSaved?: (id: number) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ReconciliationGrid({
  liveData, summary, onVoucherSaved,
}: ReconciliationGridProps) {
  const [search,          setSearch]          = useState('');
  const [activeFilters,   setActiveFilters]   = useState<RecoStatus[]>([]);
  const [voucherRow,      setVoucherRow]      = useState<ReconciledItem | null>(null);
  const [isExporting,     setIsExporting]     = useState(false);

  // Normalise status from backend values → RecoStatus
  const normalise = (s: string): RecoStatus => {
    const map: Record<string, RecoStatus> = {
      'Exact Match':    'Matched',
      'Fuzzy Match':    'Manual-Matched',
      'Amount Mismatch':'Partially-Matched',
      'Missing in PR':  'Not In Tally',
      'Missing in 2B':  'Not In Portal',
      'Missing in GSTR1':'Not In Portal',
      // passthrough if backend already sends Suvit names
      'Matched':           'Matched',
      'Manual-Matched':    'Manual-Matched',
      'Partially-Matched': 'Partially-Matched',
      'Not In Tally':      'Not In Tally',
      'Not In Portal':     'Not In Portal',
    };
    return map[s] ?? 'Matched';
  };

  const toggleFilter = (s: RecoStatus) =>
    setActiveFilters(prev =>
      prev.includes(s) ? prev.filter(f => f !== s) : [...prev, s]
    );

  // ── Filtered rows ─────────────────────────────────────────────
  const rows = useMemo(() => {
    if (!liveData) return [];
    const q = search.toLowerCase();
    return liveData.filter(r => {
      const status = normalise(r.status);
      const matchQ = !q || [r.vendor, r.gstin, r.invoiceNo].some(v => v.toLowerCase().includes(q));
      const matchF = activeFilters.length === 0 || activeFilters.includes(status);
      return matchQ && matchF;
    });
  }, [liveData, search, activeFilters]);

  // ── Currency formatter ───────────────────────────────────────
  const fmt = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  // ── Export ───────────────────────────────────────────────────
  const handleExport = async () => {
    if (!liveData || !summary) return;
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, data: liveData }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `GSTSync_Recon_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Reconciliation sheet exported successfully!');
    } catch {
      toast.error('Export failed — please try again or check backend connection.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Status counts for filter chips ───────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<RecoStatus, number>> = {};
    (liveData ?? []).forEach(r => {
      const s = normalise(r.status);
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return counts;
  }, [liveData]);

  // ── Empty state ──────────────────────────────────────────────
  if (!liveData) {
    return (
      <div
        className="glass-card p-16 mt-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: 200 }}
      >
        <Search size={44} style={{ color: 'var(--text-muted)', marginBottom: 14 }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          No Data Yet
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', maxWidth: 340 }}>
          Upload Purchase Register and GSTR-2B files above to see reconciliation results.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Voucher Modal ── */}
      {voucherRow && (
        <AddVoucherModal
          row={voucherRow}
          onClose={() => setVoucherRow(null)}
          onSaved={(id) => {
            onVoucherSaved?.(id);
            setVoucherRow(null);
          }}
        />
      )}

      <div className="glass-card p-6 mt-6" style={{ overflow: 'hidden' }}>
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Reconciliation Results
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {rows.length} of {liveData.length} invoices
              {activeFilters.length > 0 && ` · filtered by ${activeFilters.join(', ')}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search vendor / GSTIN / invoice…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="field-input pl-8 pr-3 py-2 text-xs"
                style={{ width: 220 }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X size={13} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>

            {/* Export */}
            <button
              className="btn-primary py-2 px-4 text-xs"
              onClick={handleExport}
              disabled={isExporting || !liveData.length}
            >
              {isExporting
                ? <><Loader2 size={13} className="animate-spin" /> Exporting…</>
                : <><Download size={13} /> Export Excel</>
              }
            </button>
          </div>
        </div>

        {/* ── Filter Chips ── */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="flex items-center gap-1 text-xs mr-1" style={{ color: 'var(--text-muted)' }}>
            <Filter size={12} /> Filter:
          </span>
          <button
            className={`filter-chip ${activeFilters.length === 0 ? 'active' : ''}`}
            onClick={() => setActiveFilters([])}
          >
            All ({liveData.length})
          </button>
          {RECO_STATUSES.map(s => {
            const count = statusCounts[s] ?? 0;
            if (!count) return null;
            return (
              <button
                key={s}
                onClick={() => toggleFilter(s)}
                className={`filter-chip ${activeFilters.includes(s) ? 'active' : ''}`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Vendor Name', 'GSTIN', 'Invoice No.', 'Date', 'PR Amount', '2B Amount', 'Status', 'Action'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const status = normalise(row.status);
                const meta   = STATUS_META[status];
                return (
                  <tr key={row.id} className="tbl-row">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {row.vendor}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {row.gstin}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {row.invoiceNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                      {fmt(row.prAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                      {fmt(row.gstrAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={meta.pillClass}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {status === 'Not In Tally' ? (
                        <button
                          className="btn-voucher"
                          onClick={() => setVoucherRow(row)}
                        >
                          <Plus size={12} /> Add Voucher
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {search || activeFilters.length > 0
                  ? 'No invoices match your current filters.'
                  : 'No data to display.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {rows.length > 0 && (
          <div
            className="flex items-center justify-between mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {rows.length} of {liveData.length} records
            </p>
            <div className="flex gap-1">
              <button className="btn-ghost px-3 py-1 text-xs" disabled>← Prev</button>
              <button className="btn-primary px-3 py-1 text-xs" style={{ pointerEvents: 'none' }}>1</button>
              <button className="btn-ghost px-3 py-1 text-xs" disabled>Next →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
