import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { setAccessToken } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Tenta restaurar sessão via cookie de refresh ao montar
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Sem sessão')
      const data = await res.json()
      setAccessToken(data.token)
      setUser(data.user)
      return data.user
    } catch {
      setAccessToken(null)
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    refreshSession().finally(() => setLoading(false))
  }, [refreshSession])

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao entrar')
    setAccessToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch { /* ignora erro de rede no logout */ }
    setAccessToken(null)
    setUser(null)
  }

  const isClient = user?.role === 'client'
  const isStaff = ['superadmin', 'admin', 'accountant', 'viewer'].includes(user?.role)
  const isAdmin = ['superadmin', 'admin'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession, isClient, isStaff, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
