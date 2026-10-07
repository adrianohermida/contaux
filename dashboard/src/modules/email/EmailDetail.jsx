import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatFullDate, getInitials } from './lib/format'
import { Star, Trash2, Reply, ArrowLeft } from 'lucide-react'

export default function EmailDetail({ email, onBack, onReply, onDelete, onToggleStar }) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Selecione um email para visualizar
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{email.subject}</h2>
              <p className="text-sm text-muted-foreground">
                {email.folder === 'sent' ? 'Para: ' : 'De: '}
                {email.folder === 'sent' ? email.to : email.from}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onToggleStar} aria-label="Favoritar">
              <Star className={cn('h-4 w-4', email.starred && 'fill-primary text-primary')} />
            </Button>
            {email.folder === 'inbox' && (
              <Button variant="ghost" size="icon" onClick={onReply} aria-label="Responder">
                <Reply className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {getInitials(email.from)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatFullDate(email.receivedAt)}
          </div>
          {email.folder === 'sent' && <Badge variant="outline" className="text-xs">Enviado</Badge>}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {email.body}
        </div>
      </CardContent>
    </Card>
  )
}
