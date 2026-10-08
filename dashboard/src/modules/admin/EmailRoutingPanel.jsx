import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { emailApi } from '@/lib/emailApi'
import { Mail, Plus, Trash2, RefreshCw, Check, AlertCircle, Globe, ShieldAlert } from 'lucide-react'

/** Painel de gerenciamento do Cloudflare Email Routing (recebimento) */
export default function EmailRoutingPanel() {
  const [status, setStatus] = useState(null)
  const [rules, setRules] = useState([])
  const [destinations, setDestinations] = useState([])
  const [dns, setDns] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [errors, setErrors] = useState({})
  const [newDestEmail, setNewDestEmail] = useState('')
  const [newRule, setNewRule] = useState({ name: '', matchers: [{ type: 'literal', field: 'to', value: '' }], actions: [{ type: 'worker', value: ['contaux-email-router'] }] })

  const loadAll = useCallback(async () => {
    setLoading(true)
    setErrors({})
    try {
      const [st, rl, ds, dn] = await Promise.allSettled([
        emailApi.getRoutingStatus(),
        emailApi.listRules(),
        emailApi.listDestinations(),
        emailApi.getDns(),
      ])
      const nextErrors = {}
      if (st.status === 'rejected') nextErrors.status = st.reason?.message
      if (ds.status === 'rejected') nextErrors.destinations = ds.reason?.message
      if (dn.status === 'rejected') nextErrors.dns = dn.reason?.message
      setErrors(nextErrors)

      if (st.status === 'fulfilled') setStatus(st.value)
      if (rl.status === 'fulfilled') setRules(rl.value?.result || [])
      if (ds.status === 'fulfilled') setDestinations(ds.value?.result || [])
      if (dn.status === 'fulfilled') setDns(dn.value)
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Infere status ativo se a API de status falhar mas regras existem
  const enabled = status?.result?.enabled || (errors.status && rules.length > 0)

  const handleEnable = async () => {
    setActionLoading('enable')
    try { await emailApi.enableRouting(); await loadAll() } catch (e) { setErrors({ status: e.message }) }
    finally { setActionLoading(null) }
  }

  const handleDisable = async () => {
    setActionLoading('disable')
    try { await emailApi.disableRouting(); await loadAll() } catch (e) { setErrors({ status: e.message }) }
    finally { setActionLoading(null) }
  }

  const handleAddDestination = async (e) => {
    e.preventDefault()
    if (!newDestEmail) return
    setActionLoading('addDest')
    try { await emailApi.addDestination(newDestEmail); setNewDestEmail(''); await loadAll() }
    catch (e) { setErrors({ destinations: e.message }) }
    finally { setActionLoading(null) }
  }

  const handleDeleteDestination = async (id) => {
    setActionLoading('delDest')
    try { await emailApi.deleteDestination(id); await loadAll() } catch (e) { setErrors({ destinations: e.message }) }
    finally { setActionLoading(null) }
  }

  const handleCreateRule = async (e) => {
    e.preventDefault()
    if (!newRule.matchers[0]?.value) return
    setActionLoading('addRule')
    try {
      await emailApi.createRule(newRule)
      setNewRule({ ...newRule, matchers: [{ ...newRule.matchers[0], value: '' }] })
      await loadAll()
    } catch (e) { setErrors({ rules: e.message }) }
    finally { setActionLoading(null) }
  }

  const handleDeleteRule = async (id) => {
    setActionLoading('delRule')
    try { await emailApi.deleteRule(id); await loadAll() } catch (e) { setErrors({ rules: e.message }) }
    finally { setActionLoading(null) }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" /> Carregando...</div>

  return (
    <div className="space-y-4">
      {errors.general && (
        <ErrorBanner message={errors.general} />
      )}

      {/* Status */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> Status do Email Routing</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {errors.status && (
            <PermissionNotice message="Sem permissão para ler o status do Email Routing. O token precisa do escopo Zone → Email Routing → Read." />
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={enabled ? 'default' : 'outline'}>{enabled ? 'Ativo' : 'Inativo'}</Badge>
              <span className="text-xs text-muted-foreground">{status?.result?.name || 'contaux.com.br'}</span>
              {errors.status && enabled && <span className="text-xs text-muted-foreground">(inferido das regras)</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadAll}><RefreshCw className="h-3.5 w-3.5" /> Atualizar</Button>
              {enabled ? (
                <Button variant="destructive" size="sm" onClick={handleDisable} disabled={actionLoading === 'disable'}>Desativar</Button>
              ) : (
                <Button size="sm" onClick={handleEnable} disabled={actionLoading === 'enable'}>Ativar Routing</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Roteamento */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Regras de Roteamento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {errors.rules && <ErrorBanner message={errors.rules} />}
          <form onSubmit={handleCreateRule} className="flex gap-2">
            <Input placeholder="email@contaux.com.br" value={newRule.matchers[0]?.value || ''} onChange={(e) => setNewRule({ ...newRule, matchers: [{ type: 'literal', field: 'to', value: e.target.value }] })} className="flex-1" aria-label="Endereço de email para a regra" />
            <Button type="submit" size="sm" disabled={actionLoading === 'addRule'}><Plus className="h-4 w-4" /> Adicionar</Button>
          </form>
          <div className="space-y-2">
            {rules.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma regra configurada.</p>}
            {rules.map((rule) => {
              const matcher = rule.matchers?.[0]
              const action = rule.actions?.[0]
              const matcherLabel = matcher?.type === 'all' ? 'Todos os emails' : matcher?.value || 'Regra'
              const actionLabels = { drop: 'Descartar', forward: 'Encaminhar', worker: 'Worker' }
              const actionLabel = actionLabels[action?.type] || action?.type || ''
              const actionValue = Array.isArray(action?.value) ? action.value[0] : action?.value || ''
              return (
                <div key={rule.id} className="flex items-center justify-between rounded-md border border-border p-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.enabled ? 'default' : 'outline'}>{rule.enabled ? 'Ativa' : 'Inativa'}</Badge>
                    <span className="text-sm font-medium">{rule.name || matcherLabel}</span>
                    <span className="text-xs text-muted-foreground">→ {actionLabel}{actionValue ? `: ${actionValue}` : ''}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)} disabled={actionLoading === 'delRule'} aria-label={`Deletar regra ${rule.name}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Destinos */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Endereços de Destino Verificados</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {errors.destinations && (
            <PermissionNotice message="Sem permissão para listar destinos. O token precisa do escopo Account → Email Routing Addresses → Read." />
          )}
          <form onSubmit={handleAddDestination} className="flex gap-2">
            <Input type="email" placeholder="destino@gmail.com" value={newDestEmail} onChange={(e) => setNewDestEmail(e.target.value)} className="flex-1" aria-label="Email de destino" />
            <Button type="submit" size="sm" disabled={actionLoading === 'addDest'}><Plus className="h-4 w-4" /> Adicionar</Button>
          </form>
          <div className="space-y-2">
            {destinations.length === 0 && !errors.destinations && <p className="text-xs text-muted-foreground">Nenhum destino verificado.</p>}
            {destinations.map((d) => (
              <div key={d.id || d.email} className="flex items-center justify-between rounded-md border border-border p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{d.email}</span>
                  <Badge variant={d.verified ? 'default' : 'outline'}>{d.verified ? <><Check className="h-3 w-3" /> Verificado</> : 'Pendente'}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteDestination(d.id)} disabled={actionLoading === 'delDest'} aria-label={`Remover destino ${d.email}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DNS */}
      {dns?.result?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4" /> Registros DNS do Email Routing</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dns.result.map((record, i) => (
                <div key={i} className="rounded-md border border-border p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{record.type}</Badge>
                    <span className="font-mono">{record.name}</span>
                    <Badge variant={record.priority ? 'default' : 'outline'}>Prioridade: {record.priority || '-'}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-muted-foreground break-all">{record.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </div>
  )
}

function PermissionNotice({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" /> {message}
    </div>
  )
}
