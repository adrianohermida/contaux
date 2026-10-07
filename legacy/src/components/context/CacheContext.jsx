import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

/**
 * Context para cache distribuído entre componentes
 * Evita refetch desnecessários
 */
const CacheContext = createContext();

export function CacheProvider({ children }) {
  const cacheRef = useRef(new Map());
  const [version, setVersion] = useState(0);

  const set = useCallback((key, value, ttl = 5 * 60 * 1000) => {
    const expiry = Date.now() + ttl;
    cacheRef.current.set(key, { value, expiry });
  }, []);

  const get = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiry) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.value;
  }, []);

  const invalidate = useCallback((pattern) => {
    for (const key of cacheRef.current.keys()) {
      if (key.includes(pattern)) {
        cacheRef.current.delete(key);
      }
    }
    setVersion(v => v + 1);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    setVersion(v => v + 1);
  }, []);

  const value = {
    set,
    get,
    invalidate,
    clear,
    version
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache deve ser usado dentro de CacheProvider');
  }
  return context;
}