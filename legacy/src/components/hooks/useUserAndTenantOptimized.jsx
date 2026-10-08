import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';

/**
 * Hook otimizado com React Query para user + tenant
 * Cached por 5 minutos
 */
export function useUserAndTenantOptimized() {
  const { user: contextUser, loading: contextLoading, error: contextError } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-tenant'],
    queryFn: () => {
      if (!contextUser) return null;

      const tenant = contextUser.tenant_id || contextUser.workspace_id || contextUser.email.split('@')[0];

      return {
        user: contextUser,
        tenantId: tenant,
      };
    },
    enabled: !contextLoading && !!contextUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const loading = contextLoading || isLoading;
  const appError = contextError || error?.message;

  return {
    user: data?.user || null,
    tenantId: data?.tenantId || null,
    loading,
    error: appError,
  };
}