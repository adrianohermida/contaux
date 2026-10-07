import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { roleLabels, roleVariants, mockUsers } from './lib/mockData'
import { Building2, Users, Check } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState({
    name: 'Contaux Contadoria',
    primary_color: '#0ea5e9',
    timezone: 'America/Manaus',
    locale: 'pt-BR',
  })
  const [users] = useState(mockUsers)
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Branding, usuários e integrações</p>
      </div>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ws-name">Nome do Workspace</Label>
                <Input id="ws-name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input id="ws-color" type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="h-9 w-16 p-1" />
                  <Input value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-tz">Fuso Horário</Label>
                <Input id="ws-tz" value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-locale">Idioma</Label>
                <Input id="ws-locale" value={settings.locale} onChange={(e) => setSettings({ ...settings, locale: e.target.value })} />
              </div>
            </div>
            <Button type="submit">
              {saved ? <><Check className="h-4 w-4" /> Salvo</> : 'Salvar Configurações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" /> Usuários e Papéis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Papel</th>
                  <th className="px-4 py-3 text-left font-medium">MFA</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge></td>
                    <td className="px-4 py-3">{u.mfa_enabled ? <Badge variant="default">Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}</td>
                    <td className="px-4 py-3">{u.active ? <Badge variant="default">Ativo</Badge> : <Badge variant="destructive">Inativo</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 p-4 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge variant={u.mfa_enabled ? 'default' : 'outline'}>MFA: {u.mfa_enabled ? 'Ativo' : 'Inativo'}</Badge>
                  <Badge variant={u.active ? 'default' : 'destructive'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Integrações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <IntegrationRow name="Google Calendar" status="Conectado" description="Sincronização de eventos e prazos" />
          <IntegrationRow name="Cloudflare Email" status="Configurado" description="Workers de email (router + forwarder)" />
          <IntegrationRow name="Stripe" status="Não conectado" description="Pagamentos e cobranças" />
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationRow({ name, status, description }) {
  const connected = status === 'Conectado' || status === 'Configurado'
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={connected ? 'default' : 'outline'}>{status}</Badge>
        <Button variant="outline" size="sm">{connected ? 'Gerenciar' : 'Conectar'}</Button>
      </div>
    </div>
  )
}
