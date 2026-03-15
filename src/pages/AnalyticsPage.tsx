import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Component, lazy, Suspense } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { BarChart2, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/lib/store'
import type { OutletCtx, Task, Project } from '@/lib/types'

// ─── Module Federation loader ────────────────────────────────────────────────
// Loads the Webpack 5 remote by injecting its remoteEntry.js script tag, then
// calls the MF container API with the HOST's React singleton in the shared scope.
// Passing the host's React prevents the "two copies of React" problem that
// causes "Invalid hook call" errors when the remote tries to use useState/useEffect.

interface AnalyticsDashboardProps {
  tasks: Task[]
  projects: Project[]
  userId: string
}

declare global {
  interface Window {
    analytics_remote?: {
      init: (shareScope: Record<string, unknown>) => Promise<void>
      get: (module: string) => Promise<() => { default: React.ComponentType<AnalyticsDashboardProps> }>
    }
  }
}

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = url
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load remote entry: ${url}`))
    document.head.appendChild(script)
  })
}

// Build a MF shared scope entry for a module that is already loaded in the host.
// The remote container checks this scope during init and reuses the host's instance
// instead of loading its own bundled copy.
function makeSharedEntry(moduleFactory: () => unknown, version: string) {
  return {
    [version]: {
      get: () => Promise.resolve(moduleFactory),
      loaded: 1,
      from: 'host',
    },
  }
}

async function loadRemoteDashboard() {
  const baseUrl =
    (import.meta.env.VITE_ANALYTICS_REMOTE_URL as string | undefined) ??
    'http://localhost:3002'

  await loadScript(`${baseUrl}/remoteEntry.js`)

  const container = window.analytics_remote
  if (!container) {
    throw new Error(
      `analytics_remote container not found on window. Is the remote running at ${baseUrl}?`
    )
  }

  // Share the HOST's React instances so the remote reuses them.
  // This is the canonical fix for "Invalid hook call / two copies of React".
  const sharedScope = {
    react: makeSharedEntry(() => React, React.version),
    'react-dom': makeSharedEntry(() => ReactDOM, React.version),
  }
  await container.init(sharedScope)

  const factory = await container.get('./AnalyticsDashboard')
  const mod = factory()
  return { default: mod.default }
}

// React.lazy expects a promise that resolves to { default: ComponentType }
const RemoteDashboard = lazy(loadRemoteDashboard)

// ─── Skeleton ────────────────────────────────────────────────────────────────
function AnalyticsSkeleton() {
  const pulse = 'animate-pulse rounded-xl bg-slate-200'
  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="space-y-2">
        <div className={`${pulse} h-7 w-36`} />
        <div className={`${pulse} h-4 w-64`} />
      </div>
      <div className="flex gap-2">
        {[72, 96, 88, 80].map((w, i) => (
          <div key={i} className={`${pulse} h-8 rounded-full`} style={{ width: w }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 min-w-40 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm space-y-3">
            <div className={`${pulse} h-3 w-20`} />
            <div className={`${pulse} h-8 w-12`} />
            <div className={`${pulse} h-3 w-28`} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm space-y-4">
            <div className={`${pulse} h-3 w-32`} />
            <div className={`${pulse} h-56 w-full`} />
          </div>
        ))}
        <div className="sm:col-span-2 rounded-2xl bg-white border border-slate-100 p-6 shadow-sm space-y-4">
          <div className={`${pulse} h-3 w-40`} />
          <div className={`${pulse} h-56 w-full`} />
        </div>
        {[3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm space-y-4">
            <div className={`${pulse} h-3 w-32`} />
            <div className={`${pulse} h-44 w-full`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Error boundary ──────────────────────────────────────────────────────────
interface EBState { hasError: boolean; message: string }

class RemoteErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): EBState {
    return { hasError: true, message: err.message }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[AnalyticsPage] Remote failed to load:', err, info)
  }

  render() {
    if (this.state.hasError) {
      const remoteUrl =
        (import.meta.env.VITE_ANALYTICS_REMOTE_URL as string | undefined) ??
        'http://localhost:3002'

      return (
        <div className="flex flex-col items-center justify-center h-full gap-5 p-12 text-center bg-slate-50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-400">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700 mb-1">
              Analytics could not be loaded
            </p>
            <p className="text-sm text-slate-400 max-w-sm">
              The analytics remote is not reachable at{' '}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                {remoteUrl}
              </code>
              . Start it with:
            </p>
            <pre className="mt-3 rounded-xl bg-slate-900 text-emerald-400 text-xs px-5 py-3 text-left inline-block">
              cd analytics-remote{'\n'}npm install{'\n'}npm run dev
            </pre>
            <p className="text-xs text-slate-400 mt-3 font-mono break-all max-w-sm">
              {this.state.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const { ownedProjects, sharedProjects } = useOutletContext<OutletCtx>()
  const { user } = useAuth()
  const tasks = useUIStore((s) => s.tasks)
  const allProjects = [...ownedProjects, ...sharedProjects]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-3 shrink-0">
        <BarChart2 size={16} className="text-indigo-500" />
        <h1 className="text-sm font-semibold text-slate-800">Analytics</h1>
        <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
          MFE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <RemoteErrorBoundary>
          <Suspense fallback={<AnalyticsSkeleton />}>
            <RemoteDashboard
              tasks={tasks}
              projects={allProjects}
              userId={user?.uid ?? ''}
            />
          </Suspense>
        </RemoteErrorBoundary>
      </div>
    </div>
  )
}
