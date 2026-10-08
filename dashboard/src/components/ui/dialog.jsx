import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export function Dialog({ open, onClose, title, description, children, className }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const onEsc = (e) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', onEsc)
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg',
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
