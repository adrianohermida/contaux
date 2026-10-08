import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Provider do Assistente Contaux.
 * Mantém conversa e rascunho em memória (persiste entre rotas).
 * Não simula respostas — o estado padrão é "unavailable" até integração real.
 */
const AssistantContext = createContext(null)

function genId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AssistantProvider({ children }) {
  // Três estados: collapsed (rail), expanded (column), fullscreen (overlay)
  const [panelMode, setPanelMode] = useState('collapsed')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('unavailable') // unavailable | idle | preparing
  const location = useLocation()
  const { user } = useAuth()

  const expand = useCallback(() => setPanelMode('expanded'), [])
  const collapse = useCallback(() => setPanelMode('collapsed'), [])
  const enterFullscreen = useCallback(() => setPanelMode('fullscreen'), [])
  const exitFullscreen = useCallback(() => setPanelMode('expanded'), [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setDraft('')
  }, [])

  // Contexto explícito — espelho da sessão, não concede acesso
  const context = useMemo(
    () => ({
      actor: user?.name || 'Contador',
      role: user?.role || '—',
      route: location.pathname,
      company: null,
      period: null,
    }),
    [user, location.pathname],
  )

  const value = useMemo(
    () => ({
      panelMode,
      expand,
      collapse,
      enterFullscreen,
      exitFullscreen,
      messages,
      draft,
      setDraft,
      clearMessages,
      context,
      status,
    }),
    [panelMode, expand, collapse, enterFullscreen, exitFullscreen, messages, draft, clearMessages, context, status],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
