import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrency } from './lib/format'
import { Plus, Trash2 } from 'lucide-react'

const emptyInvoice = {
  model: '55',
  series: '1',
  issue_date: new Date().toISOString().slice(0, 10),
  client_name: '',
  items: [{ description: '', quantity: 1, unit_price: 0 }],
  taxes: { icms: 0, pis: 0, cofins: 0, iss: 0, irpj: 0 },
}

export default function TaxInvoiceForm({ open, onClose, onSave, editingInvoice }) {
  const [form, setForm] = useState(emptyInvoice)

  useEffect(() => {
    if (editingInvoice) {
      setForm({
        model: editingInvoice.model,
        series: editingInvoice.series,
        issue_date: editingInvoice.issue_date,
        client_name: editingInvoice.client_name,
        items: editingInvoice.items.map((i) => ({ ...i })),
        taxes: { ...editingInvoice.taxes },
      })
    } else {
      setForm({ ...emptyInvoice, issue_date: new Date().toISOString().slice(0, 10), items: [{ description: '', quantity: 1, unit_price: 0 }] })
    }
  }, [editingInvoice, open])

  const subtotal = form.items.reduce((s, it) => s + (it.quantity * it.unit_price || 0), 0)
  const totalTaxes = Object.values(form.taxes).reduce((s, v) => s + (Number(v) || 0), 0)
  const total = subtotal + totalTaxes

  const updateItem = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    }))
  }

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }] }))
  const removeItem = (idx) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, total })
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingInvoice ? 'Editar NFe' : 'Nova NFe'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nfe-model">Modelo</Label>
            <Select id="nfe-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option value="55">55 - NFe</option>
              <option value="65">65 - NFCe</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nfe-series">Série</Label>
            <Input id="nfe-series" value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nfe-date">Data de Emissão</Label>
            <Input id="nfe-date" type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nfe-client">Cliente</Label>
          <Input id="nfe-client" placeholder="Nome do cliente" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
        </div>

        <div className="space-y-2">
          <Label>Itens</Label>
          {form.items.map((item, idx) => (
            <div key={idx} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[120px]">
                <Input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} required />
              </div>
              <div className="w-20">
                <Input type="number" step="0.01" placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} required />
              </div>
              <div className="w-28">
                <Input type="number" step="0.01" placeholder="Valor Unit." value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} required />
              </div>
              {form.items.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" /> Adicionar Item
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['icms', 'pis', 'cofins', 'iss', 'irpj'].map((tax) => (
            <div key={tax} className="space-y-1">
              <Label className="text-xs uppercase">{tax}</Label>
              <Input type="number" step="0.01" value={form.taxes[tax] || ''} onChange={(e) => setForm({ ...form, taxes: { ...form.taxes, [tax]: Number(e.target.value) } })} />
            </div>
          ))}
        </div>

        <div className="flex justify-between rounded-md border border-border p-3 text-sm">
          <span>Subtotal: <strong className="font-mono">{formatCurrency(subtotal)}</strong></span>
          <span>Impostos: <strong className="font-mono">{formatCurrency(totalTaxes)}</strong></span>
          <span className="font-semibold">Total: <strong className="font-mono">{formatCurrency(total)}</strong></span>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
