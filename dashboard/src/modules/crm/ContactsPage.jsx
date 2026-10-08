import { useState } from 'react'
import ContactList from './ContactList'
import ContactForm from './ContactForm'
import { useCollection } from '@/hooks/useCollection'

export default function ContactsPage() {
  const { items: contacts, create, update, loading } = useCollection('contacts')
  const { items: clients } = useCollection('clients')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (contact) => { setEditing(contact); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create(data)
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Contatos vinculados aos clientes do CRM</p>
      </div>
      <ContactList
        contacts={contacts}
        clients={clients}
        loading={loading}
        onNew={handleNew}
        onEdit={handleEdit}
      />
      <ContactForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingContact={editing}
        clients={clients}
      />
    </>
  )
}
