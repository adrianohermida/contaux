import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/AuthContext'
import { request } from '@/lib/api'
import { Lock } from 'lucide-react'

/** Card de auto-serviço de PIN — definir ou trocar o próprio PIN. */
export default function PinManagementCard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const hasPin = user?.has_pin

  const [form, setForm] = useState({ current: '', novo: '', confirmar: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!/^\d{4,6}$/.test(form.novo)) {
      toast('Novo PIN deve ter 4 a 6 dígitos', 'error')
      return
    }
    if (form.novo !== form.confirmar) {
      toast('Confirmação não confere com o novo PIN', 'error')
      return
    }
    setSaving(true)
    try {
      await request('/auth/set-pin', {
        method: 'POST',
        body: JSON.stringify({
          new_pin: form.novo,
          current_pin: hasPin ? form.current : undefined,
        }),
      })
      toast(hasPin ? 'PIN alterado com sucesso' : 'PIN definido com sucesso', 'success')
      setForm({ current: '', novo: '', confirmar: '' })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lock className="h-4 w-4" /> PIN de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {hasPin
            ? 'Você tem um PIN configurado. Use-o para confirmar operações sensíveis (excluir faturas, pagamentos, lançamentos).'
            : 'Defina um PIN para confirmar operações sensíveis como exclusão de registros financeiros.'}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {hasPin && (
            <input
              type="password"
              inputMode="numeric"
              placeholder="PIN atual"
              value={form.current}
              onChange={(e) => setForm((f) => ({ ...f, current: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              className="rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          <input
            type="password"
            inputMode="numeric"
            placeholder="Novo PIN"
            value={form.novo}
            onChange={(e) => setForm((f) => ({ ...f, novo: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            className="rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="Confirmar PIN"
            value={form.confirmar}
            onChange={(e) => setForm((f) => ({ ...f, confirmar: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            className="rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button onClick={handleSave} disabled={saving || form.novo.length < 4}>
          {saving ? <Spinner /> : hasPin ? 'Trocar PIN' : 'Definir PIN'}
        </Button>
      </CardContent>
    </Card>
  )
}
