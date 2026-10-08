import { FolderKanban, Plus, Users } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { ProjectSelector } from './ProjectSelector'
import ProjectMembers from './ProjectMembers'
import { useState } from 'react'

/**
 * Seção de projetos na sidebar do workspace (CQ-08).
 * Lista projetos com dots coloridos e filtra conversas por projeto.
 */
export default function ProjectFilter() {
  const { projects, activeProjectFilter, setActiveProjectFilter } = useAssistant()
  const [showCreate, setShowCreate] = useState(false)
  const [membersProject, setMembersProject] = useState(null)

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
        <div key={p.id} className="space-y-0.5">
          <div
            className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
              activeProjectFilter === p.id ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
          >
            <button
              onClick={() => setActiveProjectFilter(activeProjectFilter === p.id ? null : p.id)}
              className="flex flex-1 items-center gap-2 min-w-0"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="flex-1 truncate">{p.name}</span>
            </button>
            {p.conversation_count > 0 && (
              <span className="text-[10px] text-muted-foreground">{p.conversation_count}</span>
            )}
            <button
              onClick={() => setMembersProject(membersProject === p.id ? null : p.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
              aria-label="Gerenciar membros"
              title="Membros"
            >
              <Users className="h-3 w-3" />
            </button>
          </div>
          {membersProject === p.id && (
            <ProjectMembers projectId={p.id} projectName={p.name} />
          )}
        </div>
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
