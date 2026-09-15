import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, LockKeyhole, X } from 'lucide-react'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { changePassword, changeTemporaryPassword } from '../api/authApi'
import { PasswordStrength, type PasswordCriterion } from './PasswordStrength'

type RequiredPasswordChangeModalProps = {
  identifier?: string
  mode?: 'authenticated' | 'temporary'
  temporaryPassword?: string
  onClose: () => void
  onCompleted: (newPassword: string) => void | Promise<void>
}

export function RequiredPasswordChangeModal({ identifier, mode = 'authenticated', temporaryPassword, onClose, onCompleted }: RequiredPasswordChangeModalProps) {
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    currentPasswordRef.current?.focus()
  }, [])

  const criteria = useMemo<PasswordCriterion[]>(() => [
    { label: 'Mínimo de 6 caracteres', met: newPassword.length >= 6 },
    { label: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(newPassword) },
    { label: 'Pelo menos uma letra minúscula', met: /[a-z]/.test(newPassword) },
    { label: 'Pelo menos um número', met: /\d/.test(newPassword) },
    { label: 'Caractere especial (!@#$%)', met: /[!@#$%]/.test(newPassword) },
  ], [newPassword])
  const score = criteria.filter((criterion) => criterion.met).length

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (score < criteria.length) {
      setError('A nova senha ainda não atende todos os critérios de segurança.')
      return
    }

    if (newPassword !== confirmation) {
      setError('As senhas informadas não coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'temporary') {
        if (!identifier || !temporaryPassword) {
          setError('Não foi possível identificar a conta para trocar a senha temporária.')
          return
        }
        await changeTemporaryPassword({ identificador: identifier, senhaTemporaria: temporaryPassword, novaSenha: newPassword })
      } else {
        await changePassword({ senhaAtual: currentPassword, novaSenha: newPassword })
      }
      await onCompleted(newPassword)
    } catch (changePasswordError) {
      setError(getApiErrorMessage(changePasswordError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div aria-describedby="required-password-change-description" aria-labelledby="required-password-change-title" aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" role="dialog">
      <section className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,0.35)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-mint/30 text-brand-teal">
            <KeyRound aria-hidden="true" size={24} />
          </div>
          <button aria-label="Fechar e voltar ao login" className="grid h-9 w-9 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-mint disabled:opacity-50" disabled={isSubmitting} onClick={onClose} type="button"><X aria-hidden="true" size={20} /></button>
        </div>
        <h2 className="mt-5 font-display text-2xl text-admin-text" id="required-password-change-title">Atualize sua senha</h2>
        <p className="mt-2 text-sm leading-6 text-muted-strong" id="required-password-change-description">Por segurança, você precisa criar uma nova senha antes de continuar usando o sistema.</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-bold text-admin-text">
            {mode === 'temporary' ? 'Senha temporária' : 'Senha atual'}
            <span className="relative"><LockKeyhole aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} /><input ref={currentPasswordRef} autoComplete="current-password" className="h-11 w-full rounded-xl border-2 border-line bg-surface-soft px-4 pl-11 text-sm font-normal outline-none focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => setCurrentPassword(event.target.value)} required type="password" value={currentPassword} /></span>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-admin-text">
            Nova senha
            <input autoComplete="new-password" className="h-11 w-full rounded-xl border-2 border-line bg-surface-soft px-4 text-sm font-normal outline-none focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-admin-text">
            Confirmar nova senha
            <input autoComplete="new-password" className="h-11 w-full rounded-xl border-2 border-line bg-surface-soft px-4 text-sm font-normal outline-none focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
          </label>
          <PasswordStrength criteria={criteria} score={score} />
          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
          <button className="mt-2 h-11 rounded-xl bg-brand-teal px-5 text-sm font-bold text-white transition hover:bg-brand-teal/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </section>
    </div>
  )
}
