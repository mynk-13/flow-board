import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import {
  Mail, Lock, AlertCircle, CheckCircle2, XCircle,
  Circle, LayoutDashboard, ArrowRight, Loader2,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { PasswordInput } from '@/shared/PasswordInput'
import { isValidEmail, getEmailValidationMessage } from '@/shared/validation'

const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',       test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter',         test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter',         test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number',                   test: (p: string) => /\d/.test(p) },
  { id: 'special',   label: 'One special character',        test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
] as const

const STRENGTH_LABEL = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500']
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-lime-600', 'text-emerald-600']

function humanizeFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  const map: Record<string, string> = {
    'auth/email-already-in-use':  'An account with this email already exists. Try signing in.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/weak-password':         'Password is too weak. Please use a stronger password.',
    'auth/network-request-failed':'Network error. Please check your connection.',
    'auth/too-many-requests':     'Too many attempts. Please try again in a few minutes.',
    'auth/operation-not-allowed': 'Email/password sign-up is not enabled. Please contact support.',
  }
  return map[code] ?? (err instanceof Error ? err.message : 'Something went wrong. Please try again.')
}

export function SignupPage() {
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [touched, setTouched] = useState({
    email: false, password: false, confirm: false,
  })
  const navigate = useNavigate()

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, done: rule.test(password) })),
    [password]
  )
  const strength      = passwordChecks.filter((c) => c.done).length
  const passwordValid = strength === PASSWORD_RULES.length
  const emailValid    = useMemo(() => isValidEmail(email), [email])
  const emailMessage  = getEmailValidationMessage(email)
  const confirmMatch  = confirmPassword === password
  const confirmValid  = confirmMatch && confirmPassword.length > 0

  const emailState   = !touched.email    ? 'default' : emailValid   ? 'success' : 'error'
  const passwordState = !touched.password ? 'default' : passwordValid ? 'success' : password.length > 0 ? 'default' : 'error'
  const confirmState = !touched.confirm  ? 'default' : confirmValid ? 'success' : 'error'

  const canSubmit = emailValid && passwordValid && confirmMatch && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true, confirm: true })
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(humanizeFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-violet-700/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-105">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40">
            <LayoutDashboard size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start managing projects with FlowBoard</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-2xl">

          {/* Firebase error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="you@example.com"
                  className={`w-full cursor-text rounded-xl border pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    emailState === 'error'   ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-400/20' :
                    emailState === 'success' ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20' :
                    'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                {touched.email && email && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {emailValid
                      ? <CheckCircle2 size={15} className="text-emerald-500" />
                      : <XCircle      size={15} className="text-red-400" />}
                  </span>
                )}
              </div>
              {touched.email && emailMessage && (
                <p className="flex items-center gap-1 text-xs text-red-500" role="alert">
                  <AlertCircle size={11} className="shrink-0" />
                  {emailMessage}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                autoComplete="new-password"
                placeholder="Create a strong password"
                required
                minLength={8}
                leftIcon={<Lock size={15} />}
                state={passwordState}
              />

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? STRENGTH_COLOR[strength] : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  {strength > 0 && (
                    <p className={`text-[11px] font-semibold ${STRENGTH_TEXT[strength]}`}>
                      {STRENGTH_LABEL[strength]}
                    </p>
                  )}
                </div>
              )}

              {/* Password rules checklist — 2 columns */}
              {(touched.password || password.length > 0) && (
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1" aria-live="polite">
                  {passwordChecks.map(({ id, label, done }) => (
                    <li key={id} className="flex items-center gap-1.5 text-[11px]">
                      {done
                        ? <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
                        : <Circle       size={12} className="shrink-0 text-slate-300" />}
                      <span className={done ? 'text-emerald-700' : 'text-slate-500'}>{label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <PasswordInput
                id="signup-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                minLength={8}
                leftIcon={<Lock size={15} />}
                state={confirmState}
              />
              {touched.confirm && confirmPassword.length > 0 && !confirmMatch && (
                <p className="flex items-center gap-1 text-xs text-red-500" role="alert">
                  <AlertCircle size={11} className="shrink-0" />
                  Passwords do not match
                </p>
              )}
              {touched.confirm && confirmValid && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 size={11} className="shrink-0" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                : <><span>Create account</span><ArrowRight size={15} className="opacity-70 group-hover:translate-x-0.5 transition-transform" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          By creating an account you agree to FlowBoard's{' '}
          <span className="text-slate-400 cursor-pointer hover:text-slate-300">Terms</span> &amp;{' '}
          <span className="text-slate-400 cursor-pointer hover:text-slate-300">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
