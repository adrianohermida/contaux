import { useState } from 'react'
import ProcessList from './ProcessList'
import ProcessForm from './ProcessForm'
import { useCollection } from '@/hooks/useCollection'

export default function ProcessosPage() {
  const { items: processes, create, update, loading } = useCollection('processes')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (proc) => { setEditing(proc); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create({ ...data, status: 'active' })
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Processos Jurídicos</h1>
        <p className="text-sm text-muted-foreground">Gestão de processos e acompanhamento de prazos</p>
      </div>
      <ProcessList processes={processes} loading={loading} onNew={handleNew} onEdit={handleEdit} />
      <ProcessForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingProcess={editing} />
    </>
  )
}
