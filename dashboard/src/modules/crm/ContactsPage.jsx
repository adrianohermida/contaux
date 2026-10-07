import ContactList from './ContactList'
import { mockContacts, mockClients } from './lib/mockData'

export default function ContactsPage() {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Contatos vinculados aos clientes do CRM</p>
      </div>
      <ContactList contacts={mockContacts} clients={mockClients} />
    </>
  )
}
