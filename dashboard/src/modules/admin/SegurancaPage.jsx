import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { request } from '@/lib/api'
import { KeyRound, Smartphone, AlertTriangle, Clock, Monitor, Trash2 } from 'lucide-react'
import PinManagementCard from './PinManagementCard'
import MfaSetupCard from './MfaSetupCard'

function formatLogin(s) {
  if (!s) return '—'
  const m = Math.floor((Date.now() - new Date(s)) / 60000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  return m < 1440 ? `há ${Math.floor(m / 60)}h` : `há ${Math.floor(m / 1440)}d`
}

export default function SegurancaPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await request('/stats/security')
      setStats(data)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchUserInfo = useCallback(async () => {
    try {
      const me = await request('/auth/me')
      setMfaEnabled(!!me.mfa_enabled)
    } catch { /* ignora */ }
  }, [])

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const data = await request('/auth/sessions')
      setSessions(data)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSessionsLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchStats(); fetchUserInfo(); fetchSessions() }, [fetchStats, fetchUserInfo, fetchSessions])

  const revokeSession = async (id) => {
    try {
      await request(`/auth/sessions/${id}`, { method: 'DELETE' })
      toast('Sessão encerrada', 'success')
      fetchSessions()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const revokeAllSessions = async () => {
    if (!confirm('Encerrar todas as outras sessões? Você continuará logado neste dispositivo.')) return
    try {
      await request('/auth/sessions', { method: 'DELETE' })
      toast('Todas as sessões foram encerradas', 'success')
      fetchSessions()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  const mfaCount = stats?.mfa_enabled ?? 0
  const totalUsers = stats?.total_users ?? 0
  const threats = 0

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Centro de Segurança</h1>
        <p className="text-sm text-muted-foreground">MFA, sessões ativas e monitoramento</p>
      </div>

      {/* Status de segurança */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { Icon: KeyRound, val: `${mfaCount}/${totalUsers}`, label: 'Usuários com MFA', cls: 'text-primary' },
          { Icon: Smartphone, val: sessions.length, label: 'Sessões ativas', cls: 'text-muted-foreground' },
          { Icon: AlertTriangle, val: threats, label: 'Ameaças detectadas', cls: 'text-primary' },
        ].map(({ Icon, val, label, cls }, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className={`h-8 w-8 ${cls}`} />
              <div>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PIN de Segurança — auto-serviço */}
      <PinManagementCard />

      {/* MFA — setup/desativação para o usuário atual */}
      <MfaSetupCard mfaEnabled={mfaEnabled} onChanged={setMfaEnabled} />

      {/* Sessões ativas — gerenciamento real */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Sessões Ativas</CardTitle>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={revokeAllSessions}>
                Encerrar todas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessionsLoading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão ativa.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Sessão #{s.id}
                      {s.is_current && <Badge variant="default" className="ml-2">Atual</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatLogin(s.created_at)}
                    </p>
                  </div>
                </div>
                {!s.is_current && (
                  <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Atividade recente (audit logs) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.recent_audit || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
          ) : (
            stats.recent_audit.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.user || '—'} · {log.entity_type || '—'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
