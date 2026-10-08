import ContactList from './ContactList'
import { useCollection } from '@/hooks/useCollection'

export default function ContactsPage() {
  const { items: contacts, loading } = useCollection('contacts')
  const { items: clients } = useCollection('clients')

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Contatos vinculados aos clientes do CRM</p>
      </div>
      <ContactList contacts={contacts} clients={clients} loading={loading} />
    </>
  )
}
