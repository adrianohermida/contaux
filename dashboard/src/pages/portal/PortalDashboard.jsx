import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Receipt, FileText, LifeBuoy, Clock } from 'lucide-react'
import { createApiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

const invoicesApi = createApiClient('invoices')
const ticketsApi = createApiClient('tickets')
const documentsApi = createApiClient('documents')

export default function PortalDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [invoices, tickets, documents] = await Promise.all([
          invoicesApi.list(),
          ticketsApi.list(),
          documentsApi.list(),
        ])
        const pendingInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'draft')
        const openTickets = tickets.filter((t) => t.status === 'open')
        setStats({
          totalInvoices: invoices.length,
          pendingInvoices: pendingInvoices.length,
          openTickets: openTickets.length,
          totalDocuments: documents.length,
        })
      } catch (err) {
        console.error('Erro ao carregar dados:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const cards = [
    { icon: Receipt, label: 'Faturas Pendentes', value: stats.pendingInvoices, color: 'text-amber-600' },
    { icon: FileText, label: 'Documentos', value: stats.totalDocuments, color: 'text-blue-600' },
    { icon: LifeBuoy, label: 'Tickets Abertos', value: stats.openTickets, color: 'text-purple-600' },
    { icon: Clock, label: 'Total de Faturas', value: stats.totalInvoices, color: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.tenant_name || 'Sua empresa'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={cn('h-5 w-5', card.color)} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avisos</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.pendingInvoices > 0 ? (
            <p className="text-sm text-muted-foreground">
              Você tem <strong className="text-foreground">{stats.pendingInvoices} fatura(s) pendente(s)</strong>.
              Acesse "Minhas Faturas" para visualizar.
            </p>
          ) : (
            <EmptyState
              icon={Receipt}
              title="Tudo em dia"
              description="Não há faturas pendentes no momento."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


