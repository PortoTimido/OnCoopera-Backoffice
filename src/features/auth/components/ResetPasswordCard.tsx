import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { cx } from '../../../lib/cx'
import { authAssets } from '../assets'
import { authContract } from '../model/authContract'
import { AuthCard } from './AuthCard'
import { PasswordStrength, type PasswordCriterion } from './PasswordStrength'

type ResetPasswordCardProps = {
  mode?: 'interactive' | 'preview'
}

export function ResetPasswordCard({ mode = 'interactive' }: ResetPasswordCardProps) {
  const isPreview = mode === 'preview'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const criteria = useMemo<PasswordCriterion[]>(() => {
    const liveCriteria = [
      { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
      { label: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(password) },
      { label: 'Pelo menos um número', met: /\d/.test(password) },
      { label: 'Caractere especial (!@#$%)', met: /[!@#$%]/.test(password) },
    ]

    if (password) {
      return liveCriteria
    }

    return liveCriteria.map((criterion, index) => ({ ...criterion, met: index < 2 }))
  }, [password])

  const liveCriteriaCount = useMemo(() => {
    return [
      password.length >= 8,
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%]/.test(password),
    ].filter(Boolean).length
  }, [password])

  const displayedScore = password ? liveCriteriaCount : 2

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isPreview) {
      return
    }

    if (liveCriteriaCount < 4) {
      setError('A senha ainda não atende todos os critérios de segurança.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas informadas não coincidem.')
      return
    }

    if (!authContract.hasPasswordReset) {
      setError('O contrato atual da API ainda não expõe um endpoint de redefinição de senha por link.')
    }
  }

  return (
    <AuthCard className={cx('space-y-8', isPreview && 'pointer-events-none select-none')} variant="reset">
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid justify-items-center gap-4 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-surface-soft shadow-input-inset">
            <img className="h-8 w-8" src={authAssets.resetIcon} alt="" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-[32px] font-semibold leading-[1.2] text-ink">Redefinir Senha</h2>
            <p className="mx-auto max-w-[342px] text-sm leading-6 text-muted-strong">
              Crie uma nova senha de acesso forte e exclusiva para sua conta.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <TextField
            autoComplete="new-password"
            disabled={isPreview}
            label="Nova senha"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua nova senha"
            rightIcon={authAssets.eyeOff}
            surface="mint"
            type="password"
            value={password}
          />
          <TextField
            autoComplete="new-password"
            disabled={isPreview}
            label="Confirmar nova senha"
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repita a senha"
            rightIcon={authAssets.eyeOff}
            surface="mint"
            type="password"
            value={confirmPassword}
          />
        </div>

        <PasswordStrength criteria={criteria} score={displayedScore} />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <Button className="h-16 rounded-[20px]" disabled={isPreview} icon={authAssets.arrowWhite} tone="dark" type="submit">
          Salvar nova senha
        </Button>
      </form>
    </AuthCard>
  )
}
