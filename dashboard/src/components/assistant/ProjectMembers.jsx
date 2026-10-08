import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, X, Crown } from 'lucide-react'
import { request } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Gestão de membros de um projeto (CQ-08).
 * Lista membros, permite adicionar (owner) e remover (owner).
 * Compacto para caber na sidebar do workspace.
 */
export default function ProjectMembers({ projectId, projectName }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [tenantUsers, setTenantUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadMembers = useCallback(async () => {
    try {
      const list = await request(`/assistant/projects/${projectId}/members`)
      setMembers(list)
    } catch {
      setMembers([])
    }
  }, [projectId])

  const loadTenantUsers = useCallback(async () => {
    try {
      const list = await request('/auth/users')
      // Filtra usuários que já são membros
      const memberIds = new Set(members.map((m) => String(m.user_id)))
      setTenantUsers(list.filter((u) => !memberIds.has(String(u.id))))
    } catch {
      setTenantUsers([])
    }
  }, [members])

  useEffect(() => { loadMembers() }, [loadMembers])
  useEffect(() => {
    if (showAdd) loadTenantUsers()
  }, [showAdd, loadTenantUsers])

  const isOwner = members.some((m) => String(m.user_id) === String(user?.id) && m.role === 'owner')

  const handleAdd = async (userId) => {
    setLoading(true)
    try {
      await request(`/assistant/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      })
      await loadMembers()
      setShowAdd(false)
    } catch {
      // Ignora
    }
    setLoading(false)
  }

  const handleRemove = async (userId) => {
    try {
      await request(`/assistant/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
      setMembers((prev) => prev.filter((m) => String(m.user_id) !== userId))
    } catch {
      // Ignora
    }
  }

  return (
    <div className="space-y-1.5 px-2 py-1">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <Users className="h-3 w-3" />
        Membros de "{projectName}"
      </div>

      {/* Lista de membros */}
      {members.map((m) => (
        <div key={m.user_id} className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-accent/50">
          {m.role === 'owner' ? (
            <Crown className="h-3 w-3 shrink-0 text-amber-500" />
          ) : (
            <div className="h-3 w-3 shrink-0 rounded-full bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium">{m.name}</p>
            <p className="truncate text-[9px] text-muted-foreground">{m.email}</p>
          </div>
          {isOwner && m.role !== 'owner' && (
            <button
              onClick={() => handleRemove(m.user_id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Remover membro"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      {/* Adicionar membro */}
      {isOwner && (
        <div className="pt-1">
          {showAdd ? (
            <div className="space-y-1">
              {tenantUsers.length === 0 ? (
                <p className="text-[10px] text-muted-foreground px-1.5 py-1">
                  {loading ? 'Carregando...' : 'Nenhum usuário disponível'}
                </p>
              ) : (
                <div className="max-h-32 space-y-0.5 overflow-y-auto">
                  {tenantUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAdd(u.id)}
                      disabled={loading}
                      className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left hover:bg-accent disabled:opacity-50"
                    >
                      <UserPlus className="h-3 w-3 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px]">{u.name}</p>
                        <p className="truncate text-[9px] text-muted-foreground">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowAdd(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground px-1.5"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-[10px] text-primary hover:opacity-80 px-1.5"
            >
              <UserPlus className="h-3 w-3" /> Adicionar membro
            </button>
          )}
        </div>
      )}
    </div>
  )
}
