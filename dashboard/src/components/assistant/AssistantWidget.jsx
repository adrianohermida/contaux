import { useEffect } from 'react'
import { Sparkles, PanelRightOpen, Maximize2 } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import AssistantPanel from './AssistantPanel'

/**
 * Widget do Assistente Contaux.
 * Desktop: coluna docked no layout (recolhida = rail 56px, expandida = 420px).
 * Mobile: orb flutuante (recolhido) ou overlay fullscreen (expandido).
 * Fullscreen: overlay em qualquer viewport.
 */
export default function AssistantWidget() {
  const { panelMode, expand, collapse, enterFullscreen } = useAssistant()

  // Escape fecha o painel (não confirma aprovação)
  useEffect(() => {
    if (panelMode === 'collapsed') return
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (panelMode === 'fullscreen') collapse()
        else collapse()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panelMode, collapse])

  // Fullscreen: overlay em qualquer viewport
  if (panelMode === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-card shadow-xl" role="dialog" aria-label="Assistente Contaux — tela cheia">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          Assistente
        </span>
      </button>

      {/* Mobile: orb flutuante */}
      <button
        onClick={expand}
        className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
        aria-label="Abrir Assistente Contaux"
      >
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </button>
    </>
  )
}
