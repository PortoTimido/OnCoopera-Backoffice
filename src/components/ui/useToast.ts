import { createContext, useContext, useMemo } from 'react'

export type ToastVariant = 'success' | 'alert' | 'error'

export type ToastContextValue = {
  showToast: (variant: ToastVariant, message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

/** Hook para disparar toasts globais de sucesso, aviso ou erro. Deve ser usado dentro de um `ToastProvider`. */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast deve ser usado dentro de um ToastProvider')

  const { showToast } = context
  return useMemo(() => ({
    success: (message: string) => showToast('success', message),
    alert: (message: string) => showToast('alert', message),
    error: (message: string) => showToast('error', message),
  }), [showToast])
}
