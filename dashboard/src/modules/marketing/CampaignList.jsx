import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { campaignStatusLabels, campaignStatusVariants, channelLabels } from './lib/mockData'
import { formatDate } from './lib/format'
import { Search, Plus, Pencil, Megaphone } from 'lucide-react'

export default function CampaignList({ campaigns, onNew, onEdit }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...campaigns]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter)
    return result
  }, [campaigns, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar campanha..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            {Object.entries(campaignStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Button onClick={onNew}><Plus className="h-4 w-4" /> Nova Campanha</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Megaphone className="h-4 w-4" /> {filtered.length} campanha(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Canal</th>
                  <th className="px-4 py-3 text-left font-medium">Público</th>
                  <th className="px-4 py-3 text-right font-medium">Enviadas</th>
                  <th className="px-4 py-3 text-right font-medium">Abertas</th>
                  <th className="px-4 py-3 text-right font-medium">Convertidas</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{channelLabels[c.channel]}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.audience}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.metrics.sent}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.metrics.opened}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.metrics.converted}</td>
                    <td className="px-4 py-3"><Badge variant={campaignStatusVariants[c.status]}>{campaignStatusLabels[c.status]}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{channelLabels[c.channel]} · {c.audience}</p>
                  </div>
                  <Badge variant={campaignStatusVariants[c.status]}>{campaignStatusLabels[c.status]}</Badge>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span>Enviadas: {c.metrics.sent}</span>
                  <span>Abertas: {c.metrics.opened}</span>
                  <span>Convertidas: {c.metrics.converted}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Nenhuma campanha encontrada.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
