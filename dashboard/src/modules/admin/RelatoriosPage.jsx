import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockReports } from './lib/mockData'
import { BarChart3, Download, FileText, FileSpreadsheet, File } from 'lucide-react'

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

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Relatórios e Analytics</h1>
        <p className="text-sm text-muted-foreground">Relatórios customizados e exportações</p>
      </div>

      {/* Dashboard de analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Clientes Ativos</p>
            <p className="text-2xl font-bold">48</p>
            <p className="text-xs text-primary">+3 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Faturamento (Out)</p>
            <p className="text-2xl font-bold">R$ 84k</p>
            <p className="text-xs text-primary">+12% vs Set</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tickets Abertos</p>
            <p className="text-2xl font-bold">7</p>
            <p className="text-xs text-destructive">2 urgentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">NFe Emitidas</p>
            <p className="text-2xl font-bold">32</p>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" /> Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                {mockReports.map((r) => {
                  const Icon = formatIcons[r.format] || File
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{r.type}</Badge></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {r.format.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{scheduleLabels[r.schedule]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.last_run.split('-').reverse().join('/')}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Gerar</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {mockReports.map((r) => {
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
                  <Button variant="outline" size="sm" className="mt-2"><Icon className="h-3.5 w-3.5" /> Gerar Relatório</Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
