import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Scale, BookOpen, HelpCircle, Lock, Globe, Pencil } from 'lucide-react'

const typeConfig = {
  article:     { icon: FileText,   label: 'Artigo',      color: 'text-blue-600' },
  legislation: { icon: Scale,      label: 'Legislação',  color: 'text-purple-600' },
  book:        { icon: BookOpen,   label: 'Livro/PDF',    color: 'text-amber-600' },
  faq:         { icon: HelpCircle, label: 'FAQ',         color: 'text-green-600' },
}

export default function ConhecimentoList({ items, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const cfg = typeConfig[item.type] || typeConfig.article
        const Icon = cfg.icon
        return (
          <Card
            key={item.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onSelect(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                  <Badge variant="outline">{cfg.label}</Badge>
                </div>
                {item.visibility === 'public' ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <h3 className="mt-2 font-medium leading-snug line-clamp-2">{item.title}</h3>
              {item.summary && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
              )}

              {(item.tags || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.author || '—'}</span>
                {item.status === 'draft' && <Badge variant="outline">Rascunho</Badge>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
