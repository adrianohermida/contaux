import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook para gerenciar autenticação multitenant
 * Valida user_type e workspace_id
 */
export function useMultitenantAuth(requiredType = null) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }

        const currentUser = await base44.auth.me();
        
        // Validar se usuário tem workspace_id e user_type
        if (!currentUser.workspace_id || !currentUser.user_type) {
          setError('Usuário não configurado corretamente. Contate o administrador.');
          setLoading(false);
          return;
        }

        // Validar tipo de usuário requerido
        if (requiredType && currentUser.user_type !== requiredType) {
          setError(`Acesso restrito para usuários do tipo ${requiredType}`);
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Erro ao autenticar');
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredType]);

  const hasAccess = (type) => {
    if (!user) return false;
    // Suportar ambos os formatos: user_type e role
    return user?.user_type === type || user?.role === `user_${type}`;
  };

  const isInternal = () => {
    if (!user) return false;
    return user?.user_type === 'internal' || user?.role === 'user_internal' || user?.role === 'admin';
  };

  const isClient = () => {
    if (!user) return false;
    return user?.user_type === 'client' || user?.role === 'user_client';
  };

  return {
    user,
    loading,
    error,
    hasAccess,
    isInternal,
    isClient,
    workspaceId: user?.workspace_id
  };
}