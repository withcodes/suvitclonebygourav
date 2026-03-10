'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  BarChart3,
  FileSearch,
  AlertTriangle,
  Download,
  ArrowRight,
  Star,
  Users,
  Zap,
  Lock,
  Menu,
  X,
  ChevronRight,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Smart Matching Engine',
    desc: 'Auto-match purchase register invoices with GSTR-2B using GSTIN, invoice number, date & tax amount.',
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  {
    icon: AlertTriangle,
    title: 'ITC Risk Detection',
    desc: 'Instantly flag vendors who haven\'t filed GSTR-1. Know your ITC at risk before filing 3B.',
    color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics Dashboard',
    desc: 'Monthly ITC trends, reconciliation status, and risk summaries at a glance.',
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  },
  {
    icon: Users,
    title: 'Multi-Client Workspace',
    desc: 'Manage unlimited clients in one place. Perfect for CA firms and accounting professionals.',
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  {
    icon: FileSpreadsheet,
    title: 'Auto-Generated Reconciliation Sheet',
    desc: 'One click to export a complete, accountant-ready reconciliation sheet in Excel or CSV.',
    color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Security',
    desc: 'Client data is fully isolated. Encrypted at rest and in transit. SOC 2 compliant architecture.',
    color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Files',
    desc: 'Drag & drop your purchase register (Excel) and GSTR-2B (JSON/Excel) for the period.',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    number: '02',
    title: 'Run Reconciliation',
    desc: 'Our engine matches invoices in seconds — giving you Matched, Missing, and Mismatch statuses.',
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    number: '03',
    title: 'Download Final Sheet',
    desc: 'Review ITC risks and download your reconciliation sheet in Excel — ready to share with clients.',
    gradient: 'from-emerald-500 to-emerald-700',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    desc: 'For individual practitioners',
    clients: '10 clients',
    features: ['10 client workspaces', 'GSTR-2B reconciliation', 'Excel & JSON upload', 'Basic reports', 'Email support'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '₹2,499',
    period: '/month',
    desc: 'For growing CA firms',
    clients: '50 clients',
    features: ['50 client workspaces', 'Advanced reconciliation', 'Final reconciliation sheet', 'Vendor risk alerts', 'Priority support'],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'CA Firm',
    price: '₹5,999',
    period: '/month',
    desc: 'For large firms & enterprises',
    clients: 'Unlimited clients',
    features: ['Unlimited workspaces', 'Custom reconciliation rules', 'API access', 'White-label reports', 'Dedicated account manager'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const testimonials = [
  {
    name: 'CA Rajan Mehta',
    role: 'Senior Partner, Mehta & Associates',
    content: 'GST Reconcile saved our firm 40+ hours per month. The ITC risk alerts alone helped us avoid ₹12 lakh in disallowances.',
    rating: 5,
    avatar: 'RM',
  },
  {
    name: 'Priya Sharma',
    role: 'GST Consultant, Delhi',
    content: 'The final reconciliation sheet is a lifesaver. Upload, reconcile, export — done in minutes. Clients love the professional output.',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'CA Ankit Patel',
    role: 'Founder, Patel Tax Advisors',
    content: 'Vendor compliance tracking is a game changer. I proactively alert clients about at-risk vendors before GSTR-3B filing.',
    rating: 5,
    avatar: 'AP',
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-inter overflow-x-hidden">
      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">GST Reconcile</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['features', 'how-it-works', 'pricing'].map(s => (
                <a key={s} href={`#${s}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors capitalize">
                  {s.replace('-', ' ')}
                </a>
              ))}
              <Link href="/auth/login" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                Start Free Trial
              </Link>
            </div>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-slate-700">Features</a>
            <a href="#how-it-works" className="block text-sm text-slate-700">How It Works</a>
            <a href="#pricing" className="block text-sm text-slate-700">Pricing</a>
            <Link href="/auth/login" className="block text-sm text-slate-700">Sign In</Link>
            <Link href="/auth/signup" className="block text-sm font-medium text-blue-600">Start Free Trial</Link>
          </div>
        )}
      </nav>

      {/* ── HERO — DARK GRADIENT ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden pt-16">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-12 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.015%22%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-medium mb-8 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5" /> Trusted by 500+ CA firms across India
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
              Automate GST{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Reconciliation
              </span>
              <br />in Minutes
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Auto-match GSTR-2B with your purchase register, detect ITC risks, and generate
              audit-ready reconciliation sheets — all in one secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all shadow-xl shadow-blue-900/40 text-base">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all text-base">
                View Live Demo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
            {[
              { value: '500+', label: 'CA Firms' },
              { value: '₹50Cr+', label: 'ITC Protected' },
              { value: '2M+', label: 'Invoices Matched' },
              { value: '99.9%', label: 'Accuracy' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Dark dashboard preview */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="px-4 py-3 bg-slate-950/80 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                <div className="flex-1 mx-4 bg-white/10 h-6 rounded flex items-center px-3">
                  <span className="text-xs text-slate-400">app.gstreconcile.in/dashboard</span>
                </div>
              </div>
              <div className="p-5 grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Clients', value: '6', accent: 'border-blue-500' },
                  { label: 'Pending Recon', value: '7', accent: 'border-amber-500' },
                  { label: 'Total ITC', value: '₹1.05Cr', accent: 'border-green-500' },
                  { label: 'ITC at Risk', value: '₹6.98L', accent: 'border-red-500' },
                ].map(c => (
                  <div key={c.label} className={`bg-white/5 rounded-xl p-3 border-t-2 ${c.accent}`}>
                    <p className="text-white font-bold text-lg">{c.value}</p>
                    <p className="text-slate-400 text-xs">{c.label}</p>
                  </div>
                ))}
                <div className="col-span-3 bg-white/5 rounded-xl p-3 h-24 flex items-end gap-1">
                  {[40, 60, 45, 75, 55, 90, 70, 85, 62, 78, 88, 95].map((h, i) => (
                    <div key={i} className={`flex-1 rounded-t ${i === 11 ? 'bg-blue-400' : 'bg-blue-600/50'}`} style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 h-24 flex flex-col items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
                  <p className="text-emerald-400 text-xs font-bold">+8.2%</p>
                  <p className="text-slate-500 text-xs">ITC Growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </section>

      {/* ── FEATURES — WHITE ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              <Zap className="w-3 h-3" /> FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Everything you need for GST compliance
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              A complete toolkit designed for Indian CA firms and GST practitioners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl p-6 border border-slate-100 card-hover shadow-sm hover:border-blue-200">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — DARK ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-br from-slate-950 to-blue-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-3">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Reconcile in 3 simple steps
            </h2>
            <p className="text-slate-400">From file upload to accountant-ready report — in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-10 left-[33%] right-[33%] h-px bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-30"></div>
            {steps.map((s, i) => (
              <div key={s.number} className="relative text-center p-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-white font-black text-xl">{s.number}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Final sheet callout */}
          <div className="mt-10 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Auto-generated Final Reconciliation Sheet</p>
                <p className="text-slate-400 text-xs">11-column accountant-ready Excel with summary, detail & vendor risk tabs</p>
              </div>
            </div>
            <Link href="/dashboard/clients/1/final-sheet"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all">
              View Sample <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </section>

      {/* ── TESTIMONIALS — WHITE ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900">Loved by CA professionals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed italic">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING — DARK GRADIENT ──────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-3">
              PRICING
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-400">No hidden fees. Cancel anytime. 14-day free trial included.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div key={p.name}
                className={`rounded-2xl p-6 border transition-all ${
                  p.highlight
                    ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-900/50 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur'
                }`}>
                {p.highlight && (
                  <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                    <Zap className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-1 ${p.highlight ? 'text-white' : 'text-white'}`}>{p.name}</h3>
                <p className={`text-xs mb-4 ${p.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{p.desc}</p>
                <div className="mb-4">
                  <span className={`text-4xl font-black ${p.highlight ? 'text-white' : 'text-white'}`}>{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{p.period}</span>
                </div>
                <div className={`text-xs font-semibold mb-4 ${p.highlight ? 'text-blue-200' : 'text-blue-400'}`}>{p.clients}</div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.highlight ? 'text-blue-200' : 'text-blue-400'}`} />
                      <span className={`text-sm ${p.highlight ? 'text-blue-100' : 'text-slate-300'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    p.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — GRADIENT ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.03%22%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Start reconciling smarter today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join 500+ CA firms protecting their clients&apos; ITC with GST Reconcile.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-lg shadow-2xl shadow-blue-900/40">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* ── FOOTER — DARK ────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">GST Reconcile</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Demo</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between text-xs gap-2">
            <p>© 2024 GST Reconcile. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
