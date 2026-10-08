import { useState } from 'react'
import { CheckSquare, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

const PRIORITIES = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

/**
 * Formulário inline para propor e criar uma tarefa a partir do assistente.
 * A tarefa é vinculada à conversa ativa no backend (AC-GLOBAL-04).
 */
export default function TaskProposalForm({ onCreate, onClose }) {
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', category: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const task = await onCreate({
      title: form.title.trim(),
      priority: form.priority,
      due_date: form.due_date || null,
      category: form.category || null,
    })
    setSaving(false)
    if (task) {
      toast('Tarefa criada e vinculada à conversa', 'success')
      onClose()
    } else {
      toast('Erro ao criar tarefa', 'error')
    }
  }

  return (
    <div className="shrink-0 border-t border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <CheckSquare className="h-3.5 w-3.5 text-primary" />
          Propor tarefa
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Fechar formulário">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          placeholder="Título da tarefa..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
          className="h-8 text-sm"
        />
        <div className="flex gap-2">
          <Select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="h-8 text-sm flex-1"
          >
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="h-8 text-sm flex-1"
          />
        </div>
        <Input
          placeholder="Categoria (ex: Fiscal)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" disabled={saving || !form.title.trim()} className="w-full">
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Criando...' : 'Criar tarefa'}
        </Button>
      </form>
    </div>
  )
}
