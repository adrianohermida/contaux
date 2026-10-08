import { useState } from 'react'
import { Copy, Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SAFE_ROUTES } from './fixtures'

function FixtureChecklist({ data }) {
  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <p className="text-sm font-semibold">{data.title}</p>
      <div className="text-xs text-muted-foreground">
        <p>Empresa: {data.company}</p>
        <p>Competência: {data.period}</p>
      </div>
      <ul className="space-y-1">
        {data.items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="h-4 w-4 shrink-0 rounded border border-border" />
            <span>{item.label}</span>
            <span className="ml-auto text-xs text-muted-foreground">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FixtureConciliation({ data }) {
  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <p className="text-sm font-semibold">{data.title}</p>
      <p className="text-sm text-muted-foreground">{data.explanation}</p>
      <div className="space-y-1">
        {data.values.map((v, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{v.label}</span>
            <span className="font-medium">{v.value}</span>
          </div>
        ))}
      </div>
      <div className="rounded bg-muted p-2 text-xs font-mono">{data.formula}</div>
      <p className="text-xs italic text-muted-foreground">{data.note}</p>
    </div>
  )
}

function FixtureDraft({ data }) {
  const [body, setBody] = useState(data.body)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <p className="text-sm font-semibold">{data.title}</p>
      <div className="text-xs text-muted-foreground">
        <p>Para: {data.recipient}</p>
        <p>Assunto: {data.subject}</p>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        className="w-full resize-none rounded border border-border bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado!' : 'Copiar texto'}
        </button>
        <span className="text-xs text-muted-foreground">{data.note}</span>
      </div>
    </div>
  )
}

function SafeNavButton({ routeKey, onNavigate }) {
  const route = SAFE_ROUTES[routeKey]
  if (!route) return null
  return (
    <button
      onClick={() => onNavigate(route.path)}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent"
    >
      {route.label}
      <ArrowRight className="h-3 w-3" />
    </button>
  )
}

export default function AssistantMessages({ messages, onNavigate }) {
  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
          {msg.role === 'user' ? (
            <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              {msg.text}
            </div>
          ) : (
            <div className="w-full max-w-[90%] space-y-2">
              <span className="text-xs font-medium text-warning">Demonstração</span>
              {msg.text && (
                <div className="rounded-lg bg-muted px-3 py-2 text-sm">{msg.text}</div>
              )}
              {msg.fixture?.kind === 'checklist' && <FixtureChecklist data={msg.fixture} />}
              {msg.fixture?.kind === 'conciliation' && <FixtureConciliation data={msg.fixture} />}
              {msg.fixture?.kind === 'draft' && <FixtureDraft data={msg.fixture} />}
              {msg.fixture && <SafeNavButton routeKey={msg.fixture.kind} onNavigate={onNavigate} />}
            </div>
          )}
        </div>
      ))}
    </>
  )
}
