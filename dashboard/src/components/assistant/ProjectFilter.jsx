import { FolderKanban, Plus } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { ProjectSelector } from './ProjectSelector'
import { useState } from 'react'

/**
 * Seção de projetos na sidebar do workspace (CQ-08).
 * Lista projetos com dots coloridos e filtra conversas por projeto.
 */
export default function ProjectFilter() {
  const { projects, activeProjectFilter, setActiveProjectFilter } = useAssistant()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-0.5">
      {/* Filtro "Todas" */}
      <button
        onClick={() => setActiveProjectFilter(null)}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
          !activeProjectFilter ? 'bg-accent' : 'hover:bg-accent/50'
        }`}
      >
        <FolderKanban className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="flex-1">Todas as conversas</span>
      </button>

      {/* Projetos com dots */}
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => setActiveProjectFilter(activeProjectFilter === p.id ? null : p.id)}
          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
            activeProjectFilter === p.id ? 'bg-accent' : 'hover:bg-accent/50'
          }`}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="flex-1 truncate">{p.name}</span>
          {p.conversation_count > 0 && (
            <span className="text-[10px] text-muted-foreground">{p.conversation_count}</span>
          )}
        </button>
      ))}

      {/* Criar novo projeto */}
      {showCreate ? (
        <div className="px-2 py-1">
          <ProjectSelector />
          <button
            onClick={() => setShowCreate(false)}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Fechar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-left text-[10px] text-primary hover:opacity-80"
        >
          <Plus className="h-3 w-3" /> Novo projeto
        </button>
      )}
    </div>
  )
}
