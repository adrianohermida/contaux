import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { LifeBuoy, Send } from 'lucide-react'
import { createApiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const ticketsApi = createApiClient('tickets')

const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' }
const statusLabels = { open: 'Aberto', in_progress: 'Em Andamento', resolved: 'Resolvido', closed: 'Fechado' }

export default function PortalTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    ticketsApi.list()
      .then(setTickets)
      .catch((err) => console.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await ticketsApi.create({
        ...form,
        client_name: user?.name || 'Cliente',
        status: 'open',
        messages: [],
      })
      setForm({ subject: '', description: '', priority: 'medium' })
      setShowForm(false)
      load()
    } catch (err) {
      console.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Suporte</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Novo Ticket'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Prioridade</Label>
              <select id="priority" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <Button onClick={handleSubmit} disabled={submitting} size="sm">
              {submitting ? <Spinner className="h-4 w-4" /> : <><Send className="h-4 w-4" /> Enviar</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center"><Spinner className="h-8 w-8" /></div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="Nenhum ticket" description="Você não abriu tickets de suporte." />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{t.subject}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.created_date} · {priorityLabels[t.priority] || t.priority}
                  </p>
                </div>
                <Badge variant={t.status === 'open' ? 'default' : 'secondary'}>
                  {statusLabels[t.status] || t.status}
                </Badge>
              </CardHeader>
              {t.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
