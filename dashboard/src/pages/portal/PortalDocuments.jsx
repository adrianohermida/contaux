import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createApiClient } from '@/lib/api'

const documentsApi = createApiClient('documents')

export default function PortalDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    documentsApi.list()
      .then(setDocuments)
      .catch((err) => console.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Documentos</h1>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><Spinner className="h-8 w-8" /></div>
      ) : documents.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum documento" description="Não há documentos disponíveis no momento." />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{doc.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.category || 'Geral'} · {doc.updated || '—'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" /> Baixar
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
