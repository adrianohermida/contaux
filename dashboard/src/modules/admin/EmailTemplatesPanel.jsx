import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { request } from '@/lib/api'
import { Mail, Eye, Send, Monitor, Tablet, Smartphone } from 'lucide-react'

/**
 * Painel de templates de email — lista, preview (desktop/tablet/mobile) e envio de teste.
 * Espelha a funcionalidade descrita na documentação do Base44 (Emails > preview e test).
 */
export default function EmailTemplatesPanel() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [device, setDevice] = useState('desktop')
  const [testEmail, setTestEmail] = useState('')
  const [testStatus, setTestStatus] = useState(null)

  useEffect(() => {
    request('/email/templates')
      .then((d) => {
        setTemplates(d.templates || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const loadPreview = useCallback(async (key) => {
    setPreviewLoading(true)
    setPreview(null)
    try {
      const data = await request('/email/templates/preview', {
        method: 'POST',
        body: JSON.stringify({ template: key }),
      })
      setPreview(data)
    } catch {
      setPreview(null)
    }
    setPreviewLoading(false)
  }, [])

  const handleSelect = (tpl) => {
    setSelected(tpl)
    setTestStatus(null)
    loadPreview(tpl.key)
  }

  const handleSendTest = async () => {
    if (!testEmail || !selected) return
    setTestStatus({ type: 'loading' })
    try {
      await request('/email/templates/test', {
        method: 'POST',
        body: JSON.stringify({ template: selected.key, to: testEmail }),
      })
      setTestStatus({ type: 'success', message: 'Email de teste enviado!' })
    } catch (err) {
      setTestStatus({ type: 'error', message: err.message || 'Erro ao enviar teste' })
    }
  }

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Lista de templates */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">Templates disponíveis</p>
        {templates.map((tpl) => (
          <button
            key={tpl.key}
            onClick={() => handleSelect(tpl)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selected?.key === tpl.key
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{tpl.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tpl.description}</p>
          </button>
        ))}
      </div>

      {/* Preview + teste */}
      <div className="space-y-4">
        {!selected && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Eye className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Selecione um template para visualizar o preview</p>
            </CardContent>
          </Card>
        )}

        {selected && (
          <>
            {/* Barra de ações */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">{selected.description}</p>
              </div>
              {/* Toggle de dispositivo */}
              <div className="flex gap-1 rounded-lg border border-border p-1">
                <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} icon={Monitor} label="Desktop" />
                <DeviceButton active={device === 'tablet'} onClick={() => setDevice('tablet')} icon={Tablet} label="Tablet" />
                <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')} icon={Smartphone} label="Mobile" />
              </div>
            </div>

            {/* Preview do email */}
            <Card>
              <CardContent className="p-0 overflow-hidden">
                {previewLoading ? (
                  <div className="flex justify-center py-16"><Spinner /></div>
                ) : preview ? (
                  <div className="flex justify-center bg-muted/30 p-4" style={{ minHeight: '400px' }}>
                    <iframe
                      srcDoc={preview.html}
                      title="Preview do email"
                      className="border-0 rounded-lg bg-white shadow-sm transition-all"
                      style={{
                        width: deviceWidths[device],
                        maxWidth: '100%',
                        height: '500px',
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Não foi possível carregar o preview.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Envio de teste */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-end gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <Label htmlFor="test-email">Enviar teste para</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendTest} disabled={!testEmail || testStatus?.type === 'loading'}>
                    <Send className="h-4 w-4" />
                    Enviar teste
                  </Button>
                </div>
                {testStatus?.type === 'success' && (
                  <p className="text-sm text-green-600 mt-2">{testStatus.message}</p>
                )}
                {testStatus?.type === 'error' && (
                  <p className="text-sm text-red-600 mt-2">{testStatus.message}</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function DeviceButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
