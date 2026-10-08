import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { useCollection } from '@/hooks/useCollection'
import { request } from '@/lib/api'
import { BarChart3, Download, FileText, FileSpreadsheet, File, Check, Users, DollarSign, Ticket, Receipt } from 'lucide-react'

const formatIcons = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: File,
}

const scheduleLabels = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  'on-demand': 'Sob demanda',
}

const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

export default function RelatoriosPage() {
  const { items: reports, update, loading: reportsLoading } = useCollection('reports')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [generating, setGenerating] = useState(null)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await request('/stats/dashboard')
      setStats(data)
    } catch {
      /* ignora — mantém stats nulo */
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleGenerate = async (report) => {
    setGenerating(report.id)
    try {
      // Atualiza a data da última execução
      await update(report.id, { last_run: new Date().toISOString().slice(0, 10) })
      toast(`Relatório "${report.name}" gerado com sucesso`, 'success')
    } catch {
      toast('Erro ao gerar relatório', 'error')
    } finally {
      setGenerating(null)
    }
  }

  const statCards = [
    { label: 'Clientes Ativos', value: stats?.active_clients ?? 0, sub: 'cadastrados', icon: Users, color: 'text-primary' },
    { label: 'Faturamento (mês)', value: formatBRL(stats?.monthly_revenue ?? 0), sub: 'recebido', icon: DollarSign, color: 'text-green-600' },
    { label: 'Tickets Abertos', value: stats?.open_tickets ?? 0, sub: stats?.urgent_tickets ? `${stats.urgent_tickets} urgentes` : 'nenhum urgente', icon: Ticket, color: stats?.urgent_tickets ? 'text-destructive' : 'text-muted-foreground' },
    { label: 'NF-e Emitidas (mês)', value: stats?.monthly_nfe ?? 0, sub: 'no mês atual', icon: Receipt, color: 'text-primary' },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Relatórios e Analytics</h1>
        <p className="text-sm text-muted-foreground">Relatórios customizados e exportações</p>
      </div>

      {/* Dashboard de analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 w-20 rounded bg-muted animate-pulse mb-2" />
                <div className="h-7 w-16 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Relatórios disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" /> Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Nome</th>
                      <th className="px-4 py-3 text-left font-medium">Tipo</th>
                      <th className="px-4 py-3 text-left font-medium">Formato</th>
                      <th className="px-4 py-3 text-left font-medium">Agendamento</th>
                      <th className="px-4 py-3 text-left font-medium">Última execução</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => {
                      const Icon = formatIcons[r.format] || File
                      return (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{r.name}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{r.type}</Badge></td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {r.format.toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{scheduleLabels[r.schedule]}</td>
                          <td className="px-4 py-3 text-muted-foreground">{r.last_run?.split('-').reverse().join('/') || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerate(r)}
                              disabled={generating === r.id}
                            >
                              {generating === r.id
                                ? <><Check className="h-3.5 w-3.5" /> Gerando...</>
                                : <><Download className="h-3.5 w-3.5" /> Gerar</>}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {reports.map((r) => {
                  const Icon = formatIcons[r.format] || File
                  return (
                    <div key={r.id} className="rounded-md border border-border p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.type} · {r.format.toUpperCase()}</p>
                        </div>
                        <Badge variant="outline">{scheduleLabels[r.schedule]}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleGenerate(r)}
                        disabled={generating === r.id}
                      >
                        {generating === r.id
                          ? <><Check className="h-3.5 w-3.5" /> Gerando...</>
                          : <><Icon className="h-3.5 w-3.5" /> Gerar Relatório</>}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
