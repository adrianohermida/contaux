import { useState } from 'react'
import TicketList from './TicketList'
import TicketForm from './TicketForm'
import TicketDetail from './TicketDetail'
import { useCollection } from '@/hooks/useCollection'

export default function TicketsPage() {
  const { items: tickets, create, update, loading } = useCollection('tickets')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (ticket) => { setEditing(ticket); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create({
        ...data, status: 'open',
        created_date: new Date().toISOString().slice(0, 10),
        messages: [],
      })
    }
    setFormOpen(false)
  }

  const handleAddMessage = async (ticketId, message) => {
    const ticket = tickets.find((t) => String(t.id) === String(ticketId))
    if (ticket) {
      await update(ticketId, { messages: [...(ticket.messages || []), message] })
    }
  }

  const handleStatusChange = async (ticketId, status) => {
    await update(ticketId, { status })
  }

  const viewing = viewingId ? tickets.find((t) => String(t.id) === String(viewingId)) : null

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
      <TicketList tickets={tickets} loading={loading} onNew={handleNew} onEdit={handleEdit} onView={(id) => setViewingId(id)} />
      <TicketForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingTicket={editing} />
    </>
  )
}
