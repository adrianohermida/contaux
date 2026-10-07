import { useState } from 'react'
import TicketList from './TicketList'
import TicketForm from './TicketForm'
import TicketDetail from './TicketDetail'
import { mockTickets } from './lib/mockData'

export default function TicketsPage() {
  const [tickets, setTickets] = useState(mockTickets)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (ticket) => { setEditing(ticket); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setTickets((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)))
    } else {
      setTickets((prev) => [{
        ...data, id: String(Date.now()), status: 'open', created_date: new Date().toISOString().slice(0, 10), messages: [],
      }, ...prev])
    }
    setFormOpen(false)
  }

  const handleAddMessage = (ticketId, message) => {
    setTickets((prev) => prev.map((t) =>
      t.id === ticketId ? { ...t, messages: [...t.messages, message] } : t,
    ))
  }

  const handleStatusChange = (ticketId, status) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)))
  }

  const viewing = viewingId ? tickets.find((t) => t.id === viewingId) : null

  if (viewing) {
    return (
      <TicketDetail
        ticket={viewing}
        onBack={() => setViewingId(null)}
        onEdit={() => handleEdit(viewing)}
        onAddMessage={(msg) => handleAddMessage(viewing.id, msg)}
        onStatusChange={(status) => handleStatusChange(viewing.id, status)}
      />
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Tickets de Suporte</h1>
        <p className="text-sm text-muted-foreground">Atendimento e gestão de chamados com SLA</p>
      </div>
      <TicketList tickets={tickets} onNew={handleNew} onEdit={handleEdit} onView={(id) => setViewingId(id)} />
      <TicketForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingTicket={editing} />
    </>
  )
}
