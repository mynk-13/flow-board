import { useAuth } from '@/features/auth'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center">
        <p className="text-slate-500">Welcome to FlowBoard. Boards and projects will appear here.</p>
      </div>
    </div>
  )
}
