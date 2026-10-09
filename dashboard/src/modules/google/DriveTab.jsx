import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { HardDrive, FileText, FileSpreadsheet, File } from 'lucide-react'

const ICONS = {
  'application/vnd.google-apps.document': FileText,
  'application/vnd.google-apps.spreadsheet': FileSpreadsheet,
  'application/vnd.google-apps.presentation': File,
  'application/vnd.google-apps.form': File,
}

export default function DriveTab() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    request('/google/drive/files')
      .then(data => setFiles(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
  if (error) return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  if (!files.length) return <EmptyState icon={HardDrive} title="Nenhum arquivo" description="Seus arquivos do Google Drive aparecerão aqui" />

  return (
    <div className="space-y-2">
      {files.map(f => {
        const Icon = ICONS[f.mimeType] || File
        return (
          <a key={f.id} href={f.webViewLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : ''}</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}
