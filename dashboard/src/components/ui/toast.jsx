import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-success/20 bg-success/10 text-success',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
  info: 'border-primary/20 bg-primary/10 text-primary',
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  return (
    <ToastContext.Provider value={{ toast, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6" role="region" aria-label="Notificações">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border px-4 py-3 shadow-md max-w-sm animate-toast-in',
                styles[t.type] || styles.info,
              )}
              role="alert"
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium text-foreground">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
