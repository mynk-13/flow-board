import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { LoadingScreen } from '@/shared/LoadingScreen'

/**
 * Wraps login/signup pages: if already logged in, redirect to app.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return null
  }

  return <>{children}</>
}
