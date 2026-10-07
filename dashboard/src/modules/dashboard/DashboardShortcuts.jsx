import { UserPlus, FilePlus, Ticket as TicketIcon, Calculator } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SHORTCUTS = [
  { icon: UserPlus, label: 'Novo Cliente', path: '/crm' },
  { icon: FilePlus, label: 'Nova Fatura', path: '/financeiro' },
  { icon: TicketIcon, label: 'Novo Ticket', path: '/suporte' },
  { icon: Calculator, label: 'Lançamento', path: '/contabilidade' },
]

export default function DashboardShortcuts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atalhos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {SHORTCUTS.map((sc) => (
            <a
              key={sc.label}
              href={sc.path}
              className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <sc.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{sc.label}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
