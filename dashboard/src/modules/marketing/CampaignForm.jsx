import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { campaignStatusLabels, channelLabels } from './lib/mockData'

export default function CampaignForm({ open, onClose, onSave, editingCampaign }) {
  const [form, setForm] = useState({
    name: '', channel: 'email', audience: '', status: 'draft',
    start_date: '', end_date: '',
  })

  useEffect(() => {
    if (editingCampaign) {
      setForm({
        name: editingCampaign.name, channel: editingCampaign.channel,
        audience: editingCampaign.audience, status: editingCampaign.status,
        start_date: editingCampaign.start_date || '', end_date: editingCampaign.end_date || '',
      })
    } else {
      setForm({ name: '', channel: 'email', audience: '', status: 'draft', start_date: '', end_date: '' })
    }
  }, [editingCampaign, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cp-name">Nome</Label>
          <Input id="cp-name" placeholder="Nome da campanha" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cp-channel">Canal</Label>
            <Select id="cp-channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {Object.entries(channelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-status">Status</Label>
            <Select id="cp-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(campaignStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-audience">Público-alvo</Label>
          <Input id="cp-audience" placeholder="Ex: Todos os clientes PF" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cp-start">Data de Início</Label>
            <Input id="cp-start" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-end">Data de Término</Label>
            <Input id="cp-end" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
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
