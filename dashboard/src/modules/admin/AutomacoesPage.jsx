import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCollection } from '@/hooks/useCollection'
import WorkflowForm from './WorkflowForm'
import { Zap, Plus, Pencil } from 'lucide-react'

const triggerLabels = {
  event: 'Evento',
  schedule: 'Agendamento',
  manual: 'Manual',
}

export default function AutomacoesPage() {
  const { items: workflows, create, update, loading } = useCollection('workflows')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (w) => { setEditing(w); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create(data)
    }
    setFormOpen(false)
  }

  const handleToggle = async (w) => {
    await update(w.id, { active: !w.active })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Automações</h1>
          <p className="text-sm text-muted-foreground">Workflows e gatilhos automatizados</p>
        </div>
        <Button onClick={handleNew}><Plus className="h-4 w-4" /> Nova Automação</Button>
      </div>

      <div className="space-y-3">
        {workflows.map((w) => (
          <Card key={w.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${w.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{triggerLabels[w.trigger]}</Badge>
                      <span>·</span>
                      <span>{(w.conditions || []).length} condição(ões)</span>
                      <span>·</span>
                      <span>{(w.actions || []).length} ação(ões)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(w)}
                    className="cursor-pointer"
                    aria-label={w.active ? 'Desativar' : 'Ativar'}
                  >
                    <Badge variant={w.active ? 'default' : 'secondary'}>
                      {w.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(w)} aria-label="Editar automação">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Fluxo visual */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <div className="rounded-md bg-muted px-3 py-1.5">
                  <span className="font-medium">Gatilho:</span> {triggerLabels[w.trigger]}
                </div>
                {(w.conditions || []).length > 0 && <span className="text-muted-foreground">→</span>}
                {(w.conditions || []).map((c, i) => (
                  <div key={i} className="rounded-md border border-border px-3 py-1.5">
                    {c}
                  </div>
                ))}
                {(w.actions || []).length > 0 && <span className="text-muted-foreground">→</span>}
                {(w.actions || []).map((a, i) => (
                  <div key={i} className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">
                    {a}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {loading && (
          <div className="py-12 text-center text-muted-foreground">Carregando...</div>
        )}
        {!loading && workflows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Nenhuma automação configurada. Clique em "Nova Automação" para começar.
          </div>
        )}
      </div>

      <WorkflowForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingWorkflow={editing}
      />
    </div>
  )
}
