import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { request, getAccessToken } from '@/lib/api'
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
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [hasMoreConversations, setHasMoreConversations] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeConvId, setActiveConvId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [pendingTask, setPendingTask] = useState(null) // tarefa proposta pelo assistente
  const [convStatus, setConvStatus] = useState('active') // active | waiting_human | with_human | closed
  const [queue, setQueue] = useState([])
  const [showQueue, setShowQueue] = useState(false)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'conversation'
  const [availableTools, setAvailableTools] = useState([])
  const [pendingToolCall, setPendingToolCall] = useState(null) // tool aguardando aprovação
  const [memories, setMemories] = useState([])
  const [attachments, setAttachments] = useState([])
  const [proactiveSuggestions, setProactiveSuggestions] = useState([])
  const [proactiveEnabled, setProactiveEnabled] = useState(true)
  const [projects, setProjects] = useState([])
  const [activeProjectFilter, setActiveProjectFilter] = useState(null) // project_id ou null
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [dots, setDots] = useState([])
  const [activeDotId, setActiveDotId] = useState(null)

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
      const data = await request('/assistant/conversations')
      // API returns { conversations, total, hasMore } (paginated) or array (legacy)
      const list = Array.isArray(data) ? data : (data.conversations || [])
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

  // Carrega tools disponíveis para o role do usuário (CQ-05)
  const loadTools = useCallback(async () => {
    try {
      const tools = await request('/assistant/tools')
      setAvailableTools(tools)
    } catch {
      setAvailableTools([])
    }
  }, [])

  useEffect(() => {
    if (user) loadTools()
  }, [user, loadTools])

  // ===== CQ-07: Proatividade interna =====

  // Carregar sugestões pendentes do backend
  const loadProactiveSuggestions = useCallback(async () => {
    try {
      const list = await request('/assistant/suggestions')
      setProactiveSuggestions(list)
    } catch {
      setProactiveSuggestions([])
    }
  }, [])

  // Gerar novas sugestões (chamado periodicamente)
  const generateProactiveSuggestions = useCallback(async () => {
    try {
      await request('/assistant/suggestions/generate', { method: 'POST' })
      // Após gerar, recarrega a lista
      const list = await request('/assistant/suggestions')
      setProactiveSuggestions(list)
    } catch {
      // Silencioso
    }
  }, [])

  // Dispensar uma sugestão
  const dismissProactive = useCallback(async (suggestionId) => {
    setProactiveSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
    try {
      await request(`/assistant/suggestions/${suggestionId}/dismiss`, { method: 'POST' })
    } catch {
      // Ignora
    }
  }, [])

  // Agir sobre uma sugestão (navegar)
  const actOnProactive = useCallback(async (suggestionId) => {
    setProactiveSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
    try {
      const result = await request(`/assistant/suggestions/${suggestionId}/act`, { method: 'POST' })
      if (result.action_url) {
        window.dispatchEvent(new CustomEvent('assistant-navigate', { detail: result.action_url }))
      }
    } catch {
      // Ignora
    }
  }, [])

  // Polling: carrega sugestões ao montar e a cada 5 minutos
  useEffect(() => {
    if (!user || user.role === 'client') return
    loadProactiveSuggestions()
    // Gera sugestões 3s após montar (deixa a página carregar primeiro)
    const genTimer = setTimeout(() => generateProactiveSuggestions(), 3000)
    // Polling a cada 5 minutos
    const interval = setInterval(() => generateProactiveSuggestions(), 5 * 60 * 1000)
    return () => { clearTimeout(genTimer); clearInterval(interval) }
  }, [user, loadProactiveSuggestions, generateProactiveSuggestions])

  // ===== Projetos (agrupar conversas) =====

  const loadProjects = useCallback(async () => {
    try {
      const list = await request('/assistant/projects')
      setProjects(list)
    } catch {
      setProjects([])
    }
  }, [])

  const createProject = useCallback(async (name, description, color) => {
    try {
      const proj = await request('/assistant/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description, color }),
      })
      setProjects((prev) => [proj, ...prev])
      return proj
    } catch {
      return null
    }
  }, [])

  const updateProject = useCallback(async (projectId, data) => {
    try {
      const proj = await request(`/assistant/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...proj } : p)))
      return proj
    } catch {
      return null
    }
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    try {
      await request(`/assistant/projects/${projectId}`, { method: 'DELETE' })
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      // Desvincula conversas do projeto removido
      setConversations((prev) => prev.map((c) =>
        c.project_id === projectId ? { ...c, project_id: null } : c,
      ))
      if (activeProjectId === projectId) setActiveProjectId(null)
    } catch {
      // Ignora
    }
  }, [activeProjectId])

  const assignConversationToProject = useCallback(async (convId, projectId) => {
    try {
      await request(`/assistant/conversations/${convId}/project`, {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId }),
      })
      setConversations((prev) => prev.map((c) =>
        c.id === convId ? { ...c, project_id: projectId ? String(projectId) : null } : c,
      ))
    } catch {
      // Ignora
    }
  }, [])

  // Carrega projetos ao montar
  useEffect(() => {
    if (user) loadProjects()
  }, [user, loadProjects])

  // ===== Dots (assistentes configuráveis) =====

  const loadDots = useCallback(async () => {
    try {
      const list = await request('/assistant/dots')
      setDots(list)
    } catch {
      setDots([])
    }
  }, [])

  const createDot = useCallback(async (data) => {
    try {
      const dot = await request('/assistant/dots', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setDots((prev) => [dot, ...prev])
      return dot
    } catch {
      return null
    }
  }, [])

  const updateDot = useCallback(async (dotId, data) => {
    try {
      const dot = await request(`/assistant/dots/${dotId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setDots((prev) => prev.map((d) => (d.id === dotId ? { ...d, ...dot } : d)))
      return dot
    } catch {
      return null
    }
  }, [])

  const deleteDot = useCallback(async (dotId) => {
    try {
      await request(`/assistant/dots/${dotId}`, { method: 'DELETE' })
      setDots((prev) => prev.filter((d) => d.id !== dotId))
      if (activeDotId === dotId) setActiveDotId(null)
    } catch {
      // Ignora
    }
  }, [activeDotId])

  useEffect(() => {
    if (user) loadDots()
  }, [user, loadDots])

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
    setMobileView('conversation')
    setActiveDotId(null)
  }, [])

  // Cria nova conversa no backend
  const startNewConversation = useCallback(async (firstMessage) => {
    try {
      const title = firstMessage.length > 40 ? firstMessage.substring(0, 40) + '...' : firstMessage
      const conv = await request('/assistant/conversations', {
        method: 'POST',
        body: JSON.stringify({ title, dot_id: activeDotId }),
      })
      setActiveConvId(conv.id)
      setConversations((prev) => [conv, ...prev])
      return conv.id
    } catch {
      // Fallback: conversa local sem persistência
      return null
    }
  }, [activeDotId])

  // Salva mensagem do usuário no backend
  // CORREÇÃO DE SEGURANÇA: o role é sempre 'user' — o servidor define a autoria.
  // Mensagens 'assistant' e 'system' são salvas pelo servidor nos respectivos endpoints.
  const saveUserMessage = useCallback(async (convId, text, sources = null) => {
    if (!convId) return
    try {
      await request(`/assistant/conversations/${convId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, sources }),
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
      setActiveDotId(full.dot_id || null)
      setShowHistory(false)
      setMobileView('conversation')
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

  // Adiciona mensagem de tool ao chat (CQ-05)
  const addToolMessage = useCallback(async (toolName, result) => {
    const convId = activeConvId
    const summary = result.success
      ? JSON.stringify(result.result, null, 2).substring(0, 500)
      : `❌ ${result.error || result.reason || 'Erro desconhecido'}`
    const text = `🔧 **${toolName}**\n\n\`\`\`${summary}\`\`\``
    const msg = { id: genId(), role: 'assistant', text, sources: [] }
    setMessages((prev) => [...prev, msg])
    // O servidor salva a mensagem da tool — não enviamos role do cliente
  }, [activeConvId])

  // ===== CQ-05: Ferramentas operacionais =====

  // Executar uma tool (com aprovação se necessário)
  const executeAssistantTool = useCallback(async (toolName, params, requiresApproval) => {
    let convId = activeConvId
    if (!convId) {
      convId = await startNewConversation(`Tool: ${toolName}`)
    }

    const execCall = async () => {
      try {
        const result = await request('/assistant/tools/execute', {
          method: 'POST',
          body: JSON.stringify({ tool: toolName, params, conversation_id: convId }),
        })
        return result
      } catch (err) {
        return { success: false, error: err.message }
      }
    }

    // Se precisa aprovação, mostra o modal e espera
    if (requiresApproval) {
      return new Promise((resolve) => {
        setPendingToolCall({
          tool: toolName,
          params,
          description: availableTools.find((t) => t.name === toolName)?.description,
          onApprove: async () => {
            setPendingToolCall(null)
            const result = await execCall()
            resolve(result)
          },
          onReject: () => {
            setPendingToolCall(null)
            resolve({ success: false, denied: true, reason: 'Usuário cancelou' })
          },
        })
      })
    }

    return execCall()
  }, [activeConvId, startNewConversation, availableTools])

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
      // Recarrega conversas para incluir o atendimento assumido
      await loadConversations()
    } catch {
      // Ignora
    }
  }, [loadConversations])

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

  // ===== CQ-06: Memória, anexos e voz =====

  // Carregar memórias do usuário/tenant
  const loadMemories = useCallback(async (scope = 'all') => {
    try {
      const params = scope !== 'all' ? `?scope=${scope}` : ''
      const list = await request(`/assistant/memory${params}`)
      setMemories(list)
    } catch {
      setMemories([])
    }
  }, [])

  // Salvar uma memória
  const saveMemoryItem = useCallback(async (scope, key, value, conversationId) => {
    try {
      const mem = await request('/assistant/memory', {
        method: 'POST',
        body: JSON.stringify({ scope, key, value, conversation_id: conversationId }),
      })
      setMemories((prev) => {
        const idx = prev.findIndex((m) => m.key === key && m.scope === scope)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = mem
          return next
        }
        return [mem, ...prev]
      })
      return mem
    } catch {
      return null
    }
  }, [])

  // Deletar uma memória
  const deleteMemoryItem = useCallback(async (memId) => {
    try {
      await request(`/assistant/memory/${memId}`, { method: 'DELETE' })
      setMemories((prev) => prev.filter((m) => m.id !== memId))
    } catch {
      // Ignora
    }
  }, [])

  // Upload de anexo para a conversa ativa
  const uploadAttachment = useCallback(async (file) => {
    let convId = activeConvId
    if (!convId) {
      convId = await startNewConversation(`Anexo: ${file.name}`)
    }
    if (!convId) return null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const resp = await fetch(`/api/assistant/conversations/${convId}/attachments`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: formData,
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao enviar anexo')
      }
      const att = await resp.json()
      // Adiciona mensagem de sistema no chat (não persiste — o servidor define autoria)
      const msg = { id: genId(), role: 'system', text: `📎 ${att.filename}`, event_type: 'attachment' }
      setMessages((prev) => [...prev, msg])
      return att
    } catch (err) {
      const msg = { id: genId(), role: 'system', text: `❌ Erro: ${err.message}`, event_type: 'error' }
      setMessages((prev) => [...prev, msg])
      return null
    }
  }, [activeConvId, startNewConversation])

  // Carregar anexos de uma conversa
  const loadAttachments = useCallback(async (convId) => {
    if (!convId) { setAttachments([]); return }
    try {
      const list = await request(`/assistant/conversations/${convId}/attachments`)
      setAttachments(list)
    } catch {
      setAttachments([])
    }
  }, [])

  // Transcrição de voz — anexa ao rascunho
  const handleVoiceTranscript = useCallback((transcript) => {
    setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }, [])

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

    // Se a conversa está com humano, apenas salva a mensagem do usuário (role='user' pelo servidor)
    if (convStatus === 'with_human' || convStatus === 'waiting_human') {
      saveUserMessage(convId, question)
      setStatus('idle')
      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
      return
    }

    // Conversa com IA: o servidor salva pergunta e resposta (autoria definida no servidor)
    try {
      const activeConv = conversations.find((c) => c.id === convId)
      const res = await request('/knowledge-base/ask', {
        method: 'POST',
        body: JSON.stringify({ question, conversation_id: convId, dot_id: activeConv?.dot_id || activeDotId }),
      })
      const assistantMsg = {
        id: res.savedMessages?.assistant?.id || genId(),
        role: 'assistant',
        text: res.answer,
        sources: res.sources || [],
      }
      setMessages((prev) => [...prev, assistantMsg])

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
      setPanelMode((mode) => {
        if (mode === 'collapsed') setUnreadCount((c) => c + 1)
        return mode
      })
    } finally {
      setStatus('idle')
    }
  }, [status, activeConvId, startNewConversation, saveUserMessage, convStatus, user, conversations, activeDotId])

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
      conversations, activeConvId, showHistory, loadConversations,
      setShowHistory, openConversation, deleteConversation, startNewConversation,
      createTask, pendingTask, setPendingTask,
      convStatus, requestHandoff, closeConversation,
      queue, loadQueue, acceptHandoff, showQueue, setShowQueue,
      availableTools, executeAssistantTool, pendingToolCall, setPendingToolCall,
      addToolMessage,
      memories, loadMemories, saveMemoryItem, deleteMemoryItem,
      attachments, uploadAttachment, loadAttachments,
      handleVoiceTranscript,
      proactiveSuggestions, dismissProactive, actOnProactive, proactiveEnabled,
      mobileView, setMobileView,
      projects, loadProjects, createProject, updateProject, deleteProject,
      assignConversationToProject, activeProjectId, setActiveProjectId,
      activeProjectFilter, setActiveProjectFilter,
      dots, loadDots, createDot, updateDot, deleteDot, activeDotId, setActiveDotId,
    }),
    [panelMode, expand, collapse, enterFullscreen, exitFullscreen,
     messages, draft, clearMessages, sendMessage,
     context, contextMode, toggleContextMode, status, unreadCount,
     conversations, activeConvId, showHistory, loadConversations,
     setShowHistory, openConversation, deleteConversation, startNewConversation,
     createTask, pendingTask,
     convStatus, requestHandoff, closeConversation,
     queue, loadQueue, acceptHandoff, showQueue,
     availableTools, executeAssistantTool, pendingToolCall, addToolMessage,
     memories, loadMemories, saveMemoryItem, deleteMemoryItem,
     attachments, uploadAttachment, loadAttachments,
     handleVoiceTranscript,
     proactiveSuggestions, dismissProactive, actOnProactive, proactiveEnabled,
     mobileView,
     projects, loadProjects, createProject, updateProject, deleteProject,
     assignConversationToProject, activeProjectId, activeProjectFilter,
     dots, loadDots, createDot, updateDot, deleteDot, activeDotId],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
