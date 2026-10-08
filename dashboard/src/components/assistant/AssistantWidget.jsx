import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import AssistantPanel from './AssistantPanel'

export default function AssistantWidget() {
  const { isOpen, close, toggle } = useAssistant()
  const orbRef = useRef(null)

  // Escape fecha o painel (não confirma aprovação)
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  if (isOpen) {
    return (
      <>
        {/* Backdrop mobile */}
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
        {/* Painel: fullscreen no mobile, lateral no desktop */}
        <aside
          className="fixed inset-0 z-50 flex flex-col bg-card shadow-xl lg:inset-y-0 lg:right-0 lg:top-0 lg:w-[420px] lg:border-l lg:border-border"
          role="dialog"
          aria-label="Assistente Contaux"
        >
          <AssistantPanel onClose={close} />
        </aside>
      </>
    )
  }

  // Orb compacto (48px, toque >= 44px)
  return (
    <button
      ref={orbRef}
      onClick={toggle}
      className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
      aria-label="Abrir Assistente Contaux"
    >
      <Sparkles className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}
