import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { request } from '@/lib/api'
import { Sparkles, Send, X, FileText, Scale, BookOpen, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const typeIcons = {
  article: FileText,
  legislation: Scale,
  book: BookOpen,
  faq: HelpCircle,
}

/**
 * Assistente de IA da Base de Conhecimento.
 * Chat flutuante que responde perguntas com base no conteúdo da KB.
 */
export default function ConhecimentoAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleAsk = async (e) => {
    e?.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    const userMsg = { role: 'user', text: question }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await request('/knowledge-base/ask', {
        method: 'POST',
        body: JSON.stringify({ question }),
      })
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: res.answer,
        sources: res.sources || [],
      }])
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: `Erro: ${err.message}`,
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">Assistente IA</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[28rem] w-[24rem] max-w-[calc(100vw-3rem)] flex-col rounded-xl border border-border bg-background shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Assistente de IA</p>
            <p className="text-xs text-muted-foreground">Base de Conhecimento</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <Sparkles className="mb-2 h-8 w-8 text-primary/50" />
            <p>Faça uma pergunta sobre legislação,</p>
            <p>normas contábeis ou artigos da base.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
            )}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 border-t border-border/50 pt-2">
                  {msg.sources.map((s, j) => {
                    const Icon = typeIcons[s.type] || FileText
                    return (
                      <Badge key={j} variant="outline" className="text-xs">
                        <Icon className="mr-1 h-3 w-3" /> {s.title?.substring(0, 30)}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted px-3 py-2">
              <Spinner />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre a base de conhecimento..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
