import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

export default function DocsTab() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    request('/google/docs')
      .then(data => setDocs(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
  if (error) return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  if (!docs.length) return <EmptyState icon={FileText} title="Nenhum documento" description="Seus documentos do Google Docs aparecerão aqui" />

  return (
    <div className="space-y-2">
      {docs.map(d => (
        <a key={d.id} href={d.webViewLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
          <FileText className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{d.name}</p>
            <p className="text-xs text-muted-foreground">{d.modifiedTime ? new Date(d.modifiedTime).toLocaleDateString('pt-BR') : ''}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
