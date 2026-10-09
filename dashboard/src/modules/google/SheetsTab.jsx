import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, ChevronRight, ArrowLeft } from 'lucide-react'

export default function SheetsTab() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [values, setValues] = useState([])
  const [valuesLoading, setValuesLoading] = useState(false)

  useEffect(() => {
    request('/google/sheets')
      .then(data => setSheets(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const openSheet = async (id) => {
    setSelected(id)
    setValuesLoading(true)
    try {
      setValues(await request(`/google/sheets/${id}/values`))
    } catch (err) {
      setError(err.message)
    } finally {
      setValuesLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
  if (error && !selected) return <p className="py-8 text-center text-sm text-destructive">{error}</p>

  if (selected) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setValues([]); setError(null) }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        {valuesLoading ? <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div> : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {values.slice(0, 50).map((row, i) => (
                  <tr key={i} className={i === 0 ? 'font-medium border-b border-border bg-muted/30' : ''}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-1.5 border-r border-border last:border-0 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  if (!sheets.length) return <EmptyState icon={FileSpreadsheet} title="Nenhuma planilha" description="Suas planilhas do Google Sheets aparecerão aqui" />

  return (
    <div className="space-y-2">
      {sheets.map(s => (
        <button key={s.id} onClick={() => openSheet(s.id)}
          className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors w-full text-left">
          <FileSpreadsheet className="h-5 w-5 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.modifiedTime ? new Date(s.modifiedTime).toLocaleDateString('pt-BR') : ''}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}
