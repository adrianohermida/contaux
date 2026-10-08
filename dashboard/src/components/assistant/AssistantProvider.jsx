import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_SUGGESTIONS, matchFixture, getFixtureResponse } from './fixtures'

const AssistantContext = createContext(null)

function genId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle') // idle | preparing | demo
  const location = useLocation()
  const { user } = useAuth()

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStatus('idle')
  }, [])

  // Contexto explícito — espelho da sessão, não concede acesso
  const context = useMemo(
    () => ({
      actor: user?.name || 'Contador',
      role: user?.role || '—',
      route: location.pathname,
      company: null, // Empresa não selecionada (demo)
      period: null, // Competência não informada (demo)
    }),
    [user, location.pathname],
  )

  const sendMessage = useCallback(
    (text) => {
      const userMsg = { id: genId(), role: 'user', text }
      setMessages((prev) => [...prev, userMsg])
      setStatus('preparing')

      // Simula latência de preparo antes da resposta fictícia
      setTimeout(() => {
        const fixtureId = matchFixture(text)
        const fixture = fixtureId ? getFixtureResponse(fixtureId) : null
        const assistantMsg = {
          id: genId(),
          role: 'assistant',
          text: fixture
            ? null
            : 'Esta é uma demonstração. Tente: "Prepare o checklist do fechamento", "Explique a diferença de conciliação" ou "Rascunhe uma cobrança".',
          fixture,
        }
        setMessages((prev) => [...prev, assistantMsg])
        setStatus('demo')
      }, 700)
    },
    [],
  )

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, messages, sendMessage, clearMessages, context, status }),
    [isOpen, open, close, toggle, messages, sendMessage, clearMessages, context, status],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant deve ser usado dentro de AssistantProvider')
  return ctx
}
