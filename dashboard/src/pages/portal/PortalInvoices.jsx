import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Receipt } from 'lucide-react'
import { createApiClient } from '@/lib/api'

const invoicesApi = createApiClient('invoices')

const statusLabels = {
  draft: 'Rascunho',
  sent: 'Enviada',
  paid: 'Paga',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
}

const statusVariants = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'secondary',
}

export default function PortalInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invoicesApi.list()
      .then(setInvoices)
      .catch((err) => console.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Minhas Faturas</h1>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma fatura"
          description="Você não tem faturas no momento."
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Fatura #{inv.number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vencimento: {inv.due_date || '—'}
                  </p>
                </div>
                <Badge variant={statusVariants[inv.status] || 'secondary'}>
                  {statusLabels[inv.status] || inv.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cliente: {inv.client_name}</span>
                  <span className="font-semibold">
                    R$ {(inv.items || []).reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
