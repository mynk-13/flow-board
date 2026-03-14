import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PasswordInput } from '@/shared/PasswordInput'
import { isValidEmail, getEmailValidationMessage } from '@/shared/validation'

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
] as const

function CheckIcon({ done }: { done: boolean }) {
  return (
    <span className="inline-flex shrink-0 w-4 h-4 items-center justify-center">
      {done ? (
        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="w-4 h-4 rounded-full border-2 border-slate-200 bg-white" aria-hidden />
      )}
    </span>
  )
}

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, done: rule.test(password) })),
    [password]
  )
  const passwordValid = passwordChecks.every((c) => c.done)
  const emailValid = useMemo(() => isValidEmail(email), [email])
  const emailMessage = getEmailValidationMessage(email)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!passwordValid) {
      setError('Please meet all password requirements')
      return
    }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">FlowBoard</h1>
          <p className="text-slate-500 text-base mt-2">Create your account</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-6"
        >
          {error && (
            <div
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full cursor-pointer rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="you@example.com"
            />
            {emailMessage && (
              <p className="text-xs text-red-600 mt-2" role="alert">
                {emailMessage}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <PasswordInput
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Create a strong password"
              required
              minLength={8}
            />
            <ul className="mt-1.5 space-y-0.5" aria-live="polite">
              {passwordChecks.map(({ id, label, done }) => (
                <li key={id} className="flex items-center gap-1.5 text-xs">
                  <CheckIcon done={done} />
                  <span className={done ? 'text-emerald-700' : 'text-slate-500'}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signup-confirm"
              className="block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <PasswordInput
              id="signup-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !emailValid || !passwordValid}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
          <p className="text-center text-sm text-slate-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
