import { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IMPORT_TABS } from './importTemplates'

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState(IMPORT_TABS[0].key)
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const tab = IMPORT_TABS.find((t) => t.key === activeTab)

  const handleImport = async () => {
    setStatus(null)
    setLoading(true)
    try {
      const data = JSON.parse(jsonText)
      const res = await fetch(tab.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro na importação')
      setStatus({ type: 'success', message: `${result.imported} registro(s) importado(s) com sucesso!` })
      setJsonText('')
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = () => {
    setJsonText(tab.template)
    setStatus(null)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Importar Dados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole os dados em formato JSON no campo abaixo e clique em importar.
          Use o botão "Ver exemplo" para ver o formato esperado.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-border" role="tablist">
        {IMPORT_TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            onClick={() => { setActiveTab(t.key); setJsonText(''); setStatus(null) }}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Template button */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Formato: array JSON de objetos</p>
        <button
          onClick={loadTemplate}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver exemplo
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="[\n  { ... }\n]"
        aria-label="Dados JSON para importação"
        className="h-72 w-full rounded-lg border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
      />

      {/* Feedback */}
      {status && (
        <div
          role="alert"
          className={cn(
            'mt-3 flex items-center gap-2 rounded-lg p-3 text-sm',
            status.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400',
          )}
        >
          {status.type === 'success' ? <CheckCircle className="h-4 w-4" aria-hidden="true" /> : <AlertCircle className="h-4 w-4" aria-hidden="true" />}
          {status.message}
        </div>
      )}

      {/* Action */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleImport}
          disabled={!jsonText.trim() || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-4 w-4" aria-hidden="true" />}
          Importar
        </button>
      </div>
    </div>
  )
}
