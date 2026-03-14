import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { saveUserProfile } from '@/lib/firestore'

type AuthState = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthState & { signOut: () => Promise<void> } | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      // Persist user profile so email → uid lookup works for sharing
      if (u?.email) {
        saveUserProfile(u.uid, u.email.toLowerCase()).catch(() => {
          // non-critical, ignore
        })
      }
    })
    return () => unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
