import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ACTIVITIES = [
  { type: 'client', text: 'Novo cliente cadastrado: Padaria São João', time: 'há 5 min', badge: 'CRM' },
  { type: 'payment', text: 'Pagamento recebido: R$ 2.400,00 — Silva ME', time: 'há 22 min', badge: 'Financeiro' },
  { type: 'ticket', text: 'Ticket #1042 aberto: Dúvida sobre DCTF', time: 'há 1 h', badge: 'Suporte' },
  { type: 'invoice', text: 'Fatura #2891 emitida: R$ 1.800,00', time: 'há 2 h', badge: 'Financeiro' },
  { type: 'client', text: 'Cliente atualizado: Transportes Rápido Ltda', time: 'há 3 h', badge: 'CRM' },
  { type: 'alert', text: 'Obrigação fiscal vence amanhã: DCTF Web', time: 'há 4 h', badge: 'Fiscal' },
  { type: 'payment', text: 'Pagamento recebido: R$ 950,00 — Mercado do Bento', time: 'há 6 h', badge: 'Financeiro' },
  { type: 'ticket', text: 'Ticket #1041 resolvido: Acesso ao portal', time: 'há 8 h', badge: 'Suporte' },
  { type: 'invoice', text: 'Fatura #2890 vencida: R$ 1.200,00', time: 'há 12 h', badge: 'Financeiro' },
  { type: 'client', text: 'Novo cliente cadastrado: Auto Peças Turbo', time: 'há 1 d', badge: 'CRM' },
]

export default function DashboardActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {ACTIVITIES.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{item.text}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline">{item.badge}</Badge>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
