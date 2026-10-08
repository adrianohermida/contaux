import { Users, FileText, DollarSign, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useCollection } from '@/hooks/useCollection'
import { formatCurrency } from '@/modules/financeiro/lib/format'
import { isOverdue } from '@/modules/financeiro/lib/format'

export default function DashboardStats() {
  const { items: clients } = useCollection('clients')
  const { items: invoices } = useCollection('invoices')
  const { items: payments } = useCollection('payments')
  const { items: tickets } = useCollection('tickets')

  const activeClients = clients.filter((c) => c.status === 'active').length
  const pendingInvoices = invoices.filter((i) => ['sent', 'overdue', 'draft'].includes(i.status)).length
  const monthRevenue = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const openTickets = tickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length

  const stats = [
    { icon: Users, label: 'Clientes Ativos', value: String(activeClients), color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FileText, label: 'Faturas Pendentes', value: String(pendingInvoices), color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: DollarSign, label: 'Receita Confirmada', value: formatCurrency(monthRevenue), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Ticket, label: 'Tickets Abertos', value: String(openTickets), color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', stat.bg)} aria-hidden="true">
              <stat.icon className={cn('h-6 w-6', stat.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
