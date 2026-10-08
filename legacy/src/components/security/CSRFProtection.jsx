import React from 'react';

/**
 * CSRFProtection - Proteção contra CSRF attacks
 * Token-based prevention usando SameSite cookies
 */

class CSRFManager {
  constructor() {
    this.token = null;
    this.initialized = false;
  }

  /**
   * Gera novo token CSRF
   */
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    this.saveToken();
    return this.token;
  }

  /**
   * Salva token no sessionStorage (não persiste entre abas)
   */
  saveToken() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', this.token);
    }
  }

  /**
   * Recupera token salvo
   */
  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('csrf_token');
    }

    if (!this.token) {
      this.token = this.generateToken();
    }

    return this.token;
  }

  /**
   * Valida token (simples comparação)
   */
  validateToken(token) {
    return token === this.getToken();
  }

  /**
   * Limpa token (logout, etc)
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('csrf_token');
    }
  }
}

// Singleton instance
export const csrfManager = new CSRFManager();

/**
 * Hook para usar CSRF token
 */
export function useCSRFToken() {
  const [token, setToken] = React.useState(null);

  React.useEffect(() => {
    const csrfToken = csrfManager.getToken();
    setToken(csrfToken);
  }, []);

  const addToRequest = (config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-CSRF-Token': token,
      },
    };
  };

  return { token, addToRequest };
}

/**
 * Middleware para adicionar CSRF token a requisições
 */
export function withCSRFToken(axiosInstance) {
  axiosInstance.interceptors.request.use((config) => {
    const token = csrfManager.getToken();
    config.headers['X-CSRF-Token'] = token;
    return config;
  });

  return axiosInstance;
}

/**
 * Component para formulários com CSRF protection
 */
export const CSRFForm = React.memo(function CSRFForm({
  onSubmit,
  children,
  ...props
}) {
  const { token } = useCSRFToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valida token antes de submit
    if (!csrfManager.validateToken(token)) {
      console.error('CSRF token inválido');
      return;
    }

    await onSubmit?.(e);
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {token && <input type="hidden" name="csrf_token" value={token} />}
      {children}
    </form>
  );
});

CSRFForm.displayName = 'CSRFForm';

/**
 * Função helper para adicionar CSRF token a POST/PUT/DELETE
 */
export async function makeSecureRequest(url, options = {}) {
  const token = csrfManager.getToken();

  const config = {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}