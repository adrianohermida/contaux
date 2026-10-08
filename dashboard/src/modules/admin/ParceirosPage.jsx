import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Label } from '@/components/ui/input'
import { Building2, Plus, RefreshCw, Trash2, Key, Check, AlertCircle, Briefcase, FileText, DollarSign, Clock } from 'lucide-react'

const API = '/api/integration'

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error((await res.json())?.error || 'Erro na requisição')
  return res.json()
}

export default function ParceirosPage() {
  const [tab, setTab] = useState('offices')
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Escritórios Parceiros</h2>
        <p className="text-sm text-muted-foreground">Integração com escritórios de advocacia (Hermida Maia e outros)</p>
      </div>
      <div className="flex gap-2">
        <Button variant={tab === 'offices' ? 'default' : 'outline'} size="sm" onClick={() => setTab('offices')}>
          <Building2 className="h-4 w-4" /> Escritórios
        </Button>
        <Button variant={tab === 'requests' ? 'default' : 'outline'} size="sm" onClick={() => setTab('requests')}>
          <Briefcase className="h-4 w-4" /> Solicitações
        </Button>
        <Button variant={tab === 'cases' ? 'default' : 'outline'} size="sm" onClick={() => setTab('cases')}>
          <FileText className="h-4 w-4" /> Processos
        </Button>
        <Button variant={tab === 'custas' ? 'default' : 'outline'} size="sm" onClick={() => setTab('custas')}>
          <DollarSign className="h-4 w-4" /> Custas
        </Button>
      </div>
      {tab === 'offices' && <OfficesTab />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'cases' && <CasesTab />}
      {tab === 'custas' && <CustasTab />}
    </div>
  )
}

// ===== Aba: Escritórios =====
function OfficesTab() {
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ external_id: '', name: '', webhook_url: '', contact_email: '', contact_phone: '' })

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setOffices(await api('/offices')) } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    try { await api('/offices', { method: 'POST', body: JSON.stringify(form) }); setShowForm(false); setForm({ external_id: '', name: '', webhook_url: '', contact_email: '', contact_phone: '' }); await load() }
    catch (e) { setError(e.message) }
  }

  const handleDeactivate = async (id) => {
    try { await api(`/offices/${id}`, { method: 'DELETE' }); await load() } catch (e) { setError(e.message) }
  }

  const handleRegenKey = async (id) => {
    try { await api(`/offices/${id}/regenerate-key`, { method: 'POST' }); await load() } catch (e) { setError(e.message) }
  }

  if (loading) return <LoadingSpinner />
  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Novo Escritório</Button>
      </div>
      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <div><Label>External ID (office_id do parceiro)</Label><Input value={form.external_id} onChange={e => setForm({ ...form, external_id: e.target.value })} required /></div>
              <div><Label>Nome do Escritório</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Webhook URL</Label><Input value={form.webhook_url} onChange={e => setForm({ ...form, webhook_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Email de Contato</Label><Input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
              <div className="col-span-2 flex gap-2"><Button type="submit" size="sm">Cadastrar</Button><Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      {offices.length === 0 && <p className="text-sm text-muted-foreground">Nenhum escritório parceiro cadastrado.</p>}
      {offices.map(o => (
        <Card key={o.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{o.name}</span>
                  <Badge variant={o.active ? 'default' : 'outline'}>{o.active ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">External ID: {o.external_id}</div>
                <div className="text-xs text-muted-foreground">API Key: <code className="rounded bg-muted px-1 py-0.5">{o.api_key?.slice(0, 20)}...</code></div>
                {o.contact_email && <div className="text-xs text-muted-foreground">{o.contact_email}</div>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleRegenKey(o.id)}><Key className="h-3.5 w-3.5" /> Nova Key</Button>
                {o.active && <Button variant="ghost" size="sm" onClick={() => handleDeactivate(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ===== Aba: Solicitações de Serviço =====
const serviceTypeLabels = { accounting: 'Contabilidade', tax: 'Impostos', custas: 'Custas', payroll: 'Folha', consulting: 'Consultoria' }
const statusLabels = { pending: 'Pendente', accepted: 'Aceita', in_progress: 'Em Andamento', completed: 'Concluída', rejected: 'Rejeitada' }
const statusVariants = { pending: 'outline', accepted: 'default', in_progress: 'default', completed: 'default', rejected: 'outline' }

function RequestsTab() {
  const [requests, setRequests] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [reqs, offs] = await Promise.all([api('/service-requests/all'), api('/offices')])
      setRequests(Array.isArray(reqs) ? reqs : [])
      setOffices(offs)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpdateStatus = async (id, status) => {
    try { await api(`/service-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load() }
    catch (e) { setError(e.message) }
  }

  if (loading) return <LoadingSpinner />
  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="flex justify-end"><Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Atualizar</Button></div>
      {requests.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma solicitação recebida.</p>}
      {requests.map(r => (
        <Card key={r.id}>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariants[r.status] || 'outline'}>{statusLabels[r.status] || r.status}</Badge>
                <Badge variant="secondary">{serviceTypeLabels[r.service_type] || r.service_type}</Badge>
                <span className="text-sm font-medium">{r.requester_name}</span>
                <Badge variant="outline">{r.requester_type === 'lawyer' ? 'Advogado' : 'Cliente'}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{r.office_name || `Escritório #${r.partner_office_id}`}</span>
            </div>
            <p className="text-sm text-muted-foreground">{r.description}</p>
            {r.case_number && <p className="text-xs text-muted-foreground">Processo: {r.case_number}</p>}
            {r.deadline && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Prazo: {new Date(r.deadline).toLocaleDateString('pt-BR')}</p>}
            {r.status === 'pending' && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => handleUpdateStatus(r.id, 'accepted')}><Check className="h-3.5 w-3.5" /> Aceitar</Button>
                <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(r.id, 'rejected')}>Rejeitar</Button>
              </div>
            )}
            {r.status === 'accepted' && (
              <Button size="sm" onClick={() => handleUpdateStatus(r.id, 'in_progress')}>Iniciar Trabalho</Button>
            )}
            {r.status === 'in_progress' && (
              <Button size="sm" onClick={() => handleUpdateStatus(r.id, 'completed')}><Check className="h-3.5 w-3.5" /> Concluir</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ===== Aba: Processos =====
function CasesTab() {
  const [cases, setCases] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null)
      try {
        const [cs, offs] = await Promise.all([api('/cases/all'), api('/offices')])
        setCases(Array.isArray(cs) ? cs : [])
        setOffices(offs)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [])

  const officeName = (id) => offices.find(o => o.id === id)?.name || `Escritório #${id}`

  if (loading) return <LoadingSpinner />
  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {cases.length === 0 && <p className="text-sm text-muted-foreground">Nenhum processo sincronizado.</p>}
      {cases.map(c => (
        <Card key={c.id}>
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium font-mono text-sm">{c.case_number}</span>
              <span className="text-xs text-muted-foreground">{c.office_name || `Escritório #${c.partner_office_id}`}</span>
            </div>
            {c.subject && <p className="text-sm text-muted-foreground">{c.subject}</p>}
            {c.court && <p className="text-xs text-muted-foreground">Tribunal: {c.court}</p>}
            {c.value > 0 && <p className="text-xs text-muted-foreground">Valor: R$ {Number(c.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
            {c.publications && Array.isArray(c.publications) && c.publications.length > 0 && (
              <p className="text-xs text-muted-foreground">{c.publications.length} publicação(ões) sincronizada(s)</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ===== Aba: Custas =====
function CustasTab() {
  const [custas, setCustas] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [cs, offs] = await Promise.all([api('/custas/all'), api('/offices')])
      setCustas(Array.isArray(cs) ? cs : [])
      setOffices(offs)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const officeName = (id) => offices.find(o => o.id === id)?.name || `Escritório #${id}`
  const custasStatusLabels = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido' }

  const handleUpdateStatus = async (id, status) => {
    try { await api(`/custas/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load() }
    catch (e) { setError(e.message) }
  }

  if (loading) return <LoadingSpinner />
  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {custas.length === 0 && <p className="text-sm text-muted-foreground">Nenhum prazo de custas registrado.</p>}
      {custas.map(c => (
        <Card key={c.id}>
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={c.status === 'paid' ? 'default' : 'outline'}>{custasStatusLabels[c.status] || c.status}</Badge>
                <span className="text-sm font-medium">{c.custas_type}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.office_name || `Escritório #${c.partner_office_id}`}</span>
            </div>
            {c.case_number && <p className="text-xs text-muted-foreground">Processo: {c.case_number}</p>}
            <p className="text-sm font-medium">R$ {Number(c.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Vencimento: {new Date(c.due_date).toLocaleDateString('pt-BR')}</p>
            {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
            {c.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(c.id, 'paid')}><Check className="h-3.5 w-3.5" /> Marcar como Pago</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ===== Helpers =====
function LoadingSpinner() {
  return <div className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" /> Carregando...</div>
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </div>
  )
}
