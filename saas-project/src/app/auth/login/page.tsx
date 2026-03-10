'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Mail, KeyRound, Loader2, ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>

        <Link href="/" className="flex items-center gap-2 z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">GST Reconcile</span>
        </Link>

        <div className="z-10">
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Automate GSTR-2B reconciliation for all your clients
          </h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Match thousands of invoices in seconds. Detect ITC risk before filing GSTR-3B.
          </p>
          <div className="space-y-3">
            {[
              '✓ 99.9% matching accuracy',
              '✓ Real-time vendor compliance',
              '✓ Trusted by 500+ CA firms',
            ].map((item) => (
              <p key={item} className="text-blue-100 text-sm">{item}</p>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-xs z-10">© 2024 GST Reconcile. Secure & Compliant.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </Link>

          {step === 'email' ? (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
                <p className="text-slate-500 text-sm">Enter your email to receive a login OTP</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ca@yourfirm.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                  ) : (
                    <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">
                  Sign up free
                </Link>
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Enter the OTP</h1>
                <p className="text-slate-500 text-sm">
                  We sent a 6-digit code to <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  ) : (
                    'Verify & Login'
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setStep('email')}
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  ← Change email
                </button>
                <span className="mx-3 text-slate-300">|</span>
                <button className="text-sm text-blue-600 hover:underline">Resend OTP</button>
              </div>

              {/* Demo hint */}
              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 text-center">
                  <strong>Demo:</strong> Enter any 6 digits to proceed to dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
