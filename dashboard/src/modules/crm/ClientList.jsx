import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { statusLabels, statusVariants, typeLabels } from './lib/mockData'
import { Users, Search, Plus, Pencil, Eye } from 'lucide-react'

export default function ClientList({ clients, onNew, onEdit, onView }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filtered = useMemo(() => {
    let result = [...clients]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.document.includes(q) ||
        c.email.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter((c) => c.type === typeFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'created') return new Date(b.created) - new Date(a.created)
      if (sortBy === 'updated') return new Date(b.updated) - new Date(a.updated)
      return 0
    })

    return result
  }, [clients, search, statusFilter, typeFilter, sortBy])

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, documento ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onNew} size="default">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="prospect">Prospect</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Tipo</Label>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
            <option value="all">Todos</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Ordenar por</Label>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40">
            <option value="name">Nome</option>
            <option value="created">Data de criação</option>
            <option value="updated">Última atualização</option>
          </Select>
        </div>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            {filtered.length} cliente(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Documento</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Tags</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{typeLabels[c.type]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.document}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[c.status]}>{statusLabels[c.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(c.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.document}</p>
                  </div>
                  <Badge variant={statusVariants[c.status]}>{statusLabels[c.status]}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{typeLabels[c.type]}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(c.id)}>Ver</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(c)}>Editar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
