import { useState } from 'react'

type InputState = 'default' | 'error' | 'success'

type PasswordInputProps = {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  className?: string
  /** Icon node rendered on the left side of the input */
  leftIcon?: React.ReactNode
  /** Controls border/ring colour */
  state?: InputState
}

const STATE_CLASSES: Record<InputState, string> = {
  default: 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20',
  error:   'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-400/20',
  success: 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20',
}

export function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete = 'current-password',
  required,
  minLength,
  className = '',
  leftIcon,
  state = 'default',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {leftIcon}
        </span>
      )}
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className={`w-full cursor-text rounded-xl border ${leftIcon ? 'pl-10' : 'pl-4'} pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${STATE_CLASSES[state]} ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? (
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  )
}
