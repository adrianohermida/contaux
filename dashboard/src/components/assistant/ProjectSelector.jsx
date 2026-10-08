import { useState, useEffect, useCallback } from 'react'
import { useAssistant } from './AssistantProvider'
import { useAuth } from '@/contexts/AuthContext'
import { request } from '@/lib/api'

/**
 * Seletor de projetos privados e dots configuráveis (CQ-08).
 * Permite criar, listar e atribuir conversas a projetos.
 * Dots = marcadores visuais coloridos por projeto.
 */
export function ProjectSelector() {
  const { activeConvId, conversations, loadConversations } = useAssistant()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3763EB')
  const [newVisibility, setNewVisibility] = useState('private')
  const [loading, setLoading] = useState(false)

  const loadProjects = useCallback(async () => {
    try {
      const list = await request('/assistant/projects')
      setProjects(list)
    } catch {
      setProjects([])
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setLoading(true)
    try {
      await request('/assistant/projects', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), color: newColor, visibility: newVisibility }),
      })
      setNewName('')
      setShowCreate(false)
      await loadProjects()
    } catch {
      // Ignora
    }
    setLoading(false)
  }

  const handleAssign = async (convId, projectId) => {
    try {
      await request(`/assistant/conversations/${convId}/project`, {
        method: 'PATCH',
        body: JSON.stringify({ project_id: projectId || null }),
      })
      await loadConversations()
    } catch {
      // Ignora
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  return (
    <div className="space-y-2">
      {/* Lista de projetos com dots */}
      <div className="flex flex-wrap gap-1.5">
        {projects.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{ backgroundColor: `${p.color}15`, color: p.color }}
            title={p.name}
          >
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
        ))}
        {projects.length === 0 && !showCreate && (
          <span className="text-xs text-muted-foreground">Sem projetos</span>
        )}
      </div>

      {/* Atribuir conversa ativa a um projeto */}
      {activeConv && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">Dot:</span>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAssign(activeConv.id, p.id)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition hover:opacity-80"
              style={{
                backgroundColor: activeConv.project_id === p.id ? p.color : `${p.color}10`,
                color: activeConv.project_id === p.id ? '#fff' : p.color,
              }}
              title={`Atribuir a ${p.name}`}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: activeConv.project_id === p.id ? '#fff' : p.color }} />
              {p.name}
            </button>
          ))}
          {activeConv.project_id && (
            <button
              onClick={() => handleAssign(activeConv.id, null)}
              className="text-xs text-muted-foreground hover:text-foreground"
              title="Remover dot"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Criar novo projeto */}
      {showCreate ? (
        <div className="space-y-2 p-2 rounded-lg border border-border bg-card">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do projeto"
            className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Cor do dot"
            />
            <select
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value)}
              className="text-xs px-1 py-1 rounded border border-border bg-background"
            >
              <option value="private">Privado</option>
              <option value="shared">Compartilhado</option>
              <option value="internal">Interno (staff)</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
            >
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-xs px-2 py-1 text-muted-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="text-xs text-primary hover:underline"
        >
          + Novo projeto
        </button>
      )}
    </div>
  )
}
