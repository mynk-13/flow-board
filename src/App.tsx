import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { AuthRedirect } from '@/app/AuthRedirect'
import { AppLayout } from '@/app/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { BoardPage } from '@/pages/BoardPage'
import { LoadingScreen } from '@/shared/LoadingScreen'

/**
 * Blocks rendering until Firebase resolves the initial auth state.
 * Without this, a brief flash of the wrong page (login or app) occurs.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return <>{children}</>
}

/**
 * Wraps protected routes. Redirects unauthenticated users to /login,
 * preserving the path they tried to visit so we can restore it after sign-in.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          {/* Public auth pages — redirect to app if already signed in */}
          <Route path="/login"  element={<AuthRedirect><LoginPage /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />

          {/* Protected app routes — redirect to /login if not signed in */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="board/:projectId" element={<BoardPage />} />
          </Route>

          {/* Any unknown path → login (not app, since user may not be authed) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}
