import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'

/**
 * Protege rotas do dashboard interno (staff apenas).
 * Redireciona clientes para o portal e não-autenticados para o login.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isStaff } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isStaff) return <Navigate to="/portal" replace />

  return children
}
