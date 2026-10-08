import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { request } from '@/lib/api'
import { resolveModule } from './moduleContext'

/**
 * Provider do Assistente Contaux.
 * Mantém conversa, rascunho e modo de contexto persistidos em localStorage.
 * Integração real com /api/knowledge-base/ask (busca na base de conhecimento).
 * Três estados: recolhido (minimizado), expandido (painel lateral), fullscreen.
 */
const AssistantContext = createContext(null)
const STORAGE_KEY = 'contaux-assistant'

function genId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AssistantProvider({ children }) {
  const persisted = useRef(loadPersisted())
  const [panelMode, setPanelMode] = useState(persisted.current?.panelMode || 'collapsed')
  const [messages, setMessages] = useState(persisted.current?.messages || [])
  const [draft, setDraft] = useState(persisted.current?.draft || '')
  const [status, setStatus] = useState('idle') // idle | preparing
  const [unreadCount, setUnreadCount] = useState(0)
  // 'follow' = acompanhar esta tela; 'fixed' = manter contexto desta conversa
  const [contextMode, setContextMode] = useState(persisted.current?.contextMode || 'follow')
  const [lockedContext, setLockedContext] = useState(persisted.current?.lockedContext || null)

  const location = useLocation()
  const { user } = useAuth()

  // Persiste estado em localStorage (sobrevive a recarregar a página)
  useEffect(() => {
    const data = { panelMode, messages, draft, contextMode, lockedContext }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // localStorage cheio ou indisponível — ignora
    }
  }, [panelMode, messages, draft, contextMode, lockedContext])

  const expand = useCallback(() => {
    setPanelMode('expanded')
    setUnreadCount(0)
  }, [])
  const collapse = useCallback(() => setPanelMode('collapsed'), [])
  const enterFullscreen = useCallback(() => {
    setPanelMode('fullscreen')
    setUnreadCount(0)
  }, [])
  const exitFullscreen = useCallback(() => {
    setPanelMode('expanded')
    setUnreadCount(0)
  }, [])

  // Alterna modo de contexto: follow ↔ fixed
  const toggleContextMode = useCallback(() => {
    setContextMode((prev) => {
      if (prev === 'follow') {
        // Ao travar, captura o contexto atual
        setLockedContext({
          actor: user?.name || 'Contador',
          role: user?.role || '—',
          module: resolveModule(location.pathname),
          route: location.pathname,
          company: null,
          period: null,
        })
        return 'fixed'
      }
      // Ao destravar, libera o contexto para seguir a tela
      setLockedContext(null)
      return 'follow'
    })
  }, [user, location.pathname])

  const clearMessages = useCallback(() => {
    setMessages([])
    setDraft('')
    setUnreadCount(0)
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
      // Incrementa não-lidas se o painel estiver recolhido
      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: genId(),
        role: 'assistant',
        text: `Erro ao consultar: ${err.message}`,
        sources: [],
      }])
      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
    } finally {
      setStatus('idle')
    }
  }, [status])

  // Contexto derivado: segue a tela (follow) ou usa o travado (fixed)
  const context = useMemo(() => {
    if (contextMode === 'fixed' && lockedContext) return lockedContext
    return {
      actor: user?.name || 'Contador',
      role: user?.role || '—',
      module: resolveModule(location.pathname),
      route: location.pathname,
      company: null,
      period: null,
    }
  }, [user, location.pathname, contextMode, lockedContext])

  const value = useMemo(
    () => ({
      panelMode, expand, collapse, enterFullscreen, exitFullscreen,
      messages, draft, setDraft, clearMessages, sendMessage,
      context, contextMode, toggleContextMode,
      status, unreadCount,
    }),
    [panelMode, expand, collapse, enterFullscreen, exitFullscreen,
     messages, draft, clearMessages, sendMessage,
     context, contextMode, toggleContextMode, status, unreadCount],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
