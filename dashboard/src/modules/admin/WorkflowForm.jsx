import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'

const triggerLabels = {
  event: 'Evento',
  schedule: 'Agendamento',
  manual: 'Manual',
}

const emptyWorkflow = {
  name: '',
  trigger: 'event',
  conditions: [],
  actions: [],
  active: true,
}

export default function WorkflowForm({ open, onClose, onSave, editingWorkflow }) {
  const [form, setForm] = useState(emptyWorkflow)

  useEffect(() => {
    if (editingWorkflow) {
      setForm({
        name: editingWorkflow.name,
        trigger: editingWorkflow.trigger,
        conditions: [...(editingWorkflow.conditions || [])],
        actions: [...(editingWorkflow.actions || [])],
        active: editingWorkflow.active,
      })
    } else {
      setForm({ ...emptyWorkflow, conditions: [''], actions: [''] })
    }
  }, [editingWorkflow, open])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const updateCondition = (idx, value) => {
    setForm((f) => ({ ...f, conditions: f.conditions.map((c, i) => (i === idx ? value : c)) }))
  }
  const addAction = () => setForm((f) => ({ ...f, actions: [...f.actions, ''] }))
  const removeAction = (idx) => setForm((f) => ({ ...f, actions: f.actions.filter((_, i) => i !== idx) }))
  const updateAction = (idx, value) => {
    setForm((f) => ({ ...f, actions: f.actions.map((a, i) => (i === idx ? value : a)) }))
  }
  const addCondition = () => setForm((f) => ({ ...f, conditions: [...f.conditions, ''] }))
  const removeCondition = (idx) => setForm((f) => ({ ...f, conditions: f.conditions.filter((_, i) => i !== idx) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      conditions: form.conditions.filter((c) => c.trim()),
      actions: form.actions.filter((a) => a.trim()),
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingWorkflow ? 'Editar Automação' : 'Nova Automação'}
      description="Configure gatilhos, condições e ações do workflow"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="wf-name">Nome *</Label>
            <Input id="wf-name" placeholder="Nome da automação" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wf-trigger">Gatilho</Label>
            <Select id="wf-trigger" value={form.trigger} onChange={(e) => update('trigger', e.target.value)}>
              {Object.entries(triggerLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Condições */}
        <div className="space-y-2">
          <Label>Condições</Label>
          {form.conditions.map((cond, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Ex: status = pago"
                value={cond}
                onChange={(e) => updateCondition(idx, e.target.value)}
                className="flex-1"
              />
              {form.conditions.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCondition(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addCondition}>
            <Plus className="h-4 w-4" /> Adicionar Condição
          </Button>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <Label>Ações</Label>
          {form.actions.map((action, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Ex: Enviar email"
                value={action}
                onChange={(e) => updateAction(idx, e.target.value)}
                className="flex-1"
              />
              {form.actions.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAction(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addAction}>
            <Plus className="h-4 w-4" /> Adicionar Ação
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="wf-active"
            checked={form.active}
            onChange={(e) => update('active', e.target.checked)}
          />
          <Label htmlFor="wf-active">Ativo</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{editingWorkflow ? 'Salvar' : 'Criar'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
