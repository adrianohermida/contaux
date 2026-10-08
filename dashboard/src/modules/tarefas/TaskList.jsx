import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/ui/empty-state'
import { taskStatusLabels, taskStatusVariants, taskPriorityLabels, taskPriorityVariants } from './lib/labels'
import { Search, Plus, Pencil, CheckSquare, Trash2, Calendar } from 'lucide-react'

export default function TaskList({ tasks, loading, onNew, onEdit, onToggleDone, onStatusChange, onDelete }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...tasks]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) =>
        t.title?.toLowerCase().includes(q) || t.assigned_to?.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter((t) => t.priority === priorityFilter)
    return result
  }, [tasks, search, statusFilter, priorityFilter])

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'done') return false
    return new Date(task.due_date) < new Date(new Date().toDateString())
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tarefa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={onNew}><Plus className="h-4 w-4" /> Nova Tarefa</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Status</label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            {Object.entries(taskStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Prioridade</label>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-36">
            <option value="all">Todas</option>
            {Object.entries(taskPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckSquare className="h-4 w-4" /> {filtered.length} tarefa(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : (
            <>
              {/* Tabela desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3 text-left font-medium">Título</th>
                      <th className="px-4 py-3 text-left font-medium">Prioridade</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Prazo</th>
                      <th className="px-4 py-3 text-left font-medium">Responsável</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Checkbox checked={t.status === 'done'} onChange={() => onToggleDone(t)} aria-label="Concluir tarefa" />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <span className={t.status === 'done' ? 'line-through text-muted-foreground' : ''}>{t.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={taskPriorityVariants[t.priority]}>{taskPriorityLabels[t.priority]}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={t.status}
                            onChange={(e) => onStatusChange?.(t, e.target.value)}
                            className="h-8 w-36 text-xs"
                            aria-label="Alterar status"
                          >
                            {Object.entries(taskStatusLabels).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          {t.due_date ? (
                            <span className={isOverdue(t) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                              {new Date(t.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{t.assigned_to || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(t)} aria-label="Editar tarefa"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} aria-label="Excluir tarefa"><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {filtered.map((t) => (
                  <div key={t.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={t.status === 'done'} onChange={() => onToggleDone(t)} aria-label="Concluir tarefa" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge variant={taskPriorityVariants[t.priority]}>{taskPriorityLabels[t.priority]}</Badge>
                          <Select
                            value={t.status}
                            onChange={(e) => onStatusChange?.(t, e.target.value)}
                            className="h-7 w-32 text-xs"
                            aria-label="Alterar status"
                          >
                            {Object.entries(taskStatusLabels).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </Select>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                          {t.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue(t) ? 'text-destructive font-medium' : ''}`}>
                              <Calendar className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {t.assigned_to && <span>{t.assigned_to}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(t)} aria-label="Editar tarefa"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} aria-label="Excluir tarefa"><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <EmptyState icon={CheckSquare} title="Nenhuma tarefa encontrada" description="Crie uma nova tarefa para começar." />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
