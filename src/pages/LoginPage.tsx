import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Mail, Lock, AlertCircle, CheckCircle2, XCircle, LayoutDashboard, ArrowRight, Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { PasswordInput } from '@/shared/PasswordInput'
import { isValidEmail, getEmailValidationMessage } from '@/shared/validation'

function humanizeFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  const map: Record<string, string> = {
    'auth/user-not-found':        'No account found with this email address.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/invalid-credential':    'Invalid email or password. Please check and retry.',
    'auth/too-many-requests':     'Too many failed attempts. Please try again in a few minutes.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/network-request-failed':'Network error. Please check your connection.',
    'auth/user-disabled':         'This account has been disabled. Please contact support.',
  }
  return map[code] ?? (err instanceof Error ? err.message : 'Something went wrong. Please try again.')
}

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [touched, setTouched]   = useState({ email: false, password: false })
  const navigate = useNavigate()

  const emailValid   = useMemo(() => isValidEmail(email), [email])
  const emailMessage = getEmailValidationMessage(email)

  const emailState = !touched.email ? 'default' : emailValid ? 'success' : 'error'
  const passwordState = !touched.password ? 'default' : password.length >= 1 ? 'success' : 'error'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!emailValid) return
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
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

      <div className="relative z-10 w-full max-w-100">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40">
            <LayoutDashboard size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your FlowBoard account</p>
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
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
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
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <span className="text-xs text-indigo-600 hover:text-indigo-500 cursor-pointer select-none">
                  Forgot password?
                </span>
              </div>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                leftIcon={<Lock size={15} />}
                state={passwordState}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none transition-all"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                : <><span>Sign in</span><ArrowRight size={15} className="opacity-70 group-hover:translate-x-0.5 transition-transform" /></>
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
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create one free
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          By signing in you agree to FlowBoard's{' '}
          <span className="text-slate-400 cursor-pointer hover:text-slate-300">Terms</span> &amp;{' '}
          <span className="text-slate-400 cursor-pointer hover:text-slate-300">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
