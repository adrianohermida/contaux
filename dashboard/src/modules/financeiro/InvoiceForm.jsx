import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { mockClients, invoiceStatusLabels } from './lib/mockData'
import { calcTotals, formatCurrency, todayISO, addDaysISO } from './lib/format'
import { Plus, Trash2 } from 'lucide-react'

export default function InvoiceForm({ open, onClose, onSave, editingInvoice }) {
  const [form, setForm] = useState({
    client_name: '',
    issue_date: todayISO(),
    due_date: addDaysISO(todayISO(), 15),
    status: 'draft',
    discount: 0,
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  })

  useEffect(() => {
    if (editingInvoice) {
      setForm({
        client_name: editingInvoice.client_name,
        issue_date: editingInvoice.issue_date,
        due_date: editingInvoice.due_date,
        status: editingInvoice.status,
        discount: editingInvoice.discount || 0,
        items: editingInvoice.items.map((it) => ({ ...it })),
      })
    } else {
      setForm({
        client_name: '',
        issue_date: todayISO(),
        due_date: addDaysISO(todayISO(), 15),
        status: 'draft',
        discount: 0,
        items: [{ description: '', quantity: 1, unit_price: 0 }],
      })
    }
  }, [editingInvoice, open])

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const updateItem = (idx, field, value) => {
    setForm((p) => ({
      ...p,
      items: p.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    }))
  }

  const addItem = () =>
    setForm((p) => ({ ...p, items: [...p.items, { description: '', quantity: 1, unit_price: 0 }] }))

  const removeItem = (idx) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))

  const { subtotal, total } = calcTotals(form.items, Number(form.discount))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.client_name || form.items.some((it) => !it.description)) return
    onSave({
      ...form,
      discount: Number(form.discount) || 0,
      items: form.items.map((it) => ({
        ...it,
        quantity: Number(it.quantity) || 0,
        unit_price: Number(it.unit_price) || 0,
      })),
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingInvoice ? 'Editar Fatura' : 'Nova Fatura'}
      description="Preencha os dados da fatura"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label>Cliente</Label>
            <Select value={form.client_name} onChange={(e) => update('client_name', e.target.value)}>
              <option value="">Selecione...</option>
              {mockClients.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
              {Object.entries(invoiceStatusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Data de emissão</Label>
            <Input type="date" value={form.issue_date} onChange={(e) => update('issue_date', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Vencimento</Label>
            <Input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} />
          </div>
        </div>

        {/* Itens */}
        <div className="space-y-2">
          <Label>Itens</Label>
          {form.items.map((it, idx) => (
            <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Descrição"
                value={it.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number" min="1" placeholder="Qtd"
                value={it.quantity}
                onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                className="w-20"
              />
              <Input
                type="number" min="0" step="0.01" placeholder="Preço"
                value={it.unit_price}
                onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                className="w-28"
              />
              <span className="text-sm font-medium w-24 text-right">
                {formatCurrency((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}
              </span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" /> Adicionar item
          </Button>
        </div>

        {/* Totais */}
        <div className="flex flex-col gap-1 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Label>Desconto (R$)</Label>
            <Input
              type="number" min="0" step="0.01"
              value={form.discount}
              onChange={(e) => update('discount', e.target.value)}
              className="w-28"
            />
          </div>
          <div className="text-sm space-y-1 text-right">
            <p className="text-muted-foreground">Subtotal: {formatCurrency(subtotal)}</p>
            <p className="font-bold">Total: {formatCurrency(total)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
