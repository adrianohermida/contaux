/**
 * 🔐 UNIFIED AUTH HOOK - Zero-Query Multitenant
 * 
 * Single source of truth for authentication across the app.
 * Replaces: useMultitenantAuth, useMultitenantAuthOptimized, useUserAndTenant*
 * 
 * ✨ Features:
 * - Zero additional queries (uses only AuthContext)
 * - Type-safe user validation
 * - Workspace isolation
 * - Helper methods (hasAccess, isInternal, isClient)
 * - Memoized for performance
 */

import { useMemo } from 'react';
import { useAuth } from './AuthContext';

export function useGlobalAuth(requiredType = null) {
  const { user: contextUser, loading: contextLoading, error: contextError } = useAuth();

  // Validate user synchronously from context
  const validatedUser = useMemo(() => {
    if (!contextUser) return null;

    // Require workspace_id and user_type
    if (!contextUser.workspace_id || !contextUser.user_type) {
      return null;
    }

    // Enforce required type if specified
    if (requiredType && contextUser.user_type !== requiredType) {
      return null;
    }

    return contextUser;
  }, [contextUser, requiredType]);

  // Compute access errors
  const accessError = useMemo(() => {
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
    error: accessError,
    hasAccess: (type) => validatedUser?.user_type === type || validatedUser?.role === `user_${type}`,
    isInternal: () =>
      validatedUser?.user_type === 'internal' || validatedUser?.role === 'user_internal' || validatedUser?.role === 'admin',
    isClient: () => validatedUser?.user_type === 'client' || validatedUser?.role === 'user_client',
    workspaceId: validatedUser?.workspace_id,
  };
}

// Backward compatibility exports
export const useMultitenantAuthOptimized = useGlobalAuth;
export const useUserAndTenant = useGlobalAuth;
export const useMultitenantAuth = useGlobalAuth;