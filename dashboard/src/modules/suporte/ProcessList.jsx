import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { processStatusLabels, processStatusVariants } from './lib/mockData'
import { formatCurrency } from './lib/format'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Plus, Pencil, Scale } from 'lucide-react'

export default function ProcessList({ processes, onNew, onEdit }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...processes]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.process_number.includes(q) || p.client_name.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter)
    return result
  }, [processes, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar processo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            {Object.entries(processStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Button onClick={onNew}><Plus className="h-4 w-4" /> Novo Processo</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Scale className="h-4 w-4" /> {filtered.length} processo(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nº Processo</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Assunto</th>
                  <th className="px-4 py-3 text-left font-medium">Advogado</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.process_number}</td>
                    <td className="px-4 py-3 font-medium">{p.client_name}</td>
                    <td className="px-4 py-3">{p.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.lawyer}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.value)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={processStatusVariants[p.status]}>{processStatusLabels[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs">{p.process_number}</p>
                    <p className="font-medium">{p.subject}</p>
                    <p className="text-xs text-muted-foreground">{p.client_name} · {p.lawyer}</p>
                  </div>
                  <Badge variant={processStatusVariants[p.status]}>{processStatusLabels[p.status]}</Badge>
                </div>
                <p className="mt-2 font-mono text-sm">{formatCurrency(p.value)}</p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <EmptyState icon={Scale} title="Nenhum processo encontrado" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
