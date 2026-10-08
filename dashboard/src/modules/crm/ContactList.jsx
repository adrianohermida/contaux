import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Search, Mail, Phone, Briefcase, Plus, Pencil } from 'lucide-react'

export default function ContactList({ contacts, clients, loading, onNew, onEdit }) {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')

  const allTags = useMemo(() => {
    const tags = new Set()
    contacts.forEach((c) => (c.tags || []).forEach((t) => tags.add(t)))
    return [...tags].sort()
  }, [contacts])

  const filtered = useMemo(() => {
    let result = [...contacts]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q),
      )
    }
    if (tagFilter !== 'all') {
      result = result.filter((c) => (c.tags || []).includes(tagFilter))
    }
    return result
  }, [contacts, search, tagFilter])

  const getClientName = (clientId) => clients.find((c) => String(c.id) === String(clientId))?.name || '—'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Tag</Label>
            <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-40">
              <option value="all">Todas</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4" /> Novo Contato
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{filtered.length} contato(s)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Cargo</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Tags</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.position || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getClientName(c.client_id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(c)} aria-label="Editar contato">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
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
                    <p className="text-xs text-muted-foreground">{c.position || '—'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(c)}>Editar</Button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {c.email}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {c.phone || '—'}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Briefcase className="h-3 w-3" /> {getClientName(c.client_id)}</p>
                </div>
                {(c.tags || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <EmptyState icon={Mail} title="Nenhum contato encontrado" />
          )}
          {loading && (
            <div className="flex justify-center py-12"><Spinner /></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
