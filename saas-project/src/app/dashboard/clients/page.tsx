'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import { MOCK_CLIENTS, Client } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  Plus,
  Search,
  Building2,
  ExternalLink,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const industries = ['Manufacturing', 'Trading', 'IT Services', 'Construction', 'Healthcare', 'Retail', 'Finance', 'Other'];

function AddClientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Client) => void }) {
  const [form, setForm] = useState({ name: '', gstin: '', industry: 'Trading' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateGSTIN = (g: string) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(g);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGSTIN(form.gstin.toUpperCase())) {
      setError('Invalid GSTIN format. Example: 27AADCR5555Q1ZV');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      onAdd({
        id: String(Date.now()),
        name: form.name,
        gstin: form.gstin.toUpperCase(),
        industry: form.industry,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending',
        totalITC: 0,
        riskAmount: 0,
        pendingRecon: 0,
      });
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add New Client</h2>
            <p className="text-xs text-slate-400">Fill in the client details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Raj Enterprises Pvt Ltd"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">GSTIN *</label>
            <input required value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })}
              placeholder="27AADCR5555Q1ZV" maxLength={15}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase" />
            {error && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry *</label>
            <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white">
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</> : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.gstin.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Client Management" subtitle={`${clients.length} clients`}>
      {showModal && (
        <AddClientModal
          onClose={() => setShowModal(false)}
          onAdd={(c) => setClients(prev => [c, ...prev])}
        />
      )}

      {/* Header actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, GSTIN, industry..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">GSTIN</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Industry</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total ITC</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Amount</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No clients found</p>
                  </td>
                </tr>
              ) : filtered.map((client) => (
                <tr key={client.id} className="table-row-hover border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{client.name}</p>
                        {client.pendingRecon > 0 && (
                          <p className="text-xs text-amber-600">{client.pendingRecon} pending recon</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{client.gstin}</td>
                  <td className="px-5 py-3.5 text-slate-600">{client.industry}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {client.totalITC > 0 ? formatCurrency(client.totalITC) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {client.riskAmount > 0 ? (
                      <span className="font-medium text-red-600">{formatCurrency(client.riskAmount)}</span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium">No risk</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><Badge value={client.status} /></td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(client.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/clients/${client.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline transition-colors">
                      Open <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">Showing {filtered.length} of {clients.length} clients</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
