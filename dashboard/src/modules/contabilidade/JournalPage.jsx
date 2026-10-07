import { useState } from 'react'
import JournalList from './JournalList'
import JournalForm from './JournalForm'
import { mockEntries } from './lib/mockData'

export default function JournalPage() {
  const [entries, setEntries] = useState(mockEntries)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (entry) => { setEditing(entry); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setEntries((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...data } : e)))
    } else {
      setEntries((prev) => [{ ...data, id: String(Date.now()), status: 'draft' }, ...prev])
    }
    setFormOpen(false)
  }

  const handlePost = (id) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'posted' } : e)))
  }

  const handleCancel = (id) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'cancelled' } : e)))
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Lançamentos Contábeis</h1>
        <p className="text-sm text-muted-foreground">Registros de partidas dobradas (débito = crédito)</p>
      </div>
      <JournalList entries={entries} onNew={handleNew} onEdit={handleEdit} onPost={handlePost} onCancel={handleCancel} />
      <JournalForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingEntry={editing} />
    </>
  )
}
