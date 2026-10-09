import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { ClipboardList, ChevronRight, ArrowLeft, Users } from 'lucide-react'

export default function FormsTab() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [responses, setResponses] = useState([])
  const [respLoading, setRespLoading] = useState(false)

  useEffect(() => {
    request('/google/forms')
      .then(data => setForms(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const openForm = async (id) => {
    setSelected(id)
    setRespLoading(true)
    try {
      setResponses(await request(`/google/forms/${id}/responses`))
    } catch (err) {
      setError(err.message)
    } finally {
      setRespLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
  if (error && !selected) return <p className="py-8 text-center text-sm text-destructive">{error}</p>

  if (selected) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setResponses([]); setError(null) }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        {respLoading ? <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div> : (
          <div className="space-y-2">
            <p className="text-sm font-medium">{responses.length} resposta(s)</p>
            {responses.map((r, i) => (
              <div key={r.responseId || i} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {r.createTime ? new Date(r.createTime).toLocaleString('pt-BR') : ''}
                </p>
                {r.answers && Object.entries(r.answers).map(([key, ans]) => (
                  <p key={key} className="text-sm">
                    <span className="text-muted-foreground">{key}:</span>{' '}
                    {ans.textAnswers?.answers?.map(a => a.value).join(', ') || ''}
                  </p>
                ))}
              </div>
            ))}
            {!responses.length && <EmptyState icon={Users} title="Sem respostas" description="Nenhuma resposta recebida ainda" />}
          </div>
        )}
      </div>
    )
  }

  if (!forms.length) return <EmptyState icon={ClipboardList} title="Nenhum formulário" description="Seus formulários do Google Forms aparecerão aqui" />

  return (
    <div className="space-y-2">
      {forms.map(f => (
        <button key={f.id} onClick={() => openForm(f.id)}
          className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors w-full text-left">
          <ClipboardList className="h-5 w-5 shrink-0 text-purple-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{f.name}</p>
            <p className="text-xs text-muted-foreground">{f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : ''}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}
