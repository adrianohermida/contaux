import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Trash2, FileText, Scale, BookOpen, HelpCircle, Lock, Globe, Download, ExternalLink } from 'lucide-react'

const typeConfig = {
  article:     { icon: FileText,   label: 'Artigo' },
  legislation: { icon: Scale,      label: 'Legislação' },
  book:        { icon: BookOpen,   label: 'Livro/PDF' },
  faq:         { icon: HelpCircle, label: 'FAQ' },
}

export default function ConhecimentoDetail({ item, onBack, onEdit, onDelete }) {
  const cfg = typeConfig[item.type] || typeConfig.article
  const Icon = cfg.icon
  const hasFile = item.file_url && item.file_name

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-5 w-5 text-primary" />
            <Badge variant="outline">{cfg.label}</Badge>
            {item.visibility === 'public' ? (
              <Badge variant="secondary"><Globe className="h-3 w-3 mr-1" /> Público</Badge>
            ) : (
              <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Privado</Badge>
            )}
            {item.status === 'draft' && <Badge variant="outline">Rascunho</Badge>}
          </div>

          <h1 className="text-2xl font-bold mb-2">{item.title}</h1>

          {item.summary && (
            <p className="text-muted-foreground mb-4">{item.summary}</p>
          )}

          {(item.tags || []).length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {item.author && <span><strong className="text-foreground">Autor:</strong> {item.author}</span>}
            {item.source && <span><strong className="text-foreground">Fonte:</strong> {item.source}</span>}
          </div>

          {/* PDF viewer / download */}
          {hasFile && (
            <div className="mb-4 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{item.file_name}</span>
                </div>
                <div className="flex gap-2">
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" /> Visualizar
                    </Button>
                  </a>
                  <a href={item.file_url} download={item.file_name}>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" /> Baixar
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo textual */}
          {item.content && (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{item.content}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
