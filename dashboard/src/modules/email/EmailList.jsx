import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatEmailDate, getInitials } from './lib/format'
import { Search, Star, Mail, MailOpen, Plus, Inbox, Send } from 'lucide-react'

export default function EmailList({ emails, loading, selectedId, onSelect, onCompose, folder, onFolderChange }) {
  const [search, setSearch] = useState('')
  const [starredOnly, setStarredOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = [...emails]

    if (folder === 'inbox') result = result.filter((e) => e.folder === 'inbox')
    else if (folder === 'sent') result = result.filter((e) => e.folder === 'sent')
    else if (folder === 'starred') result = result.filter((e) => e.starred)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) =>
        e.subject.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q),
      )
    }

    if (starredOnly) result = result.filter((e) => e.starred)

    return result
  }, [emails, folder, search, starredOnly])

  const unreadCount = emails.filter((e) => e.folder === 'inbox' && !e.read).length

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Sidebar de pastas */}
      <div className="lg:w-48 shrink-0 space-y-1">
        <Button onClick={onCompose} className="w-full mb-3">
          <Plus className="h-4 w-4" /> Escrever
        </Button>
        <FolderButton
          icon={Inbox}
          label="Caixa de Entrada"
          count={unreadCount}
          active={folder === 'inbox'}
          onClick={() => onFolderChange('inbox')}
        />
        <FolderButton
          icon={Send}
          label="Enviados"
          active={folder === 'sent'}
          onClick={() => onFolderChange('sent')}
        />
        <FolderButton
          icon={Star}
          label="Favoritos"
          active={folder === 'starred'}
          onClick={() => onFolderChange('starred')}
        />
      </div>

      {/* Lista de emails */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={starredOnly ? 'default' : 'outline'}
            size="icon"
            onClick={() => setStarredOnly((v) => !v)}
            aria-label="Filtrar favoritos"
          >
            <Star className={cn('h-4 w-4', starredOnly && 'fill-current')} />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {filtered.map((email) => (
                <button
                  key={email.id}
                  onClick={() => onSelect(email.id)}
                  className={cn(
                    'flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/30',
                    selectedId === email.id && 'bg-primary/5',
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(email.from)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-sm truncate', !email.read && 'font-semibold')}>
                        {email.from}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatEmailDate(email.received_at)}
                      </span>
                    </div>
                    <p className={cn('text-sm truncate', !email.read && 'font-medium')}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{email.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {email.starred && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                    {!email.read && email.folder === 'inbox' && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
              {loading && filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Carregando emails...
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum email encontrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FolderButton({ icon: Icon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && (
        <Badge variant="default" className="text-xs">{count}</Badge>
      )}
    </button>
  )
}
