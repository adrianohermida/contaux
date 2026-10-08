import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useCollection } from '@/hooks/useCollection'
import DocumentForm from './DocumentForm'
import { Search, FolderOpen, FileText, Eye, Plus, Pencil } from 'lucide-react'

const typeLabels = {
  template: 'Template',
  contract: 'Contrato',
  guide: 'Guia',
  policy: 'Política',
  other: 'Outro',
}

export default function DocumentosPage() {
  const { items: documents, create, update, loading } = useCollection('documents')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)

  const filtered = useMemo(() => {
    let result = [...documents]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d) => d.name?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q))
    }
    if (typeFilter !== 'all') result = result.filter((d) => d.type === typeFilter)
    return result
  }, [documents, search, typeFilter])

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (doc) => { setEditing(doc); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create(data)
    }
    setFormOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Documentos</h1>
          <p className="text-sm text-muted-foreground">Templates e documentos do escritório</p>
        </div>
        <Button onClick={handleNew}><Plus className="h-4 w-4" /> Novo Documento</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar documento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Tipo</Label>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
            <option value="all">Todos</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{doc.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{doc.category || 'Sem categoria'}</Badge>
                    <span className="text-xs text-muted-foreground">{typeLabels[doc.type] || doc.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Atualizado: {doc.updated?.split('-').reverse().join('/') || '—'}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewing(doc)}>
                  <Eye className="h-3.5 w-3.5" /> Visualizar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)} aria-label="Editar documento">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum documento encontrado"
          description="Crie um novo documento ou ajuste os filtros de busca."
        />
      )}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      <DocumentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingDocument={editing}
      />

      {/* Modal de visualização */}
      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        className="max-w-2xl"
      >
        {viewing && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline">{viewing.category || 'Sem categoria'}</Badge>
              <span className="text-xs text-muted-foreground">{typeLabels[viewing.type] || viewing.type}</span>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {viewing.content || 'Sem conteúdo disponível.'}
            </div>
          </>
        )}
      </Dialog>
    </div>
  )
}
