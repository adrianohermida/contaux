/**
 * React Query Cache Configuration
 * Otimiza caching strategy para diferentes tipos de dados
 */

// Configuração padrão para dados que mudam frequentemente
export const CACHE_CONFIG_SHORT = {
  staleTime: 2 * 60 * 1000,        // 2 minutos
  gcTime: 5 * 60 * 1000,            // 5 minutos
  retry: 1,
  retryDelay: 1000,
};

// Configuração para dados que raramente mudam
export const CACHE_CONFIG_LONG = {
  staleTime: 30 * 60 * 1000,        // 30 minutos
  gcTime: 60 * 60 * 1000,            // 1 hora
  retry: 1,
  retryDelay: 1000,
};

// Configuração para dados críticos (contatos, invoices, etc)
export const CACHE_CONFIG_CRITICAL = {
  staleTime: 5 * 60 * 1000,         // 5 minutos
  gcTime: 15 * 60 * 1000,            // 15 minutos
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Configuração para dados estáticos
export const CACHE_CONFIG_STATIC = {
  staleTime: Infinity,              // Nunca fica stale
  gcTime: 60 * 60 * 1000,            // 1 hora
  retry: false,
};

/**
 * Função helper para obter config apropriada
 */
export function getCacheConfig(type = 'default') {
  const configs = {
    short: CACHE_CONFIG_SHORT,
    long: CACHE_CONFIG_LONG,
    critical: CACHE_CONFIG_CRITICAL,
    static: CACHE_CONFIG_STATIC,
    default: CACHE_CONFIG_SHORT,
  };
  return configs[type] || configs.default;
}

/**
 * Exemplo de uso:
 * 
 * import { getCacheConfig } from '@/hooks/useQueryCacheConfig';
 * 
 * useQuery({
 *   queryKey: ['contacts', workspaceId],
 *   queryFn: fetchContacts,
 *   ...getCacheConfig('critical')
 * });
 * 
 * useQuery({
 *   queryKey: ['settings', workspaceId],
 *   queryFn: fetchSettings,
 *   ...getCacheConfig('static')
 * });
 */