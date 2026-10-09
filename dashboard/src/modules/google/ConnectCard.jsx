import { useState } from 'react'
import { request } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plug, CheckCircle2, Loader2 } from 'lucide-react'

export default function ConnectCard({ connected, profile, onDisconnect }) {
  const [disconnecting, setDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await request('/google/disconnect', { method: 'DELETE' })
      onDisconnect?.()
    } catch { /* erro silencioso */ } finally {
      setDisconnecting(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {connected ? (
            <>
              {profile?.picture ? (
                <img src={profile.picture} alt="" className="h-10 w-10 rounded-full" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              )}
              <div>
                <p className="font-medium">{profile?.name || 'Conectado'}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Conectado
              </span>
            </>
          ) : (
            <>
              <Plug className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Google não conectado</p>
                <p className="text-sm text-muted-foreground">Conecte para acessar Calendar, Drive, Tasks, Sheets, Docs, Forms e Ads</p>
              </div>
            </>
          )}
        </div>
        {connected ? (
          <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
            {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Desconectar'}
          </Button>
        ) : (
          <Button onClick={() => { window.location.href = '/api/google/auth' }}>
            Conectar Google
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
