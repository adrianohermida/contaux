import { useState } from 'react'
import ProcessList from './ProcessList'
import ProcessForm from './ProcessForm'
import { mockProcesses } from './lib/mockData'

export default function ProcessosPage() {
  const [processes, setProcesses] = useState(mockProcesses)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (proc) => { setEditing(proc); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setProcesses((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)))
    } else {
      setProcesses((prev) => [{ ...data, id: String(Date.now()), status: 'active' }, ...prev])
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Processos Jurídicos</h1>
        <p className="text-sm text-muted-foreground">Gestão de processos e acompanhamento de prazos</p>
      </div>
      <ProcessList processes={processes} onNew={handleNew} onEdit={handleEdit} />
      <ProcessForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingProcess={editing} />
    </>
  )
}
