import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { mockClients, paymentMethodLabels } from './lib/mockData'
import { formatCurrency, todayISO } from './lib/format'

export default function PaymentForm({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    client_name: '',
    invoice_number: '',
    amount: '',
    payment_date: todayISO(),
    method: 'pix',
    status: 'confirmed',
    reference: '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        client_name: '',
        invoice_number: '',
        amount: '',
        payment_date: todayISO(),
        method: 'pix',
        status: 'confirmed',
        reference: '',
      })
    }
  }, [open])

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.client_name || !form.amount) return
    onSave({
      ...form,
      amount: Number(form.amount) || 0,
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Registrar Pagamento"
      description="Registre um pagamento recebido"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label>Cliente *</Label>
            <Select value={form.client_name} onChange={(e) => update('client_name', e.target.value)}>
              <option value="">Selecione...</option>
              {mockClients.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Fatura (opcional)</Label>
            <Input
              placeholder="NF-2024-001"
              value={form.invoice_number}
              onChange={(e) => update('invoice_number', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Valor (R$) *</Label>
            <Input
              type="number" min="0" step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Data do pagamento</Label>
            <Input
              type="date"
              value={form.payment_date}
              onChange={(e) => update('payment_date', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Método</Label>
            <Select value={form.method} onChange={(e) => update('method', e.target.value)}>
              {Object.entries(paymentMethodLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Referência</Label>
            <Input
              placeholder="Ex: PIX-12345"
              value={form.reference}
              onChange={(e) => update('reference', e.target.value)}
            />
          </div>
        </div>

        {form.amount && (
          <p className="text-sm text-muted-foreground">
            Valor a registrar: <span className="font-bold text-foreground">{formatCurrency(Number(form.amount))}</span>
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Registrar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
