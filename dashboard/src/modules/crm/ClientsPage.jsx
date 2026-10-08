import { useState } from 'react'
import ClientList from './ClientList'
import ClientForm from './ClientForm'
import ClientDetail from './ClientDetail'
import { useCollection } from '@/hooks/useCollection'

export default function ClientsPage() {
  const { items: clients, create, update, loading } = useCollection('clients')
  const { items: contacts } = useCollection('contacts')
  const { items: notes } = useCollection('contact_notes')
  const { items: activities } = useCollection('contact_activities')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (client) => {
    setEditing(client)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, { ...data, updated: new Date().toISOString().slice(0, 10) })
    } else {
      await create({ ...data, created: new Date().toISOString().slice(0, 10), updated: new Date().toISOString().slice(0, 10) })
    }
    setFormOpen(false)
  }

  const viewing = viewingId ? clients.find((c) => String(c.id) === String(viewingId)) : null

  if (viewing) {
    const clientContacts = contacts.filter((c) => String(c.client_id) === String(viewingId))
    const contactIds = new Set(clientContacts.map((c) => String(c.id)))
    const clientNotes = notes.filter((n) => contactIds.has(String(n.contact_id)))
    const clientActivities = activities.filter((a) => contactIds.has(String(a.contact_id)))

    return (
      <ClientDetail
        client={viewing}
        contacts={clientContacts}
        notes={clientNotes}
        activities={clientActivities}
        onBack={() => setViewingId(null)}
        onEdit={() => handleEdit(viewing)}
      />
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Gestão de clientes e seus dados cadastrais</p>
      </div>
      <ClientList
        clients={clients}
        loading={loading}
        onNew={handleNew}
        onEdit={handleEdit}
        onView={(id) => setViewingId(id)}
      />
      <ClientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingClient={editing}
      />
    </>
  )
}
