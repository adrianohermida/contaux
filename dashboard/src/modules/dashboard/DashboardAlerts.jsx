import { AlertTriangle, Calendar, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ALERTS = [
  {
    icon: FileText,
    title: '3 faturas vencidas',
    desc: 'Total em aberto: R$ 4.600,00',
    severity: 'destructive',
  },
  {
    icon: Calendar,
    title: 'DCTF Web vence amanhã',
    desc: 'Obrigação fiscal — 5 empresas pendentes',
    severity: 'default',
  },
  {
    icon: AlertTriangle,
    title: 'Certificado digital expira em 15 dias',
    desc: 'Renovar antes do vencimento',
    severity: 'default',
  },
]

export default function DashboardAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {ALERTS.map((alert, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <alert.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.desc}</p>
              </div>
              <Badge variant={alert.severity}>
                {alert.severity === 'destructive' ? 'Urgente' : 'Atenção'}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
