import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'

/**
 * Protege rotas do portal do cliente.
 * Redireciona staff para o dashboard e não-autenticados para o login.
 */
export default function PortalRoute({ children }) {
  const { user, loading, isClient } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isClient) return <Navigate to="/dashboard" replace />

  return children
}
