import { useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import AssistantPanel from './AssistantPanel'

/**
 * Widget do Assistente Contaux — minimalista.
 * Desktop: coluna docked (recolhida = rail 48px, expandida = 360px).
 * Mobile: orb flutuante (recolhido) ou overlay fullscreen (expandido).
 */
export default function AssistantWidget() {
  const { panelMode, expand, collapse, enterFullscreen, unreadCount, status } = useAssistant()
  const hasUnread = unreadCount > 0
  const isActive = status === 'preparing'

  useEffect(() => {
    if (panelMode === 'collapsed') return
    const handler = (e) => { if (e.key === 'Escape') collapse() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panelMode, collapse])

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
        <aside
          className="hidden lg:flex w-[360px] shrink-0 sticky top-0 h-screen flex-col border-l border-border bg-card"
          role="complementary"
          aria-label="Assistente Contaux"
        >
          <AssistantPanel onClose={collapse} onFullscreen={enterFullscreen} />
        </aside>

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
      <button
        onClick={expand}
        className="hidden lg:flex w-12 shrink-0 sticky top-0 h-screen flex-col items-center gap-2 border-l border-border bg-card pt-4 transition-colors hover:bg-accent"
        aria-label="Expandir Assistente Contaux"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
          {isActive && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500 ring-2 ring-card" />
          )}
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-medium text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          Assistente
        </span>
      </button>

      <button
        onClick={expand}
        className="fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))' }}
        aria-label="Abrir Assistente Contaux"
      >
        <Sparkles className="h-5 w-5" />
        {isActive && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500 ring-2 ring-card" />
        )}
        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}
