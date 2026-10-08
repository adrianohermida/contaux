import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { request } from '@/lib/api'
import { Shield, KeyRound, Smartphone, AlertTriangle, Clock, Monitor } from 'lucide-react'
import PinManagementCard from './PinManagementCard'

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
  const [toggling, setToggling] = useState(null)
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

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleToggleMfa = async (userId, current) => {
    setToggling(userId)
    try {
      await request(`/auth/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ mfa_enabled: !current }),
      })
      setStats((prev) => ({
        ...prev,
        mfa_enabled: prev.mfa_enabled + (current ? -1 : 1),
        active_users: (prev.active_users || []).map((u) =>
          u.id === userId ? { ...u, mfa_enabled: !current } : u
        ),
        recent_logins: (prev.recent_logins || []).map((u) =>
          u.id === userId ? { ...u, mfa_enabled: !current } : u
        ),
      }))
      toast(`MFA ${!current ? 'ativado' : 'desativado'} com sucesso`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setToggling(null)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  const mfaCount = stats?.mfa_enabled ?? 0
  const totalUsers = stats?.total_users ?? 0
  const activeSessions = stats?.recent_logins?.length ?? 0
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
          { Icon: Smartphone, val: activeSessions, label: 'Sessões ativas', cls: 'text-muted-foreground' },
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

      {/* MFA — lista de usuários com toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" /> Autenticação de Dois Fatores (MFA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.active_users || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            stats.active_users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.mfa_enabled ? 'default' : 'outline'}>
                    {user.mfa_enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Switch
                    checked={!!user.mfa_enabled}
                    disabled={toggling === user.id}
                    onChange={() => handleToggleMfa(user.id, user.mfa_enabled)}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Sessões ativas — logins recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sessões Ativas (logins recentes)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.recent_logins || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão ativa registrada.</p>
          ) : (
            stats.recent_logins.map((user, i) => (
              <div key={user.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {user.name}
                      {i === 0 && <Badge variant="default" className="ml-2">Atual</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatLogin(user.last_login)}
                    </p>
                  </div>
                </div>
                {i !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast('Sessão encerrada (token expira em até 7d)', 'info')}
                  >
                    Encerrar
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
