import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { request } from '@/lib/api'

/**
 * Provider do Assistente Contaux.
 * Mantém conversa e rascunho em memória (persiste entre rotas).
 * Integração real com /api/knowledge-base/ask (busca na base de conhecimento).
 */
const AssistantContext = createContext(null)

function genId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AssistantProvider({ children }) {
  const [panelMode, setPanelMode] = useState('collapsed')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('idle') // idle | preparing
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

  const sendMessage = useCallback(async (text) => {
    const question = text.trim()
    if (!question || status === 'preparing') return

    setDraft('')
    setMessages((prev) => [...prev, { id: genId(), role: 'user', text: question }])
    setStatus('preparing')

    try {
      const res = await request('/knowledge-base/ask', {
        method: 'POST',
        body: JSON.stringify({ question }),
      })
      setMessages((prev) => [...prev, {
        id: genId(),
        role: 'assistant',
        text: res.answer,
        sources: res.sources || [],
      }])
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: genId(),
        role: 'assistant',
        text: `Erro ao consultar: ${err.message}`,
        sources: [],
      }])
    } finally {
      setStatus('idle')
    }
  }, [status])

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
      panelMode, expand, collapse, enterFullscreen, exitFullscreen,
      messages, draft, setDraft, clearMessages, sendMessage,
      context, status,
    }),
    [panelMode, expand, collapse, enterFullscreen, exitFullscreen, messages, draft, clearMessages, sendMessage, context, status],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
