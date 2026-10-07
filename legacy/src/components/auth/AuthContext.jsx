import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar user na primeira vez e manter em cache agressivo
  useEffect(() => {
    const loadUser = async () => {
      try {
        const cachedUser = sessionStorage.getItem('authUser');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          setLoading(false);
          return;
        }

        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setLoading(false);
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);
        sessionStorage.setItem('authUser', JSON.stringify(currentUser));
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Erro ao autenticar');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = useCallback(async () => {
    sessionStorage.removeItem('authUser');
    setUser(null);
    await base44.auth.logout();
  }, []);

  // Memoizar valores computados
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    logout,
    workspaceId: user?.workspace_id,
    userType: user?.user_type,
    isInternal: user?.user_type === 'internal' || user?.role === 'user_internal' || user?.role === 'admin',
    isClient: user?.user_type === 'client' || user?.role === 'user_client',
  }), [user, loading, error, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}