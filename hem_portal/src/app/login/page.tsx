'use client'

import { useActionState, useState } from 'react'
import { login } from './actions'
import { ArrowRight, Loader2, Eye, EyeOff, Building2, ClipboardCheck, MapPin, FileCheck2 } from 'lucide-react'
import HemLogo from '@/components/HemLogo'

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(async (_: string | null, formData: FormData) => {
    const res = await login(formData)
    return res?.error || null
  }, null)
  const [showPassword, setShowPassword] = useState(false)
  return <main className="min-h-screen grid lg:grid-cols-2 bg-surface">
    <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-[#12233F] text-white relative overflow-hidden">
      <div className="absolute w-[650px] h-[650px] -right-80 top-44 rounded-full border border-white/10" /><div className="absolute w-[500px] h-[500px] -right-60 top-64 rounded-full border border-white/10" />
      <div className="relative flex items-center gap-3"><span className="w-12 h-12 rounded-xl bg-white/95 p-1.5 grid place-items-center"><HemLogo className="w-10 h-10" /></span><span className="text-xl font-semibold tracking-tight">HEM Associates</span></div>
      <div className="relative max-w-lg py-16"><p className="text-blue-300 text-xs font-semibold tracking-[.2em] uppercase mb-6">The valuation workspace</p><h1 className="text-5xl xl:text-6xl font-semibold leading-[1.12] tracking-tight">Every property.<br />Every detail.<br /><span className="text-blue-300">One clear view.</span></h1><p className="mt-7 text-slate-300 text-base leading-relaxed max-w-sm">From the first field visit to the final report, bring your team and every case together.</p>
      <div className="mt-12 space-y-5">{[{ icon: MapPin, text: 'Connected field operations' }, { icon: ClipboardCheck, text: 'Structured reviews and approvals' }, { icon: FileCheck2, text: 'Consistent, lender-ready reports' }].map(item => <div key={item.text} className="flex items-center gap-3 text-sm text-slate-200"><item.icon size={18} className="text-blue-300" />{item.text}</div>)}</div></div>
      <p className="relative text-xs text-slate-400">Property valuation & field operations</p>
    </section>
    <section className="flex flex-col justify-center px-6 py-14 sm:px-14">
      <div className="w-full max-w-[380px] mx-auto">
        <div className="lg:hidden flex items-center gap-3 mb-12 text-brand-dark"><span className="w-10 h-10 rounded-lg bg-paper-2 border border-line p-1"><HemLogo className="w-8 h-8" /></span><strong>HEM Associates</strong></div>
        <p className="ui-kicker mb-3">Welcome to your workspace</p><h2 className="text-3xl font-semibold tracking-tight">Sign in to HEM</h2><p className="text-muted mt-3 mb-9 text-sm">Use your work account to continue.</p>
        <form action={formAction} className="space-y-5">
          {error && <div role="alert" className="p-3 bg-danger-bg border border-danger/20 text-danger text-sm rounded-lg">{error}</div>}
          <div><label htmlFor="email" className="block text-sm font-medium mb-2">Work email</label><input id="email" name="email" type="email" autoComplete="username" required className="ui-input" placeholder="you@company.com" /></div>
          <div><label htmlFor="password" className="block text-sm font-medium mb-2">Password</label><div className="relative"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required className="ui-input !pr-12" placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
          <button type="submit" disabled={isPending} className="ui-button ui-button-primary w-full !py-3 !mt-7 disabled:opacity-60">{isPending ? <><Loader2 size={17} className="animate-spin" />Signing in…</> : <>Sign in <ArrowRight size={17} /></>}</button>
        </form>
        <p className="text-xs text-muted leading-relaxed mt-7">Need an account or help signing in? Contact your workspace administrator.</p>
        <p className="text-xs text-muted border-t border-line pt-6 mt-12">HEM Associates · Valuation workspace</p>
      </div>
    </section>
  </main>
}
