import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react'
import { cx } from '../../lib/cx'
import { ToastContext, type ToastVariant } from './useToast'

type ToastItem = {
  id: number
  variant: ToastVariant
  message: string
}

const TOAST_DURATION_MS = 5000

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; iconClassName: string; role: 'status' | 'alert' }> = {
  success: { icon: CheckCircle2, iconClassName: 'bg-brand-mint/20 text-brand-teal', role: 'status' },
  alert: { icon: AlertTriangle, iconClassName: 'bg-amber-100 text-amber-700', role: 'status' },
  error: { icon: XCircle, iconClassName: 'bg-red-100 text-red-700', role: 'alert' },
}

let toastIdCounter = 0

/** Provider global do Toast: monta o viewport de notificações e disponibiliza o hook `useToast` para toda a aplicação. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    const id = ++toastIdCounter
    setToasts((current) => [...current, { id, variant, message }])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { icon: Icon, iconClassName, role } = variantConfig[toast.variant]

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_0.2s_ease-out] items-start gap-3 rounded-2xl border-2 border-line bg-white p-4 shadow-clay-sage-sm"
      role={role}
    >
      <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl', iconClassName)}>
        <Icon aria-hidden="true" size={20} />
      </span>
      <p className="flex-1 pt-1.5 text-sm font-semibold text-admin-text">{toast.message}</p>
      <button
        aria-label="Fechar aviso"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-mint"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  )
}
