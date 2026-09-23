import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { cx } from '../../../lib/cx'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { useToast } from '../../../components/ui/useToast'
import { resetPasswordWithRecoveryToken } from '../api/authApi'
import { authAssets } from '../assets'
import { AuthCard } from './AuthCard'
import { PasswordStrength, type PasswordCriterion } from './PasswordStrength'

type ResetPasswordCardProps = {
  mode?: 'interactive' | 'preview'
  resetToken?: string
  onSuccess?: () => void
}

export function ResetPasswordCard({ mode = 'interactive', resetToken, onSuccess }: ResetPasswordCardProps) {
  const isPreview = mode === 'preview'
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const criteria = useMemo<PasswordCriterion[]>(
    () => [
      { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
      { label: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(password) },
      { label: 'Pelo menos um número', met: /\d/.test(password) },
      { label: 'Caractere especial (!@#$%)', met: /[!@#$%]/.test(password) },
    ],
    [password],
  )

  const score = criteria.filter((criterion) => criterion.met).length

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isPreview) {
      return
    }

    if (score < criteria.length) {
      toast.alert('A senha ainda não atende todos os critérios de segurança.')
      return
    }

    if (password !== confirmPassword) {
      toast.alert('As senhas informadas não coincidem.')
      return
    }

    if (!resetToken) {
      toast.alert('Código de recuperação não encontrado. Solicite a recuperação de senha novamente.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordWithRecoveryToken({
        resetToken,
        newPassword: password,
        passwordConfirmation: confirmPassword,
      })
      onSuccess?.()
    } catch (resetError) {
      toast.error(getApiErrorMessage(resetError))
    } finally {
      setIsSubmitting(false)
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
            onRightIconClick={() => setIsPasswordVisible((current) => !current)}
            placeholder="Digite sua nova senha"
            rightIcon={isPasswordVisible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
            rightIconButtonLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            surface="mint"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
          />
          <TextField
            autoComplete="new-password"
            disabled={isPreview}
            label="Confirmar nova senha"
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            onRightIconClick={() => setIsConfirmPasswordVisible((current) => !current)}
            placeholder="Repita a senha"
            rightIcon={isConfirmPasswordVisible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
            rightIconButtonLabel={isConfirmPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            surface="mint"
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            value={confirmPassword}
          />
        </div>

        <PasswordStrength criteria={criteria} score={score} />

        <Button className="h-16 rounded-[20px]" disabled={isPreview || isSubmitting} icon={authAssets.arrowWhite} tone="dark" type="submit">
          {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthCard>
  )
}
