import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { request } from '@/lib/api'
import { Shield, KeyRound, Smartphone, AlertTriangle, Clock, Monitor } from 'lucide-react'

function formatLogin(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffH < 24) return `há ${diffH}h`
  return `há ${diffD}d`
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
        recent_logins: prev.recent_logins.map((u) =>
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
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <KeyRound className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mfaCount}/{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Usuários com MFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{activeSessions}</p>
              <p className="text-xs text-muted-foreground">Sessões ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{threats}</p>
              <p className="text-xs text-muted-foreground">Ameaças detectadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA — lista de usuários com toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" /> Autenticação de Dois Fatores (MFA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.recent_logins || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            stats.recent_logins.map((user) => (
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
