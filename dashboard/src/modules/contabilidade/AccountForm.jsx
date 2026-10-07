import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { accountTypeLabels } from './lib/mockData'

export default function AccountForm({ open, onClose, onSave, editingAccount, accounts }) {
  const [form, setForm] = useState({ code: '', name: '', type: 'asset', parent_id: '' })

  useEffect(() => {
    if (editingAccount) {
      setForm({ code: editingAccount.code, name: editingAccount.name, type: editingAccount.type, parent_id: editingAccount.parent_id || '' })
    } else {
      setForm({ code: '', name: '', type: 'asset', parent_id: '' })
    }
  }, [editingAccount, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    const level = form.parent_id ? (accounts.find((a) => a.id === form.parent_id)?.level || 1) + 1 : 1
    onSave({ ...form, level })
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingAccount ? 'Editar Conta' : 'Nova Conta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="acc-code">Código</Label>
          <Input id="acc-code" placeholder="Ex: 1.1.4" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-name">Nome</Label>
          <Input id="acc-name" placeholder="Nome da conta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-type">Tipo</Label>
          <Select id="acc-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(accountTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-parent">Conta Pai</Label>
          <Select id="acc-parent" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
            <option value="">Nenhuma (conta raiz)</option>
            {accounts.filter((a) => a.active && a.id !== editingAccount?.id).map((a) => (
              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
            ))}
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
