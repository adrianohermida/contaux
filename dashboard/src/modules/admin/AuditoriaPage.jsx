import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCollection } from '@/hooks/useCollection'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Search, ScrollText } from 'lucide-react'

const actionLabels = {
  login: 'Login',
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  export: 'Exportação',
}

const actionVariants = {
  login: 'secondary',
  create: 'default',
  update: 'outline',
  delete: 'destructive',
  export: 'secondary',
}

export default function AuditoriaPage() {
  const { items: logs, loading } = useCollection('audit_logs')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...logs]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((l) =>
        l.user?.toLowerCase().includes(q) || l.details?.toLowerCase().includes(q) || l.entity_id?.toLowerCase().includes(q),
      )
    }
    if (actionFilter !== 'all') result = result.filter((l) => l.action === actionFilter)
    return result
  }, [logs, search, actionFilter])

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
        <p className="text-sm text-muted-foreground">Registro de todas as ações do sistema</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar log..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-40">
          <option value="all">Todas as ações</option>
          {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ScrollText className="h-4 w-4" /> {filtered.length} registro(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Usuário</th>
                  <th className="px-4 py-3 text-left font-medium">Ação</th>
                  <th className="px-4 py-3 text-left font-medium">Entidade</th>
                  <th className="px-4 py-3 text-left font-medium">Detalhes</th>
                  <th className="px-4 py-3 text-left font-medium">IP</th>
                  <th className="px-4 py-3 text-left font-medium">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{l.user}</td>
                    <td className="px-4 py-3"><Badge variant={actionVariants[l.action]}>{actionLabels[l.action]}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{l.entity_type}{l.entity_id ? `: ${l.entity_id}` : ''}</td>
                    <td className="px-4 py-3">{l.details}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{l.ip}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(l.timestamp).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((l) => (
              <div key={l.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{l.user}</p>
                    <p className="text-xs text-muted-foreground">{l.details}</p>
                  </div>
                  <Badge variant={actionVariants[l.action]}>{actionLabels[l.action]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString('pt-BR')} · {l.ip}</p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <EmptyState icon={ScrollText} title="Nenhum log encontrado" />
          )}
          {loading && (
            <div className="flex justify-center py-12"><Spinner /></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
