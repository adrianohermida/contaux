import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar } from 'lucide-react'

export default function CalendarTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    request('/google/calendar/events')
      .then(data => setEvents(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
  if (error) return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  if (!events.length) return <EmptyState icon={Calendar} title="Nenhum evento próximo" description="Sua agenda do Google Calendar está livre" />

  return (
    <div className="space-y-2">
      {events.map(ev => (
        <div key={ev.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
          <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm">{ev.summary || '(Sem título)'}</p>
            <p className="text-xs text-muted-foreground">
              {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString('pt-BR') : ev.start?.date || 'Data indefinida'}
            </p>
            {ev.location && <p className="text-xs text-muted-foreground mt-0.5">{ev.location}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
