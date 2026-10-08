import { AlertTriangle, Calendar, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCollection } from '@/hooks/useCollection'
import { formatCurrency, isOverdue } from '@/modules/financeiro/lib/format'

export default function DashboardAlerts() {
  const { items: invoices } = useCollection('invoices')
  const { items: obligations } = useCollection('obligations')

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || (i.status === 'sent' && isOverdue(i.due_date, i.status)))
  const overdueTotal = overdueInvoices.reduce((sum, i) => {
    const total = (i.items || []).reduce((s, it) => s + (it.quantity * it.unit_price), 0) - (i.discount || 0)
    return sum + Math.max(0, total)
  }, 0)

  const upcomingObligations = obligations
    .filter((o) => o.status === 'pending' || o.status === 'overdue')
    .slice(0, 2)

  const alerts = [
    ...(overdueInvoices.length > 0
      ? [{ icon: FileText, title: `${overdueInvoices.length} fatura(s) vencida(s)`, desc: `Total em aberto: ${formatCurrency(overdueTotal)}`, severity: 'destructive' }]
      : []),
    ...upcomingObligations.map((o) => ({
      icon: Calendar,
      title: o.status === 'overdue' ? `${o.title} vencida` : `${o.title} vence em ${o.due_date}`,
      desc: o.description || '',
      severity: o.status === 'overdue' ? 'destructive' : 'default',
    })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum alerta no momento.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <alert.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  {alert.desc && <p className="text-xs text-muted-foreground">{alert.desc}</p>}
                </div>
                <Badge variant={alert.severity}>
                  {alert.severity === 'destructive' ? 'Urgente' : 'Atenção'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
