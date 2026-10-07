import { useState } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'

export default function ComposeForm({ open, onClose, onSend, replyTo }) {
  const [to, setTo] = useState(replyTo?.to || '')
  const [subject, setSubject] = useState(replyTo?.subject ? `Re: ${replyTo.subject}` : '')
  const [body, setBody] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!to || !subject) return
    onSend({ to, subject, text: body })
    setTo('')
    setSubject('')
    setBody('')
  }

  return (
    <Dialog open={open} onClose={onClose} title="Escrever Email" description="Enviar email via Cloudflare Worker">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="compose-to">Para</Label>
          <Input
            id="compose-to"
            type="email"
            placeholder="destinatario@email.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compose-subject">Assunto</Label>
          <Input
            id="compose-subject"
            placeholder="Assunto do email"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compose-body">Mensagem</Label>
          <Textarea
            id="compose-body"
            placeholder="Escreva sua mensagem..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Enviar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
