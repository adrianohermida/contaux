import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, KeyRound, Smartphone, AlertTriangle } from 'lucide-react'

export default function SegurancaPage() {
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
              <p className="text-2xl font-bold">2/4</p>
              <p className="text-xs text-muted-foreground">Usuários com MFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Sessões ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Ameaças detectadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4" /> Autenticação de Dois Fatores (MFA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">TOTP via App Autenticador</p>
              <p className="text-xs text-muted-foreground">Google Authenticator, Authy, etc.</p>
            </div>
            <Badge variant="default">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Backup por SMS</p>
              <p className="text-xs text-muted-foreground">Fallback via código SMS</p>
            </div>
            <Badge variant="outline">Inativo</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sessões ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sessões Ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <SessionRow device="Chrome - Windows" location="Manaus, AM" ip="189.45.x.x" current />
          <SessionRow device="Safari - iPhone" location="Manaus, AM" ip="200.150.x.x" />
          <SessionRow device="Firefox - Linux" location="São Paulo, SP" ip="201.80.x.x" />
        </CardContent>
      </Card>
    </div>
  )
}

function SessionRow({ device, location, ip, current }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div>
        <p className="text-sm font-medium">{device} {current && <Badge variant="default" className="ml-2">Atual</Badge>}</p>
        <p className="text-xs text-muted-foreground">{location} · {ip}</p>
      </div>
      {!current && <Button variant="outline" size="sm">Encerrar</Button>}
    </div>
  )
}
