import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const { login, loginWithMfa } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mfaToken, setMfaToken] = useState(null)
  const [totpCode, setTotpCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result?.mfa_required) {
        setMfaToken(result.mfa_token)
        setLoading(false)
        return
      }
      navigate(result.role === 'client' ? '/portal' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMfaSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginWithMfa(mfaToken, totpCode)
      navigate(user.role === 'client' ? '/portal' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Contaux Contadoria</h1>
          <p className="text-sm text-muted-foreground">
            {mfaToken ? 'Verificação de dois fatores' : 'Acesse sua conta'}
          </p>
        </div>

        {mfaToken ? (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="flex justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="totp">Código TOTP</Label>
              <Input
                id="totp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                className="text-center text-lg tracking-widest"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Digite o código de 6 dígitos do seu app autenticador.
            </p>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || totpCode.length !== 6}>
              {loading ? <Spinner className="h-4 w-4" /> : 'Verificar e entrar'}
            </Button>
            <Button
              type="button" variant="ghost" className="w-full"
              onClick={() => { setMfaToken(null); setTotpCode(''); setError('') }}
            >
              Voltar
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : 'Entrar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
