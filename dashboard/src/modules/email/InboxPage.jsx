import { useState } from 'react'
import EmailList from './EmailList'
import EmailDetail from './EmailDetail'
import ComposeForm from './ComposeForm'
import { mockEmails } from './lib/mockData'

export default function InboxPage() {
  const [emails, setEmails] = useState(mockEmails)
  const [selectedId, setSelectedId] = useState(null)
  const [folder, setFolder] = useState('inbox')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyTo, setReplyTo] = useState(null)

  const selected = selectedId ? emails.find((e) => e.id === selectedId) : null

  const handleSelect = (id) => {
    setSelectedId(id)
    // Marca como lido ao abrir
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)))
  }

  const handleToggleStar = () => {
    if (!selected) return
    setEmails((prev) =>
      prev.map((e) => (e.id === selected.id ? { ...e, starred: !e.starred } : e)),
    )
  }

  const handleDelete = () => {
    if (!selected) return
    setEmails((prev) => prev.filter((e) => e.id !== selected.id))
    setSelectedId(null)
  }

  const handleReply = () => {
    if (!selected) return
    setReplyTo({ to: selected.from, subject: selected.subject })
    setComposeOpen(true)
  }

  const handleSend = ({ to, subject, text }) => {
    const newEmail = {
      id: String(Date.now()),
      from: 'contato@contaux.com.br',
      to,
      subject,
      body: text,
      receivedAt: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent',
    }
    setEmails((prev) => [newEmail, ...prev])
    setComposeOpen(false)
    setReplyTo(null)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Caixa de Entrada</h1>
        <p className="text-sm text-muted-foreground">
          Receber e enviar emails via Cloudflare Email Workers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmailList
          emails={emails}
          selectedId={selectedId}
          onSelect={handleSelect}
          onCompose={() => { setReplyTo(null); setComposeOpen(true) }}
          folder={folder}
          onFolderChange={setFolder}
        />
        <EmailDetail
          email={selected}
          onBack={() => setSelectedId(null)}
          onReply={handleReply}
          onDelete={handleDelete}
          onToggleStar={handleToggleStar}
        />
      </div>

      <ComposeForm
        open={composeOpen}
        onClose={() => { setComposeOpen(false); setReplyTo(null) }}
        onSend={handleSend}
        replyTo={replyTo}
      />
    </>
  )
}
