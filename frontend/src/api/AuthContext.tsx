import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { fetchMe, login as loginRequest } from "@/api/auth"
import { clearTokens, getAccess, setTokens } from "@/lib/tokens"
import type { User } from "@/types/user"

export type { Role, User } from "@/types/user"

interface AuthValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(getAccess()))

  // Restore the session on page load.
  useEffect(() => {
    if (!getAccess()) return
    let cancelled = false
    fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => clearTokens())
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // The API client fires this when a token refresh fails.
  useEffect(() => {
    const onForcedLogout = () => setUser(null)
    window.addEventListener("auth:logout", onForcedLogout)
    return () => window.removeEventListener("auth:logout", onForcedLogout)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginRequest(username, password)
    setTokens(data.access, data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

// For pages that only render when someone is signed in.
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error("useCurrentUser needs a signed-in user")
  return user
}