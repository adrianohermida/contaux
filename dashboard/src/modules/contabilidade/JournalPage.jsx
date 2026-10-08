import { useState } from 'react'
import JournalList from './JournalList'
import JournalForm from './JournalForm'
import { useCollection } from '@/hooks/useCollection'

export default function JournalPage() {
  const { items: entries, create, update, loading } = useCollection('journal_entries')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (entry) => { setEditing(entry); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create({ ...data, status: 'draft' })
    }
    setFormOpen(false)
  }

  const handlePost = async (id) => {
    await update(id, { status: 'posted' })
  }

  const handleCancel = async (id) => {
    await update(id, { status: 'cancelled' })
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Lançamentos Contábeis</h1>
        <p className="text-sm text-muted-foreground">Registros de partidas dobradas (débito = crédito)</p>
      </div>
      <JournalList entries={entries} loading={loading} onNew={handleNew} onEdit={handleEdit} onPost={handlePost} onCancel={handleCancel} />
      <JournalForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingEntry={editing} />
    </>
  )
}
