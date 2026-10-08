import { useState, useMemo } from 'react'
import EmailList from './EmailList'
import EmailDetail from './EmailDetail'
import ComposeForm from './ComposeForm'
import { useCollection } from '@/hooks/useCollection'
import { createApiClient } from '@/lib/api'

const inboxApi = createApiClient('inbox')

export default function InboxPage() {
  const { items: emails, update, remove, loading } = useCollection('emails')
  const [selectedId, setSelectedId] = useState(null)
  const [folder, setFolder] = useState('inbox')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyTo, setReplyTo] = useState(null)

  const folderEmails = useMemo(() => emails.filter((e) => e.folder === folder), [emails, folder])

  const selected = selectedId ? emails.find((e) => String(e.id) === String(selectedId)) : null

  const handleSelect = async (id) => {
    setSelectedId(id)
    // Marca como lido ao abrir
    const email = emails.find((e) => String(e.id) === String(id))
    if (email && !email.read) {
      await update(id, { read: true })
    }
  }

  const handleToggleStar = async () => {
    if (!selected) return
    await update(selected.id, { starred: !selected.starred })
  }

  const handleDelete = async () => {
    if (!selected) return
    await remove(selected.id)
    setSelectedId(null)
  }

  const handleReply = () => {
    if (!selected) return
    setReplyTo({ to: selected.from, subject: selected.subject })
    setComposeOpen(true)
  }

  const handleSend = async ({ to, subject, text }) => {
    try {
      await inboxApi.create({ to, subject, text })
    } catch {
      // Fallback: cria registro local via emails CRUD
      await update(Date.now(), {
        from: 'contato@contaux.com.br',
        to,
        subject,
        body: text,
        read: true,
        starred: false,
        folder: 'sent',
      })
    }
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
          emails={folderEmails}
          loading={loading}
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
