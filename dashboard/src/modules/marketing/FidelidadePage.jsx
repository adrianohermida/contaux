import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockLoyaltyPrograms, mockCustomerPoints, tierLabels, tierVariants } from './lib/mockData'
import { Award, Users, Gift } from 'lucide-react'

export default function FidelidadePage() {
  const [programs] = useState(mockLoyaltyPrograms)
  const [customers] = useState(mockCustomerPoints)

  const program = programs[0]

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Programa de Fidelidade</h1>
        <p className="text-sm text-muted-foreground">Pontos, tiers e recompensas dos clientes</p>
      </div>

      {/* Programa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" /> {program.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{program.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant={program.active ? 'default' : 'secondary'}>
              {program.active ? 'Ativo' : 'Inativo'}
            </Badge>
            <span className="text-sm">{program.points_per_real} ponto(s) por R$ 1</span>
          </div>

          {/* Tiers */}
          <div>
            <p className="mb-2 text-sm font-medium">Tiers</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {program.tier_thresholds.map((t) => (
                <div key={t.tier} className="rounded-md border border-border p-3 text-center">
                  <Badge variant={tierVariants[t.tier]}>{tierLabels[t.tier]}</Badge>
                  <p className="mt-2 text-xs text-muted-foreground">{t.min_points} pts</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recompensas */}
          <div>
            <p className="mb-2 text-sm font-medium">Recompensas</p>
            <div className="space-y-2">
              {program.rewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="text-sm">{r.name}</span>
                  </div>
                  <Badge variant="outline">{r.points_cost} pts</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pontos por cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" /> Pontos por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo de Pontos</th>
                  <th className="px-4 py-3 text-left font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.client_name}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.points_balance.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3"><Badge variant={tierVariants[c.tier]}>{tierLabels[c.tier]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {customers.map((c) => (
              <div key={c.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.client_name}</p>
                  <Badge variant={tierVariants[c.tier]}>{tierLabels[c.tier]}</Badge>
                </div>
                <p className="mt-1 text-sm font-mono">{c.points_balance.toLocaleString('pt-BR')} pontos</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
