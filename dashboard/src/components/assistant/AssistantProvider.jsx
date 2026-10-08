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
  const [pendingTask, setPendingTask] = useState(null) // tarefa proposta pelo assistente
  const [convStatus, setConvStatus] = useState('active') // active | waiting_human | with_human | closed
  const [queue, setQueue] = useState([])
  const [showQueue, setShowQueue] = useState(false)

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
    setConvStatus('active')
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
      setConvStatus(full.status || 'active')
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

  // Cria uma tarefa vinculada à conversa ativa (AC-GLOBAL-04)
  const createTask = useCallback(async (taskData) => {
    let convId = activeConvId
    if (!convId) {
      convId = await startNewConversation(taskData.title)
    }
    if (!convId) return null
    try {
      const task = await request(`/assistant/conversations/${convId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      })
      return task
    } catch {
      return null
    }
  }, [activeConvId, startNewConversation])

  // ===== CQ-04: Handoff IA→Humano =====

  // Solicitar handoff (transferir para atendente humano)
  const requestHandoff = useCallback(async (reason) => {
    let convId = activeConvId
    if (!convId) {
      convId = await startNewConversation('Atendimento humano')
    }
    if (!convId) return
    try {
      await request(`/assistant/conversations/${convId}/handoff`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      setConvStatus('waiting_human')
      setMessages((prev) => [...prev, {
        id: genId(),
        role: 'system',
        text: reason || 'Transferindo para atendimento humano...',
        event_type: 'handoff_requested',
      }])
    } catch {
      // Ignora
    }
  }, [activeConvId, startNewConversation])

  // Carregar fila de atendimento (staff)
  const loadQueue = useCallback(async () => {
    try {
      const list = await request('/assistant/conversations/queue')
      setQueue(list)
    } catch {
      setQueue([])
    }
  }, [])

  // Aceitar handoff (staff assume conversa)
  const acceptHandoff = useCallback(async (convId) => {
    try {
      await request(`/assistant/conversations/${convId}/accept`, { method: 'POST' })
      setQueue((prev) => prev.filter((c) => c.id !== convId))
    } catch {
      // Ignora
    }
  }, [])

  // Fechar conversa (staff encerra atendimento)
  const closeConversation = useCallback(async () => {
    if (!activeConvId) return
    try {
      await request(`/assistant/conversations/${activeConvId}/close`, { method: 'POST' })
      setConvStatus('closed')
      setMessages((prev) => [...prev, {
        id: genId(),
        role: 'system',
        text: 'Atendimento encerrado',
        event_type: 'conversation_closed',
      }])
    } catch {
      // Ignora
    }
  }, [activeConvId])

  const sendMessage = useCallback(async (text) => {
    const question = text.trim()
    if (!question || status === 'preparing') return

    setDraft('')
    const userMsg = { id: genId(), role: 'user', text: question, author_name: user?.name }
    setMessages((prev) => [...prev, userMsg])
    setStatus('preparing')

    // Cria conversa no backend se não existir
    let convId = activeConvId
    if (!convId) {
      convId = await startNewConversation(question)
    }
    // Salva mensagem do usuário
    saveMessage(convId, 'user', question)

    // Se a conversa está com humano, não chama a IA — apenas envia a mensagem
    if (convStatus === 'with_human' || convStatus === 'waiting_human') {
      setStatus('idle')
      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
      return
    }

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
  }, [status, activeConvId, startNewConversation, saveMessage, convStatus, user])

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
      createTask, pendingTask, setPendingTask,
      convStatus, requestHandoff, closeConversation,
      queue, loadQueue, acceptHandoff, showQueue, setShowQueue,
    }),
    [panelMode, expand, collapse, enterFullscreen, exitFullscreen,
     messages, draft, clearMessages, sendMessage,
     context, contextMode, toggleContextMode, status, unreadCount,
     conversations, activeConvId, showHistory,
     setShowHistory, openConversation, deleteConversation, startNewConversation,
     createTask, pendingTask,
     convStatus, requestHandoff, closeConversation,
     queue, loadQueue, acceptHandoff, showQueue],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
