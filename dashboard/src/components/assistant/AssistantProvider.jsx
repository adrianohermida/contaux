import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { request } from '@/lib/api'
import { resolveModule } from './moduleContext'

/**
 * Provider do Assistente Contaux (AC-GLOBAL-01 + AC-GLOBAL-02).
 * Conversas persistentes no backend (PostgreSQL) com fallback em localStorage.
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
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState(persisted.current?.draft || '')
  const [status, setStatus] = useState('idle') // idle | preparing
  const [unreadCount, setUnreadCount] = useState(0)
  const [contextMode, setContextMode] = useState(persisted.current?.contextMode || 'follow')
  const [lockedContext, setLockedContext] = useState(persisted.current?.lockedContext || null)
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const location = useLocation()
  const { user } = useAuth()

  // Persiste estado UI em localStorage (não persiste mensagens — vão pro backend)
  useEffect(() => {
    const data = { panelMode, draft, contextMode, lockedContext, activeConvId }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // localStorage cheio ou indisponível — ignora
    }
  }, [panelMode, draft, contextMode, lockedContext, activeConvId])

  // Carrega lista de conversas do backend ao montar
  const loadConversations = useCallback(async () => {
    try {
      const list = await request('/assistant/conversations')
      setConversations(list)
      // Se há conversa ativa salva, carrega suas mensagens
      if (persisted.current?.activeConvId) {
        const conv = list.find((c) => c.id === persisted.current.activeConvId)
        if (conv) {
          const full = await request(`/assistant/conversations/${conv.id}`)
          setMessages(full.messages || [])
          setActiveConvId(conv.id)
        }
      }
    } catch {
      // Backend indisponível — mantém estado local vazio
    }
  }, [])

  useEffect(() => {
    if (user) loadConversations()
  }, [user, loadConversations])

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

  const toggleContextMode = useCallback(() => {
    setContextMode((prev) => {
      if (prev === 'follow') {
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
      setLockedContext(null)
      return 'follow'
    })
  }, [user, location.pathname])

  const clearMessages = useCallback(() => {
    setMessages([])
    setActiveConvId(null)
    setShowHistory(false)
  }, [])

  // Cria nova conversa no backend
  const startNewConversation = useCallback(async (firstMessage) => {
    try {
      const title = firstMessage.length > 40 ? firstMessage.substring(0, 40) + '...' : firstMessage
      const conv = await request('/assistant/conversations', {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      setActiveConvId(conv.id)
      setConversations((prev) => [conv, ...prev])
      return conv.id
    } catch {
      // Fallback: conversa local sem persistência
      return null
    }
  }, [])

  // Salva mensagem no backend
  const saveMessage = useCallback(async (convId, role, text, sources = null) => {
    if (!convId) return
    try {
      await request(`/assistant/conversations/${convId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ role, text, sources }),
      })
    } catch {
      // Silencioso — a mensagem já está na UI
    }
  }, [])

  // Abre uma conversa existente do histórico
  const openConversation = useCallback(async (convId) => {
    try {
      const full = await request(`/assistant/conversations/${convId}`)
      setMessages(full.messages || [])
      setActiveConvId(convId)
      setShowHistory(false)
    } catch {
      // Ignora — mantém conversa atual
    }
  }, [])

  // Deleta uma conversa
  const deleteConversation = useCallback(async (convId) => {
    try {
      await request(`/assistant/conversations/${convId}`, { method: 'DELETE' })
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (activeConvId === convId) {
        setMessages([])
        setActiveConvId(null)
      }
    } catch {
      // Ignora
    }
  }, [activeConvId])

  const sendMessage = useCallback(async (text) => {
    const question = text.trim()
    if (!question || status === 'preparing') return

    setDraft('')
    const userMsg = { id: genId(), role: 'user', text: question }
    setMessages((prev) => [...prev, userMsg])
    setStatus('preparing')

    // Cria conversa no backend se não existir
    let convId = activeConvId
    if (!convId) {
      convId = await startNewConversation(question)
    }
    // Salva mensagem do usuário
    saveMessage(convId, 'user', question)

    try {
      const res = await request('/knowledge-base/ask', {
        method: 'POST',
        body: JSON.stringify({ question }),
      })
      const assistantMsg = {
        id: genId(),
        role: 'assistant',
        text: res.answer,
        sources: res.sources || [],
      }
      setMessages((prev) => [...prev, assistantMsg])
      saveMessage(convId, 'assistant', res.answer, res.sources || [])

      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
    } catch (err) {
      const errorMsg = {
        id: genId(),
        role: 'assistant',
        text: `Erro ao consultar: ${err.message}`,
        sources: [],
      }
      setMessages((prev) => [...prev, errorMsg])
      saveMessage(convId, 'assistant', `Erro ao consultar: ${err.message}`, [])
      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
    } finally {
      setStatus('idle')
    }
  }, [status, activeConvId, startNewConversation, saveMessage])

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
      conversations, activeConvId, showHistory,
      setShowHistory, openConversation, deleteConversation, startNewConversation,
    }),
    [panelMode, expand, collapse, enterFullscreen, exitFullscreen,
     messages, draft, clearMessages, sendMessage,
     context, contextMode, toggleContextMode, status, unreadCount,
     conversations, activeConvId, showHistory,
     setShowHistory, openConversation, deleteConversation, startNewConversation],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
