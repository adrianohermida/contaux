import { Users, FileText, DollarSign, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STATS = [
  {
    icon: Users,
    label: 'Clientes Ativos',
    value: '127',
    change: '+8%',
    trend: 'up',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FileText,
    label: 'Faturas Pendentes',
    value: '23',
    change: '+3',
    trend: 'up',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: DollarSign,
    label: 'Receita do Mês',
    value: 'R$ 84.320',
    change: '+12%',
    trend: 'up',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Ticket,
    label: 'Tickets Abertos',
    value: '7',
    change: '-2',
    trend: 'down',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', stat.bg)}>
              <stat.icon className={cn('h-6 w-6', stat.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className={cn(
                'text-xs font-medium',
                stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500',
              )}>
                {stat.change} vs. mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
