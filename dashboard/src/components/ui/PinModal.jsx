import { useState, useEffect, useRef } from 'react'
import { request } from '@/lib/api'
import { Button } from './button'
import { Spinner } from './spinner'
import { useToast } from './toast'
import { Shield } from 'lucide-react'

/**
 * Modal de confirmação de PIN para operações sensíveis.
 * Chama /api/auth/verify-pin e retorna o pin_token ao caller.
 */
export default function PinModal({ open, onClose, onConfirm, title = 'Confirmar PIN' }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setPin('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!/^\d{4,6}$/.test(pin)) {
      toast('PIN deve ter 4 a 6 dígitos', 'error')
      return
    }
    setLoading(true)
    try {
      const data = await request('/auth/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      })
      onConfirm(data.pin_token)
      setPin('')
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Esta operação é sensível. Digite seu PIN para confirmar.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="\d{4,6}"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••"
            autoComplete="off"
            disabled={loading}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || pin.length < 4}>
              {loading ? <Spinner /> : 'Confirmar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
