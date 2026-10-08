import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const emptyContact = {
  name: '', position: '', email: '', phone: '',
  client_id: '', tags: '',
}

export default function ContactForm({ open, onClose, onSave, editingContact, clients = [] }) {
  const [form, setForm] = useState(emptyContact)

  useEffect(() => {
    if (editingContact) {
      setForm({
        ...emptyContact,
        ...editingContact,
        tags: (editingContact.tags || []).join(', '),
      })
    } else {
      setForm(emptyContact)
    }
  }, [editingContact, open])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    onSave({ ...form, tags })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingContact ? 'Editar Contato' : 'Novo Contato'}
      description="Dados do contato vinculado a um cliente"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ct-name">Nome *</Label>
          <Input id="ct-name" placeholder="Nome do contato" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ct-position">Cargo</Label>
          <Input id="ct-position" placeholder="Ex: Contador" value={form.position} onChange={(e) => update('position', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ct-email">Email *</Label>
            <Input id="ct-email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ct-phone">Telefone</Label>
            <Input id="ct-phone" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ct-client">Cliente Vinculado</Label>
          <Select id="ct-client" value={form.client_id} onChange={(e) => update('client_id', e.target.value)}>
            <option value="">Selecione um cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ct-tags">Tags (separadas por vírgula)</Label>
          <Input id="ct-tags" placeholder="Ex: Decisor, Financeiro" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{editingContact ? 'Salvar' : 'Criar'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
