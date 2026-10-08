import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCollection } from '@/hooks/useCollection'
import { Search, FolderOpen, FileText, Download, Eye } from 'lucide-react'

export default function DocumentosPage() {
  const { items: documents, loading } = useCollection('documents')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return documents
    const q = search.toLowerCase()
    return documents.filter((d) => d.name?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q))
  }, [documents, search])

  const categories = [...new Set(documents.map((d) => d.category))]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Documentos</h1>
          <p className="text-sm text-muted-foreground">Templates e documentos do escritório</p>
        </div>
        <Button>Novo Documento</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar documento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                    <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                    <span className="text-xs text-muted-foreground">{doc.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Atualizado: {doc.updated?.split('-').reverse().join('/')}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><Eye className="h-3.5 w-3.5" /> Visualizar</Button>
                <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-12 text-center text-muted-foreground">
          <FolderOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
          Nenhum documento encontrado.
        </div>
      )}
      {loading && (
        <div className="py-12 text-center text-muted-foreground">Carregando...</div>
      )}
    </div>
  )
}
