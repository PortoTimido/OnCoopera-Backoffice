import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

type ConfirmationModalProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  isConfirming?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Modal reutilizável para ações destrutivas que exigem confirmação. */
export function ConfirmationModal({ isOpen, title, description, confirmLabel = 'Confirmar', isConfirming = false, onCancel, onConfirm }: ConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !isConfirming) onCancel() }
    document.addEventListener('keydown', handleKeyDown)
    cancelButtonRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isConfirming, isOpen, onCancel])

  if (!isOpen) return null

  return createPortal(
    <div aria-describedby="confirmation-modal-description" aria-labelledby="confirmation-modal-title" aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="dialog"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,0.35)] sm:p-8"><div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-700"><AlertTriangle aria-hidden="true" size={24} /></span><button aria-label="Fechar modal" className="grid h-9 w-9 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-mint disabled:opacity-50" disabled={isConfirming} onClick={onCancel} type="button"><X aria-hidden="true" size={20} /></button></div><h2 className="mt-5 font-display text-2xl text-admin-text" id="confirmation-modal-title">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-strong" id="confirmation-modal-description">{description}</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button ref={cancelButtonRef} className="h-11 rounded-xl border-2 border-line bg-white px-5 text-sm font-bold text-admin-text transition hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint disabled:opacity-60" disabled={isConfirming} onClick={onCancel} type="button">Cancelar</button><button className="h-11 rounded-xl bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint disabled:cursor-wait disabled:opacity-60" disabled={isConfirming} onClick={onConfirm} type="button">{isConfirming ? 'Confirmando...' : confirmLabel}</button></div></div></div>,
    document.body,
  )
}
