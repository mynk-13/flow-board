/**
 * Full-page loading screen shown while Firebase resolves the initial auth state.
 * Matches the dark aesthetic of the auth pages.
 */
export function LoadingScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center gap-10">

      {/* Background glow blobs — same as auth pages */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-violet-700/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

      {/* Brand mark */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Animated logo */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Spinning ring */}
          <svg
            className="absolute inset-0 h-full w-full animate-spin"
            style={{ animationDuration: '1.4s' }}
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle
              cx="32" cy="32" r="28"
              stroke="url(#ringGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="90 86"
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Logo icon inside ring */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40">
            {/* Kanban columns icon */}
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <rect x="2"  y="3" width="4" height="11" rx="1" opacity="1"   />
              <rect x="8"  y="3" width="4" height="7"  rx="1" opacity="0.8" />
              <rect x="14" y="3" width="4" height="14" rx="1" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">FlowBoard</h1>
          <p className="mt-1 text-sm text-slate-400">Loading your workspace…</p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-indigo-500"
              style={{
                animation: 'dotPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Dot pulse keyframes injected inline */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
