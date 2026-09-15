import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { requestPasswordRecovery } from '../api/authApi'
import { authAssets } from '../assets'
import { AuthCard } from '../components/AuthCard'
import { AuthShell } from '../components/AuthShell'

export function RecoverPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await requestPasswordRecovery({ email })
      navigate('/recuperar-senha/codigo', { state: { email } })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
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
            <h2 className="font-serif text-[32px] font-semibold leading-[1.2] text-ink-strong">Recuperar acesso</h2>
            <p className="text-base leading-6 text-muted-strong">
              Informe seu e-mail corporativo para receber o código de redefinição de senha.
            </p>
          </div>

          <TextField
            autoComplete="email"
            label="E-mail corporativo"
            leftIcon={authAssets.mail}
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Digite seu e-mail"
            required
            surface="white"
            type="email"
            value={email}
          />

          <div className="flex gap-3 rounded-2xl border border-security-blue/20 bg-security-blue/10 p-4 shadow-[2px_2px_0_rgba(110,181,255,0.15)]" role="status">
            <img className="mt-0.5 h-5 w-5 shrink-0" src={authAssets.mailBlue} alt="" aria-hidden="true" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[#275d97]">Enviaremos um código</strong>
              <p className="text-sm leading-5 text-[#275d97]">
                Se o e-mail estiver cadastrado, você receberá um código de 6 dígitos para redefinir sua senha.
              </p>
            </div>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}

          <Button disabled={isSubmitting} icon={authAssets.arrowDark} type="submit">
            {isSubmitting ? 'Enviando...' : 'Enviar código de recuperação'}
          </Button>

          <Link className="block text-center text-sm font-bold text-brand-teal hover:underline" to="/login">
            Voltar para login
          </Link>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
