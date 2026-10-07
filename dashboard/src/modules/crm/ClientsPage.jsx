import { useState } from 'react'
import ClientList from './ClientList'
import ClientForm from './ClientForm'
import ClientDetail from './ClientDetail'
import { mockClients, mockContacts, mockNotes, mockActivities } from './lib/mockData'

export default function ClientsPage() {
  const [clients, setClients] = useState(mockClients)
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

  const handleSave = (data) => {
    if (editing) {
      setClients((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data, updated: new Date().toISOString().slice(0, 10) } : c)))
    } else {
      const newClient = {
        ...data,
        id: String(Date.now()),
        created: new Date().toISOString().slice(0, 10),
        updated: new Date().toISOString().slice(0, 10),
      }
      setClients((prev) => [newClient, ...prev])
    }
    setFormOpen(false)
  }

  const viewing = viewingId ? clients.find((c) => c.id === viewingId) : null

  if (viewing) {
    return (
      <ClientDetail
        client={viewing}
        contacts={mockContacts}
        notes={mockNotes}
        activities={mockActivities}
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
