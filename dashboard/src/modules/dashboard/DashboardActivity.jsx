import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCollection } from '@/hooks/useCollection'
import { formatCurrency } from '@/modules/financeiro/lib/format'

export default function DashboardActivity() {
  const { items: clients } = useCollection('clients')
  const { items: payments } = useCollection('payments')
  const { items: invoices } = useCollection('invoices')
  const { items: tickets } = useCollection('tickets')

  const activities = [
    ...clients.slice(0, 3).map((c) => ({
      text: `Cliente: ${c.name}`,
      badge: 'CRM',
      date: c.created,
    })),
    ...payments.slice(0, 3).map((p) => ({
      text: `Pagamento: ${formatCurrency(Number(p.amount || 0))} — ${p.client_name}`,
      badge: 'Financeiro',
      date: p.payment_date,
    })),
    ...invoices.slice(0, 2).map((i) => ({
      text: `Fatura ${i.number}: ${formatCurrency(Number(i.items?.reduce((s, it) => s + (it.quantity * it.unit_price), 0) || 0))}`,
      badge: 'Financeiro',
      date: i.issue_date,
    })),
    ...tickets.slice(0, 2).map((t) => ({
      text: `Ticket: ${t.subject}`,
      badge: 'Suporte',
      date: t.created_date,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma atividade recente. Use a página de Importação para cadastrar seus dados.
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{item.text}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
