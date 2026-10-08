import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { emailApi } from '@/lib/emailApi'
import { Zap, Rocket, RefreshCw, Check, AlertCircle, ArrowDownToLine, ArrowUpFromLine, ShieldAlert } from 'lucide-react'

/** Painel de gerenciamento dos Cloudflare Workers (router + forwarder) */
export default function EmailWorkersPanel() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState(null)
  const [deployResult, setDeployResult] = useState(null)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await emailApi.getWorkersStatus()
      setStatus(data)
      if (data?.router?.status === 403 || data?.forwarder?.status === 403) {
        setError('Token Cloudflare sem permissão para Workers. Verifique se o token tem escopo "Account → Workers Scripts → Read/Edit".')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStatus() }, [loadStatus])

  const handleDeploy = async () => {
    setDeploying(true)
    setError(null)
    setDeployResult(null)
    try {
      const result = await emailApi.deployWorkers()
      setDeployResult(result)
      await loadStatus()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeploying(false)
    }
  }

  const routerStatus = status?.router
  const forwarderStatus = status?.forwarder
  const hasPermissionError = routerStatus?.status === 403 || forwarderStatus?.status === 403

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {deployResult && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          <Check className="h-4 w-4 shrink-0" /> Workers deployados com sucesso!
        </div>
      )}

      {/* Ação de Deploy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Rocket className="h-4 w-4" /> Deploy dos Workers</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Deploya os Workers <strong>email-router</strong> (recebimento) e <strong>email-forwarder</strong> (envio via MailChannels) no Cloudflare.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadStatus} disabled={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> Status
            </Button>
            <Button size="sm" onClick={handleDeploy} disabled={deploying || hasPermissionError}>
              {deploying ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Deployando...</> : <><Rocket className="h-3.5 w-3.5" /> Deployar</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Worker: email-router (recebimento) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowDownToLine className="h-4 w-4" /> email-router (Recebimento)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={routerStatus?.exists ? 'default' : 'outline'}>
              {routerStatus?.exists ? <><Check className="h-3 w-3" /> Deployado</> : routerStatus?.status === 403 ? 'Erro de permissão' : 'Não deployado'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Recebe emails do Email Routing e envia para o webhook da API
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Worker: email-forwarder (envio) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowUpFromLine className="h-4 w-4" /> email-forwarder (Envio)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={forwarderStatus?.exists ? 'default' : 'outline'}>
              {forwarderStatus?.exists ? <><Check className="h-3 w-3" /> Deployado</> : forwarderStatus?.status === 403 ? 'Erro de permissão' : 'Não deployado'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Envia emails via MailChannels API (gratuito no Cloudflare)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Fluxo de funcionamento */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4" /> Como funciona</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong>Recebimento:</strong> Email → Cloudflare Email Routing → email-router Worker → POST /api/inbox/webhook → Caixa de Entrada</p>
            <p><strong>Envio:</strong> Dashboard → POST /api/inbox/send → email-forwarder Worker → MailChannels API → Destinatário</p>
            <p><strong>Fallback:</strong> Se o Worker falhar, o envio cai para SMTP (nodemailer).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
