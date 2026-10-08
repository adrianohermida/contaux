import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Input, Textarea } from '@/components/ui/input'
import { ticketPriorityLabels, ticketPriorityVariants, ticketStatusLabels, ticketStatusVariants, slaHours } from './lib/mockData'
import { ArrowLeft, Pencil, Send, Clock } from 'lucide-react'

export default function TicketDetail({ ticket, onBack, onEdit, onAddMessage, onStatusChange }) {
  const [message, setMessage] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    onAddMessage({ sender: 'agent', content: message, date: new Date().toISOString() })
    setMessage('')
  }

  const slaDeadline = new Date(ticket.created_date + 'T00:00:00')
  slaDeadline.setHours(slaDeadline.getHours() + slaHours[ticket.priority])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground">{ticket.client_name}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-4 w-4" /> Editar</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={ticketPriorityVariants[ticket.priority]}>{ticketPriorityLabels[ticket.priority]}</Badge>
        <Badge variant={ticketStatusVariants[ticket.status]}>{ticketStatusLabels[ticket.status]}</Badge>
        {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
        {ticket.assigned_to && <span className="text-sm text-muted-foreground">Resp: {ticket.assigned_to}</span>}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> SLA: {slaDeadline.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Alterar status:</span>
        <Select value={ticket.status} onChange={(e) => onStatusChange(e.target.value)} className="w-40">
          {Object.entries(ticketStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conversa ({ticket.messages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ticket.messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.sender === 'agent'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}>
                <p>{msg.content}</p>
                <p className="mt-1 text-xs opacity-70">
                  {msg.sender === 'agent' ? 'Agente' : 'Cliente'} · {new Date(msg.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {ticket.messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">Nenhuma mensagem ainda.</p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input placeholder="Digite sua resposta..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type="submit"><Send className="h-4 w-4" /> Enviar</Button>
      </form>
    </div>
  )
}
