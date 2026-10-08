import { useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import AssistantPanel from './AssistantPanel'

/**
 * Widget do Assistente Contaux.
 * Desktop: coluna docked no layout (recolhida = rail 56px, expandida = 420px).
 * Mobile: orb flutuante (recolhido) ou overlay fullscreen (expandido).
 * Fullscreen: overlay em qualquer viewport.
 * Mostra badge de mensagens não lidas e indicador de atividade no estado recolhido.
 */
export default function AssistantWidget() {
  const { panelMode, expand, collapse, enterFullscreen, unreadCount, status } = useAssistant()
  const hasUnread = unreadCount > 0
  const isActive = status === 'preparing'

  // Escape fecha o painel
  useEffect(() => {
    if (panelMode === 'collapsed') return
    const handler = (e) => {
      if (e.key === 'Escape') collapse()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panelMode, collapse])

  // Fullscreen: overlay em qualquer viewport
  if (panelMode === 'fullscreen') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-card shadow-xl"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        role="dialog"
        aria-label="Assistente Contaux — tela cheia"
      >
        <AssistantPanel onClose={collapse} onFullscreen={null} fullscreen />
      </div>
    )
  }

  if (panelMode === 'expanded') {
    return (
      <>
        {/* Desktop: coluna docked */}
        <aside
          className="hidden lg:flex w-[420px] shrink-0 sticky top-0 h-screen flex-col border-l border-border bg-card"
          role="complementary"
          aria-label="Assistente Contaux"
        >
          <AssistantPanel onClose={collapse} onFullscreen={enterFullscreen} />
        </aside>

        {/* Mobile: overlay fullscreen com backdrop */}
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={collapse} aria-hidden="true" />
        <aside
          className="fixed inset-0 z-50 flex flex-col bg-card shadow-xl lg:hidden"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
          role="dialog"
          aria-label="Assistente Contaux"
        >
          <AssistantPanel onClose={collapse} onFullscreen={enterFullscreen} />
        </aside>
      </>
    )
  }

  // Collapsed: rail desktop + orb mobile
  return (
    <>
      {/* Desktop: rail estreito docked */}
      <button
        onClick={expand}
        className="hidden lg:flex w-14 shrink-0 sticky top-0 h-screen flex-col items-center gap-3 border-l border-border bg-card pt-4 transition-colors hover:bg-accent"
        aria-label="Expandir Assistente Contaux"
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          {isActive && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-amber-500 ring-2 ring-card" />
          )}
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          Assistente
        </span>
      </button>

      {/* Mobile: orb flutuante */}
      <button
        onClick={expand}
        className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))' }}
        aria-label="Abrir Assistente Contaux"
      >
        <Sparkles className="h-6 w-6" aria-hidden="true" />
        {isActive && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-amber-500 ring-2 ring-card" />
        )}
        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}
