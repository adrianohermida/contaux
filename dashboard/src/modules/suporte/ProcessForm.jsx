import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { processStatusLabels } from './lib/mockData'

export default function ProcessForm({ open, onClose, onSave, editingProcess }) {
  const [form, setForm] = useState({
    client_name: '', process_number: '', court: '', subject: '',
    status: 'active', start_date: new Date().toISOString().slice(0, 10),
    lawyer: '', value: 0, notes: '',
  })

  useEffect(() => {
    if (editingProcess) {
      setForm({
        client_name: editingProcess.client_name,
        process_number: editingProcess.process_number,
        court: editingProcess.court,
        subject: editingProcess.subject,
        status: editingProcess.status,
        start_date: editingProcess.start_date,
        lawyer: editingProcess.lawyer,
        value: editingProcess.value,
        notes: editingProcess.notes || '',
      })
    } else {
      setForm({ client_name: '', process_number: '', court: '', subject: '', status: 'active', start_date: new Date().toISOString().slice(0, 10), lawyer: '', value: 0, notes: '' })
    }
  }, [editingProcess, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, value: Number(form.value) || 0 })
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingProcess ? 'Editar Processo' : 'Novo Processo'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pr-client">Cliente</Label>
            <Input id="pr-client" placeholder="Nome do cliente" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-number">Nº do Processo</Label>
            <Input id="pr-number" placeholder="0000000-00.0000.8.26.0000" value={form.process_number} onChange={(e) => setForm({ ...form, process_number: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pr-court">Tribunal/Vara</Label>
            <Input id="pr-court" placeholder="Ex: 1ª Vara Cível" value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-subject">Assunto</Label>
            <Input id="pr-subject" placeholder="Ex: Cobrança indevida" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pr-status">Status</Label>
            <Select id="pr-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(processStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-date">Data de Início</Label>
            <Input id="pr-date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-value">Valor (R$)</Label>
            <Input id="pr-value" type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pr-lawyer">Advogado</Label>
          <Input id="pr-lawyer" placeholder="Nome do advogado" value={form.lawyer} onChange={(e) => setForm({ ...form, lawyer: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pr-notes">Observações</Label>
          <Textarea id="pr-notes" placeholder="Anotações sobre o processo..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
