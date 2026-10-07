import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

/**
 * @deprecated Use ProtectedInternalRoute or ProtectedClientRoute
 * Esta função mantém compatibilidade com código antigo
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }

        const currentUser = await base44.auth.me();
        
        if (requireAdmin && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return children;
}