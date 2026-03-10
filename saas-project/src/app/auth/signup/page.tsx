'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, User, Mail, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';

const plans = [
  { id: 'starter', name: 'Starter', price: '₹999/mo', clients: '10 clients' },
  { id: 'professional', name: 'Professional', price: '₹2,499/mo', clients: '50 clients', popular: true },
  { id: 'firm', name: 'CA Firm', price: '₹5,999/mo', clients: 'Unlimited' },
];

export default function SignupPage() {
  const [step, setStep] = useState<'details' | 'plan' | 'otp'>('details');
  const [form, setForm] = useState({ name: '', email: '', firmName: '' });
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('plan');
  };

  const handlePlan = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('otp'); }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`sotp-${index + 1}`)?.focus();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
  };

  const stepPercent = step === 'details' ? 33 : step === 'plan' ? 66 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <Link href="/" className="flex items-center gap-2 z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">GST Reconcile</span>
        </Link>
        <div className="z-10">
          <h2 className="text-2xl font-black text-white mb-4">Start your 14-day free trial</h2>
          <div className="space-y-4">
            {['No credit card required', 'Full access to all features', 'Setup in under 5 minutes', 'Cancel anytime'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-xs z-10">© 2024 GST Reconcile</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Account Details</span>
              <span>Choose Plan</span>
              <span>Verify Email</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${stepPercent}%` }}
              ></div>
            </div>
          </div>

          {step === 'details' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Create your account</h1>
                <p className="text-slate-500 text-sm">Join 500+ CA firms on GST Reconcile</p>
              </div>
              <form onSubmit={handleDetails} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="CA Rajan Mehta" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="ca@yourfirm.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Firm Name</label>
                  <input type="text" required value={form.firmName} onChange={e => setForm({ ...form, firmName: e.target.value })}
                    placeholder="Mehta & Associates" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {step === 'plan' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 mb-1">Choose your plan</h1>
                <p className="text-slate-500 text-sm">Start free for 14 days, then pay.</p>
              </div>
              <div className="space-y-3 mb-6">
                {plans.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedPlan === p.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === p.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                          {selectedPlan === p.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                            {p.popular && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Popular</span>}
                          </div>
                          <p className="text-xs text-slate-400">{p.clients}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{p.price}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={handlePlan} disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Verify your email</h1>
                <p className="text-slate-500 text-sm">Enter the OTP sent to <strong>{form.email}</strong></p>
              </div>
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <input key={i} id={`sotp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white" />
                  ))}
                </div>
                <button type="submit" disabled={loading || otp.join('').length < 6}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Complete Signup'}
                </button>
              </form>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 text-center"><strong>Demo:</strong> Enter any 6 digits to proceed</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
