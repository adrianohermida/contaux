import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ticketPriorityLabels, ticketPriorityVariants, ticketStatusLabels, ticketStatusVariants } from './lib/mockData'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Plus, Pencil, Eye, Ticket } from 'lucide-react'

export default function TicketList({ tickets, onNew, onEdit, onView }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...tickets]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) =>
        t.subject.toLowerCase().includes(q) || t.client_name.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter((t) => t.priority === priorityFilter)
    return result
  }, [tickets, search, statusFilter, priorityFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar ticket..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={onNew}><Plus className="h-4 w-4" /> Novo Ticket</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Status</label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            {Object.entries(ticketStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Prioridade</label>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-36">
            <option value="all">Todas</option>
            {Object.entries(ticketPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Ticket className="h-4 w-4" /> {filtered.length} ticket(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Assunto</th>
                  <th className="px-4 py-3 text-left font-medium">Prioridade</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Responsável</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{t.client_name}</td>
                    <td className="px-4 py-3">{t.subject}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ticketPriorityVariants[t.priority]}>{ticketPriorityLabels[t.priority]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ticketStatusVariants[t.status]}>{ticketStatusLabels[t.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.assigned_to || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(t.id)} aria-label="Ver detalhes do ticket"><Eye className="h-4 w-4" aria-hidden="true" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(t)} aria-label="Editar ticket"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((t) => (
              <div key={t.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.client_name}</p>
                  </div>
                  <Badge variant={ticketPriorityVariants[t.priority]}>{ticketPriorityLabels[t.priority]}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={ticketStatusVariants[t.status]}>{ticketStatusLabels[t.status]}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(t.id)}>Ver</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>Editar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <EmptyState icon={Ticket} title="Nenhum ticket encontrado" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
