import { useRef, useEffect, useCallback } from 'react'
import { Bold, Italic, List, ListOrdered, Heading, Underline } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Editor de texto rico simples com toolbar (negrito, itálico, sublinhado, título, listas).
 * Usa contentEditable + document.execCommand — sem dependências externas.
 * O valor é armazenado como HTML.
 */
export function RichTextEditor({ value, onChange, placeholder, rows = 8, className }) {
  const ref = useRef(null)

  // Sincroniza o HTML externo para o contentEditable (sem sobrescrever o cursor durante digitação)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  const exec = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val)
    ref.current?.focus()
    onChange?.(ref.current?.innerHTML || '')
  }, [onChange])

  const handleInput = () => {
    onChange?.(ref.current?.innerHTML || '')
  }

  const toolbarBtn = (onClick, Icon, label) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  return (
    <div className={cn('rounded-md border border-border', className)}>
      <div className="flex flex-wrap gap-0.5 border-b border-border p-1">
        {toolbarBtn(() => exec('bold'), Bold, 'Negrito')}
        {toolbarBtn(() => exec('italic'), Italic, 'Itálico')}
        {toolbarBtn(() => exec('underline'), Underline, 'Sublinhado')}
        {toolbarBtn(() => exec('formatBlock', '<h3>'), Heading, 'Título')}
        {toolbarBtn(() => exec('insertUnorderedList'), List, 'Lista')}
        {toolbarBtn(() => exec('insertOrderedList'), ListOrdered, 'Lista numerada')}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="prose prose-sm dark:prose-invert max-w-none p-3 text-sm leading-relaxed focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        style={{ minHeight: `${rows * 1.5}rem` }}
      />
    </div>
  )
}

export default RichTextEditor
