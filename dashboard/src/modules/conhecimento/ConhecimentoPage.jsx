import { useState, useMemo } from 'react'
import { Library, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCollection } from '@/hooks/useCollection'
import { useToast } from '@/components/ui/toast'
import { request } from '@/lib/api'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import ConhecimentoList from './ConhecimentoList'
import ConhecimentoForm from './ConhecimentoForm'
import ConhecimentoDetail from './ConhecimentoDetail'

const TYPE_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'article', label: 'Artigos' },
  { value: 'legislation', label: 'Legislação' },
  { value: 'book', label: 'Livros/PDFs' },
  { value: 'faq', label: 'FAQs' },
]

const AREA_TAGS = ['Tributário', 'Trabalhista', 'Societário', 'Fiscal', 'Contábil', 'LGPD']

export default function ConhecimentoPage() {
  const { items, loading, create, update, remove } = useCollection('knowledge_base')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState(null)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const filtered = useMemo(() => {
    let result = items
    if (typeFilter !== 'all') result = result.filter((it) => it.type === typeFilter)
    if (tagFilter) result = result.filter((it) => (it.tags || []).includes(tagFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((it) =>
        it.title?.toLowerCase().includes(q) ||
        it.summary?.toLowerCase().includes(q) ||
        it.content?.toLowerCase().includes(q) ||
        it.author?.toLowerCase().includes(q)
      )
    }
    return result
  }, [items, typeFilter, tagFilter, search])

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (item) => { setEditing(item); setFormOpen(true); setSelected(null) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
      toast('Item atualizado com sucesso', 'success')
    } else {
      await create(data)
      toast('Item criado com sucesso', 'success')
    }
    setFormOpen(false)
  }

  const handleDelete = async (id) => {
    try {
      await remove(id)
      setSelected(null)
      toast('Item excluído', 'info')
    } catch {
      toast('Erro ao excluir item', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Base de Conhecimento</h1>
          <p className="text-sm text-muted-foreground">Repositório de artigos, legislação, livros e FAQs — fonte de inteligência da plataforma</p>
        </div>
        <Button onClick={handleNew}><Plus className="h-4 w-4" /> Novo Item</Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar na base de conhecimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-1.5">
        {TYPE_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setTypeFilter(tab.value)}>
            <Badge variant={typeFilter === tab.value ? 'default' : 'outline'} className="cursor-pointer">
              {tab.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Filtros por tag de área */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setTagFilter(null)}>
          <Badge variant={!tagFilter ? 'default' : 'secondary'} className="cursor-pointer">Todas as áreas</Badge>
        </button>
        {AREA_TAGS.map((tag) => (
          <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? null : tag)}>
            <Badge variant={tagFilter === tag ? 'default' : 'secondary'} className="cursor-pointer">{tag}</Badge>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : selected ? (
        <ConhecimentoDetail
          item={selected}
          onBack={() => setSelected(null)}
          onEdit={() => handleEdit(selected)}
          onDelete={() => handleDelete(selected.id)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Nenhum item encontrado"
          description="Ajuste os filtros ou crie um novo item na base de conhecimento."
        />
      ) : (
        <ConhecimentoList items={filtered} onSelect={setSelected} />
      )}

      <ConhecimentoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingItem={editing}
      />
    </div>
  )
}
