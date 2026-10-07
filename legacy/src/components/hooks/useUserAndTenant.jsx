import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook compartilhado para obter dados do usuário e tenant
 * Evita múltiplas chamadas API nas páginas
 */
export function useUserAndTenant() {
  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const tenant = currentUser.tenant_id || currentUser.email.split('@')[0];
        setTenantId(tenant);
      } catch (err) {
        setError(err);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { user, tenantId, loading, error };
}