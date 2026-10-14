import { createContext, useContext } from 'react'

/**
 * Shell canônico do Assistente — PKG-1.
 *
 * O core do assistente não conhece request Contaux, AuthContext HMADV,
 * base44Client, tabelas jurídicas ou rotas de negócio. Cada host injeta
 * seus adaptadores através deste contexto.
 *
 * Portas canônicas que cada host deve fornecer:
 * - useUser(): hook que retorna { user } do host
 * - request(url, opts): cliente HTTP autenticado do host
 * - getAccessToken(): retorna o token de acesso atual do host
 * - resolveModule(pathname): resolve rota → nome legível do módulo
 * - getModuleCoverage(pathname): retorna sugestões contextuais do módulo
 * - storagePrefix: prefixo para chaves de localStorage
 * - brandName: nome da marca para labels de UI
 * - navigate(url): navegação SPA do host (opcional)
 */
const AssistantShellContext = createContext(null)

export function AssistantShellProvider({ adapter, children }) {
  return (
    <AssistantShellContext.Provider value={adapter}>
      {children}
    </AssistantShellContext.Provider>
  )
}

export function useShell() {
  const ctx = useContext(AssistantShellContext)
  if (!ctx) throw new Error('useShell deve ser usado dentro de AssistantShellProvider')
  return ctx
}
