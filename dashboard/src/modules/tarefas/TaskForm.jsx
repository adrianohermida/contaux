import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { taskStatusLabels, taskPriorityLabels } from './lib/labels'

export default function TaskForm({ open, onClose, onSave, editingTask }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', status: 'todo',
    due_date: '', assigned_to: '', category: '',
  })

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'todo',
        due_date: editingTask.due_date || '',
        assigned_to: editingTask.assigned_to || '',
        category: editingTask.category || '',
      })
    } else {
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assigned_to: '', category: '' })
    }
  }, [editingTask, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="task-title">Título</Label>
          <Input id="task-title" placeholder="Título da tarefa" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-desc">Descrição</Label>
          <Textarea id="task-desc" placeholder="Descreva a tarefa..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-priority">Prioridade</Label>
            <Select id="task-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.entries(taskPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-status">Status</Label>
            <Select id="task-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(taskStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-due">Prazo</Label>
            <Input id="task-due" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-category">Categoria</Label>
            <Input id="task-category" placeholder="Ex: Fiscal" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-assigned">Responsável</Label>
          <Input id="task-assigned" placeholder="Nome do responsável" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
