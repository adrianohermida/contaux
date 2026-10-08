import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'contaux-token'
const USER_KEY = 'contaux-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem(TOKEN_KEY)

  const fetchMe = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) { setLoading(false); return }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) throw new Error('Token inválido')
      const data = await res.json()
      setUser(data)
      localStorage.setItem(USER_KEY, JSON.stringify(data))
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao entrar')
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const isClient = user?.role === 'client'
  const isStaff = ['superadmin', 'admin', 'accountant', 'viewer'].includes(user?.role)
  const isAdmin = ['superadmin', 'admin'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isClient, isStaff, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
