import { useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * Hook otimizado ZERO-QUERY para autenticação multitenant
 * Usa apenas o AuthContext - sem queries duplicadas
 */
export function useMultitenantAuthOptimized(requiredType = null) {
  const { user: contextUser, loading: contextLoading, error: contextError } = useAuth();

  // Validação síncrona - sem queries
  const validatedUser = useMemo(() => {
    if (!contextUser) return null;

    // Validar workspace_id e user_type
    if (!contextUser.workspace_id || !contextUser.user_type) {
      return null;
    }

    // Validar tipo requerido
    if (requiredType && contextUser.user_type !== requiredType) {
      return null;
    }

    return contextUser;
  }, [contextUser, requiredType]);

  const hasAccessError = useMemo(() => {
    if (contextError) return contextError;
    if (requiredType && contextUser && contextUser.user_type !== requiredType) {
      return `Acesso restrito para usuários do tipo ${requiredType}`;
    }
    if (contextUser && (!contextUser.workspace_id || !contextUser.user_type)) {
      return 'Usuário não configurado corretamente';
    }
    return null;
  }, [contextUser, requiredType, contextError]);

  return {
    user: validatedUser,
    loading: contextLoading,
    error: hasAccessError,
    hasAccess: (type) => validatedUser?.user_type === type || validatedUser?.role === `user_${type}`,
    isInternal: () =>
      validatedUser?.user_type === 'internal' || validatedUser?.role === 'user_internal' || validatedUser?.role === 'admin',
    isClient: () => validatedUser?.user_type === 'client' || validatedUser?.role === 'user_client',
    workspaceId: validatedUser?.workspace_id,
  };
}