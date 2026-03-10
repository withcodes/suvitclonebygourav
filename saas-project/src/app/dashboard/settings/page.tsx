'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield, Bell, CreditCard, Users, Key, Globe, Save } from 'lucide-react';
import { useState } from 'react';

const plans = ['Starter (10 clients)', 'Professional (50 clients)', 'CA Firm (Unlimited)'];

export default function SettingsPage() {
  const [firmName, setFirmName] = useState('My CA Firm');
  const [email, setEmail] = useState('admin@cafirm.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and workspace">
      <div className="max-w-2xl space-y-5">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Firm Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Firm Name</label>
              <input value={firmName} onChange={e => setFirmName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Admin Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">GST Filing State</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Maharashtra (27)</option>
                <option>Delhi (07)</option>
                <option>Karnataka (29)</option>
                <option>Gujarat (24)</option>
                <option>Tamil Nadu (33)</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave}
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Billing & Plan</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-900">Professional Plan</p>
                <p className="text-xs text-blue-600">50 clients • ₹2,499/month</p>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full font-medium">Active</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <span className="text-xs text-blue-600 font-medium">6/50 clients</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {plans.map((p, i) => (
              <div key={p} className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${i === 1 ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                <p className="text-xs font-semibold text-slate-900">{p.split(' ')[0]}</p>
                <p className="text-xs text-slate-400">{p.split('(')[1]?.replace(')', '')}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Razorpay payment integration — coming soon</p>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Security</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Two-factor Authentication', desc: 'OTP on every login', enabled: true },
              { label: 'Session Timeout', desc: 'Auto-logout after 30 mins', enabled: true },
              { label: 'Client Data Isolation', desc: 'Each client\'s data is isolated', enabled: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <div className={`w-9 h-5 rounded-full flex items-center ${item.enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'} px-0.5 cursor-pointer`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'ITC Risk Alerts', desc: 'When a vendor doesn\'t file GSTR-1' },
              { label: 'Reconciliation Complete', desc: 'When matching is done' },
              { label: 'Filing Deadline Reminders', desc: '3 days before GSTR-3B due' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <div className="w-9 h-5 rounded-full flex items-center bg-blue-600 justify-end px-0.5 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
