import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCollection } from '@/hooks/useCollection'
import { useTheme } from '@/hooks/useTheme'
import { roleLabels, roleVariants } from './lib/mockData'
import { Building2, Users, Check, Palette } from 'lucide-react'

/** Cores de marca predefinidas para seleção rápida */
const PRESET_COLORS = [
  { name: 'Contaux', hex: '#3763EB' },
  { name: 'Âmbar', hex: '#D97706' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Rubi', hex: '#DC2626' },
  { name: 'Violeta', hex: '#7C3AED' },
  { name: 'Ciano', hex: '#0891B2' },
]

export default function ConfiguracoesPage() {
  const { settings, loading, saving, error, save } = useTheme()
  const { items: users } = useCollection('users')
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  // Sincroniza o form quando as settings carregam do backend
  useEffect(() => {
    setForm(settings)
  }, [settings])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await save(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // erro já tratado no hook
    }
  }

  const handleColorPreset = (hex) => {
    setForm((f) => ({ ...f, primary_color: hex }))
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
                <Input
                  id="ws-name"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="ws-color"
                    type="color"
                    value={form.primary_color || '#3763EB'}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="h-9 w-16 p-1"
                    aria-label="Seletor de cor primária"
                  />
                  <Input
                    value={form.primary_color || ''}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    aria-label="Valor hex da cor primária"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-tz">Fuso Horário</Label>
                <Input
                  id="ws-tz"
                  value={form.timezone || ''}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-locale">Idioma</Label>
                <Input
                  id="ws-locale"
                  value={form.locale || ''}
                  onChange={(e) => setForm({ ...form, locale: e.target.value })}
                />
              </div>
            </div>

            {/* Presets de cor */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Palette className="h-3.5 w-3.5" /> Cores de marca
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => handleColorPreset(c.hex)}
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-muted"
                    aria-label={`Aplicar cor ${c.name}`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview da cadência de cores */}
            <ColorCadencePreview hex={form.primary_color || '#3763EB'} />

            {error && (
              <p className="text-sm text-destructive" role="alert">Erro ao salvar: {error}</p>
            )}

            <Button type="submit" disabled={saving || loading}>
              {saved ? <><Check className="h-4 w-4" /> Salvo</> : saving ? 'Salvando...' : 'Salvar Configurações'}
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

/** Preview visual da cadência de cores gerada a partir da cor primária */
function ColorCadencePreview({ hex }) {
  return (
    <div className="rounded-md border border-border p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Cadência de cores gerada</p>
      <div className="flex flex-wrap gap-2">
        <Swatch label="Primary" color={hex} />
        <Swatch label="Accent" color={hex} light />
        <Swatch label="Ring" color={hex} />
        <Swatch label="Sidebar" color={hex} />
      </div>
    </div>
  )
}

function Swatch({ label, color, light }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-5 w-5 rounded border border-border"
        style={light ? { backgroundColor: color, opacity: 0.2 } : { backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-xs text-muted-foreground">{label}</span>
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
