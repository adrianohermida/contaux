import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export function Dialog({ open, onClose, title, description, children, className }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'

    // Foca o dialog ao abrir para acessibilidade por teclado
    const previouslyFocused = document.activeElement
    dialogRef.current?.focus()

    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)

    // Focus trap: mantém o foco dentro do dialog
    const onTab = (e) => {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onTab)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onEsc)
      window.removeEventListener('keydown', onTab)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg outline-none',
          className,
        )}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export function DialogFooter({ children }) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      {children}
    </div>
  )
}

export { Button }
