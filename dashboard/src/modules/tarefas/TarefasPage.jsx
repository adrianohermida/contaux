import { useState } from 'react'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import { useCollection } from '@/hooks/useCollection'

export default function TarefasPage() {
  const { items: tasks, create, update, remove, loading } = useCollection('tasks')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (task) => { setEditing(task); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create({ ...data, created: new Date().toISOString().slice(0, 10) })
    }
    setFormOpen(false)
  }

  const handleToggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await update(task.id, { status: newStatus })
  }

  const handleDelete = async (id) => {
    if (confirm('Excluir esta tarefa?')) await remove(id)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <p className="text-sm text-muted-foreground">Lista de tarefas e atividades da equipe</p>
      </div>
      <TaskList
        tasks={tasks}
        loading={loading}
        onNew={handleNew}
        onEdit={handleEdit}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
      />
      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingTask={editing} />
    </>
  )
}
