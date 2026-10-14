import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { BarChart3, ExternalLink } from 'lucide-react'

export default function AdsTab() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request('/google/ads/status')
      .then(data => setStatus(data))
      .catch(() => setStatus({ configured: false }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>

  if (!status?.configured) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-medium">Google Ads requer configuração adicional</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Para acessar dados do Google Ads, é necessário um <strong>developer token</strong> aprovado pelo Google.
            Solicite no Google Ads API Center e configure a variável <code className="text-xs bg-muted px-1 py-0.5 rounded">GOOGLE_ADS_DEVELOPER_TOKEN</code>.
          </p>
          <Button variant="outline" size="sm" onClick={() => window.open('https://developers.google.com/google-ads/api/docs/first-call/dev-token', '_blank')}>
            <ExternalLink className="h-4 w-4 mr-1" /> Como obter o developer token
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 text-center space-y-2">
        <BarChart3 className="h-10 w-10 mx-auto text-green-500" />
        <p className="font-medium">Google Ads conectado</p>
        <p className="text-sm text-muted-foreground">{status.message}</p>
        <p className="text-xs text-muted-foreground">A listagem de campanhas requer o pacote google-ads-api adicional.</p>
      </CardContent>
    </Card>
  )
}
