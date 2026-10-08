import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ticketPriorityLabels, ticketStatusLabels } from './lib/mockData'

export default function TicketForm({ open, onClose, onSave, editingTicket }) {
  const [form, setForm] = useState({
    client_name: '', subject: '', description: '',
    priority: 'medium', status: 'open', category: '', assigned_to: '',
  })

  useEffect(() => {
    if (editingTicket) {
      setForm({
        client_name: editingTicket.client_name,
        subject: editingTicket.subject,
        description: editingTicket.description,
        priority: editingTicket.priority,
        status: editingTicket.status,
        category: editingTicket.category || '',
        assigned_to: editingTicket.assigned_to || '',
      })
    } else {
      setForm({ client_name: '', subject: '', description: '', priority: 'medium', status: 'open', category: '', assigned_to: '' })
    }
  }, [editingTicket, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingTicket ? 'Editar Ticket' : 'Novo Ticket'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tk-client">Cliente</Label>
          <Input id="tk-client" placeholder="Nome do cliente" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tk-subject">Assunto</Label>
          <Input id="tk-subject" placeholder="Assunto do ticket" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tk-desc">Descrição</Label>
          <Textarea id="tk-desc" placeholder="Descreva o problema..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tk-priority">Prioridade</Label>
            <Select id="tk-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.entries(ticketPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tk-status">Status</Label>
            <Select id="tk-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(ticketStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tk-category">Categoria</Label>
            <Input id="tk-category" placeholder="Ex: Fiscal" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tk-assigned">Responsável</Label>
            <Input id="tk-assigned" placeholder="Nome do responsável" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
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
