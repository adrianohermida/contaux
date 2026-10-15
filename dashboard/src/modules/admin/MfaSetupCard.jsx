import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { request } from '@/lib/api'
import { Shield, Check, Copy } from 'lucide-react'

/**
 * Card de configuração de MFA/TOTP para o usuário atual.
 * Permite ativar (com QR code + verificação) e desativar (com código TOTP).
 */
export default function MfaSetupCard({ mfaEnabled, onChanged }) {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState(null) // 'setup' | 'disable'
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [token, setToken] = useState('')
  const [backupCodes, setBackupCodes] = useState(null)
  const [step, setStep] = useState(1) // 1=qr, 2=verify, 3=backup codes

  const startSetup = async () => {
    setLoading(true)
    try {
      const data = await request('/auth/mfa/setup', { method: 'POST' })
      setQrCode(data.qr_code)
      setSecret(data.secret)
      setStep(1)
      setMode('setup')
      setDialogOpen(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    if (!token.trim()) return
    setLoading(true)
    try {
      const data = await request('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: token.trim() }),
      })
      setBackupCodes(data.backup_codes)
      setStep(3)
      toast('MFA ativado com sucesso!', 'success')
      onChanged?.(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const disableMfa = async () => {
    if (!token.trim()) return
    setLoading(true)
    try {
      await request('/auth/mfa/disable', {
        method: 'POST',
        body: JSON.stringify({ token: token.trim() }),
      })
      toast('MFA desativado', 'info')
      setDialogOpen(false)
      onChanged?.(false)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setToken('')
    setQrCode(null)
    setSecret(null)
    setBackupCodes(null)
    setStep(1)
  }

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      toast('Chave copiada', 'info')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" /> Autenticação de Dois Fatores (MFA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              MFA {mfaEnabled ? 'ativado' : 'desativado'}
            </p>
            <p className="text-xs text-muted-foreground">
              {mfaEnabled
                ? 'Sua conta exige um código TOTP além da senha.'
                : 'Adicione uma camada extra de segurança com TOTP.'}
            </p>
          </div>
          <Badge variant={mfaEnabled ? 'default' : 'outline'}>
            {mfaEnabled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {mfaEnabled ? (
          <Button variant="outline" size="sm" onClick={() => { setMode('disable'); setDialogOpen(true); setToken('') }}>
            Desativar MFA
          </Button>
        ) : (
          <Button size="sm" onClick={startSetup} disabled={loading}>
            {loading ? <Spinner /> : 'Configurar MFA'}
          </Button>
        )}

        <Dialog open={dialogOpen} onClose={closeDialog}
          title={mode === 'disable' ? 'Desativar MFA' : 'Configurar MFA'}
          description={mode === 'disable' ? 'Confirme com seu código TOTP atual.' : undefined}>
          {mode === 'setup' && step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR code no seu app autenticador (Google Authenticator, Authy, etc.)
                ou digite a chave manualmente.
              </p>
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
                </div>
              )}
              {secret && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Chave manual:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-2 py-1 text-xs break-all">{secret}</code>
                    <Button variant="ghost" size="sm" onClick={copySecret}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={() => setStep(2)}>Já escaneiei</Button>
            </div>
          )}
          {mode === 'setup' && step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Digite o código de 6 dígitos do seu app:</p>
              <Input
                type="text" placeholder="000000" maxLength={6}
                value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifySetup()}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              <Button className="w-full" onClick={verifySetup} disabled={loading || !token.trim()}>
                {loading ? <Spinner /> : 'Verificar e ativar'}
              </Button>
            </div>
          )}
          {mode === 'setup' && step === 3 && backupCodes && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <p className="text-sm font-medium">MFA ativado!</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Guarde estes códigos de backup. Cada um pode ser usado uma vez se você perder
                acesso ao seu app autenticador.
              </p>
              <div className="grid grid-cols-2 gap-2 rounded bg-muted p-3">
                {backupCodes.map((code) => (
                  <code key={code} className="text-sm text-center">{code}</code>
                ))}
              </div>
              <Button className="w-full" onClick={closeDialog}>Concluir</Button>
            </div>
          )}
          {mode === 'disable' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Digite seu código TOTP atual para confirmar:</p>
              <Input
                type="text" placeholder="000000" maxLength={6}
                value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && disableMfa()}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              <Button variant="destructive" className="w-full" onClick={disableMfa} disabled={loading || !token.trim()}>
                {loading ? <Spinner /> : 'Desativar MFA'}
              </Button>
            </div>
          )}
        </Dialog>
      </CardContent>
    </Card>
  )
}
