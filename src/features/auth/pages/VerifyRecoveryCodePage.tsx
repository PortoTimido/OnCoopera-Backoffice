import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { useToast } from '../../../components/ui/useToast'
import { requestPasswordRecovery, verifyPasswordRecoveryCode } from '../api/authApi'
import { authAssets } from '../assets'
import { AuthCard } from '../components/AuthCard'
import { AuthShell } from '../components/AuthShell'

type LocationState = { email?: string } | null

export function VerifyRecoveryCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as LocationState)?.email ?? ''
  const toast = useToast()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  if (!email) {
    return <Navigate to="/recuperar-senha" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { resetToken } = await verifyPasswordRecoveryCode({ email, code })
      navigate('/redefinir-senha', { state: { resetToken } })
    } catch (verifyError) {
      toast.error(getApiErrorMessage(verifyError))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    setIsResending(true)

    try {
      await requestPasswordRecovery({ email })
      toast.success('Se o e-mail estiver cadastrado, um novo código foi enviado.')
    } catch (resendError) {
      toast.error(getApiErrorMessage(resendError))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell
      copy={{
        title: 'Gestão clínica com precisão e cuidado.',
        description:
          'Plataforma administrativa para profissionais de saúde. Acesso seguro e centralizado para a coordenação do bem-estar.',
      }}
      dataNodeId="327:3115"
      image={authAssets.recoveryBg}
      imagePresentation="full"
      rightSurface="mint"
      sideSize="login"
      variant="illustrated"
    >
      <AuthCard className="space-y-8" variant="recovery">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="font-serif text-[32px] font-semibold leading-[1.2] text-ink-strong">Verificar código</h2>
            <p className="text-base leading-6 text-muted-strong">
              Digite o código de 6 dígitos enviado para <strong className="text-ink-strong">{email}</strong>.
            </p>
          </div>

          <TextField
            autoComplete="one-time-code"
            inputMode="numeric"
            label="Código de verificação"
            leftIcon={authAssets.lock}
            maxLength={6}
            name="code"
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            pattern="\d{6}"
            placeholder="000000"
            required
            surface="white"
            value={code}
          />

          <Button disabled={isSubmitting || code.length !== 6} icon={authAssets.arrowDark} type="submit">
            {isSubmitting ? 'Verificando...' : 'Verificar código'}
          </Button>

          <button
            className="block w-full text-center text-sm font-bold text-brand-teal hover:underline disabled:opacity-60"
            disabled={isResending}
            onClick={handleResend}
            type="button"
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </button>

          <Link className="block text-center text-sm font-bold text-muted-strong hover:underline" to="/recuperar-senha">
            Voltar
          </Link>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
