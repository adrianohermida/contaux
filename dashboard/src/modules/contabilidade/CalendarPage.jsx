import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { useCollection } from '@/hooks/useCollection'
import { obligationTypeLabels, obligationStatusLabels, obligationStatusVariants } from './lib/mockData'
import { formatDate } from './lib/format'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { CalendarDays, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

const statusIcons = {
  pending: Clock,
  done: CheckCircle2,
  overdue: AlertCircle,
}

export default function CalendarPage() {
  const { items: obligations, loading } = useCollection('obligations')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...obligations]
    if (typeFilter !== 'all') result = result.filter((o) => o.type === typeFilter)
    return result.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  }, [obligations, typeFilter])

  const stats = useMemo(() => ({
    pending: obligations.filter((o) => o.status === 'pending').length,
    overdue: obligations.filter((o) => o.status === 'overdue').length,
    done: obligations.filter((o) => o.status === 'done').length,
  }), [obligations])

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Calendário Contábil</h1>
        <p className="text-sm text-muted-foreground">Obrigações fiscais e prazos</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Vencidas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary">{stats.done}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
          <option value="all">Todos os tipos</option>
          <option value="federal">Federal</option>
          <option value="state">Estadual</option>
          <option value="municipal">Municipal</option>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4" /> {filtered.length} obrigação(ões)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((ob) => {
            const Icon = statusIcons[ob.status]
            return (
              <div key={ob.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${
                  ob.status === 'overdue' ? 'text-destructive' :
                  ob.status === 'done' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{ob.title}</p>
                    <Badge variant={obligationStatusVariants[ob.status]}>{obligationStatusLabels[ob.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ob.description}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Vencimento: <strong>{formatDate(ob.due_date)}</strong></span>
                    <span>·</span>
                    <span>{obligationTypeLabels[ob.type]}</span>
                    <span>·</span>
                    <span className="capitalize">{ob.frequency}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && !loading && (
            <EmptyState icon={CalendarDays} title="Nenhuma obrigação encontrada" description="Cadastre obrigações fiscais para acompanhar prazos." />
          )}
          {loading && (
            <div className="flex justify-center py-12"><Spinner /></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
