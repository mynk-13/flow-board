import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'

export function ProtectedLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-14 flex items-center justify-between border-b border-slate-200 bg-white px-4">
        <span className="font-semibold text-slate-800">FlowBoard</span>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
