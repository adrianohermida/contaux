import { ArrowLeft } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import AssistantPanel from './AssistantPanel'
import ConversationSidebar from './ConversationSidebar'
import { Button } from '@/components/ui/button'

/**
 * Layout fullscreen do Assistente — workspace de comunicação.
 * Desktop: coluna esquerda (sidebar) + centro (conversa ativa).
 * Mobile: alterna entre lista e conversa, preservando estado.
 */
export default function FullscreenWorkspace({ onClose }) {
  const { mobileView, setMobileView } = useAssistant()

  const showList = mobileView !== 'conversation'
  const showChat = mobileView === 'conversation'

  return (
    <div
      className="fixed inset-0 z-50 flex bg-card"
      role="dialog"
      aria-label="Assistente Contaux — workspace"
    >
      {/* Coluna esquerda — lista de conversas */}
      <aside
        className={`${showList ? 'flex' : 'hidden'} md:flex w-full md:w-80 shrink-0 flex-col border-r border-border bg-card`}
        aria-label="Lista de conversas"
      >
        <ConversationSidebar onClose={onClose} />
      </aside>

      {/* Centro — conversa ativa */}
      <main
        className={`${showChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}
        aria-label="Conversa ativa"
      >
        {/* Botão voltar para lista — só mobile */}
        <div className="md:hidden flex items-center border-b border-border px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileView('list')}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <AssistantPanel onClose={onClose} fullscreen />
        </div>
      </main>
    </div>
  )
}
