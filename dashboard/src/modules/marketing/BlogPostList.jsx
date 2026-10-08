import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { blogStatusLabels, blogStatusVariants } from './lib/mockData'
import { formatDate } from './lib/format'
import { Search, Plus, Pencil, FileEdit, Eye } from 'lucide-react'

export default function BlogPostList({ posts, onNew, onEdit }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...posts]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter)
    return result
  }, [posts, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar post..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            {Object.entries(blogStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Button onClick={onNew}><Plus className="h-4 w-4" /> Novo Post</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileEdit className="h-4 w-4" /> {filtered.length} post(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Título</th>
                  <th className="px-4 py-3 text-left font-medium">Categoria</th>
                  <th className="px-4 py-3 text-left font-medium">Autor</th>
                  <th className="px-4 py-3 text-left font-medium">Publicado em</th>
                  <th className="px-4 py-3 text-right font-medium">Views</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.author}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.published_date)}</td>
                    <td className="px-4 py-3 text-right font-mono">{p.views}</td>
                    <td className="px-4 py-3"><Badge variant={blogStatusVariants[p.status]}>{blogStatusLabels[p.status]}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(p)} aria-label="Editar post"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
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
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.author}</p>
                  </div>
                  <Badge variant={blogStatusVariants[p.status]}>{blogStatusLabels[p.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.views} visualizações</p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Nenhum post encontrado.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
