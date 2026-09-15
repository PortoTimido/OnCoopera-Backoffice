import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { isPasswordChangeRequiredError, login } from '../api/authApi'
import { AuthCard } from '../components/AuthCard'
import { AuthShell } from '../components/AuthShell'
import { RequiredPasswordChangeModal } from '../components/RequiredPasswordChangeModal'
import { storeAuthSession } from '../model/authSession'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [remember, setRemember] = useState(true)
  const [status, setStatus] = useState(() =>
    searchParams.get('sessionExpired') === '1' ? 'Sua sessão expirou. Entre novamente para continuar.' : '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [temporaryPasswordChange, setTemporaryPasswordChange] = useState<{ identificador: string; senhaTemporaria: string } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const identificador = String(form.get('identificador') ?? '')
    const senha = String(form.get('senha') ?? '')

    try {
      const session = await login({
        identificador,
        senha,
      })

      storeAuthSession(session.accessToken, session.usuario)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (isPasswordChangeRequiredError(error)) {
        setTemporaryPasswordChange({ identificador, senhaTemporaria: senha })
      } else {
        setStatus(getApiErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleTemporaryPasswordChanged(newPassword: string) {
    if (!temporaryPasswordChange) {
      return
    }

    const session = await login({ identificador: temporaryPasswordChange.identificador, senha: newPassword })
    storeAuthSession(session.accessToken, session.usuario)
    navigate('/dashboard', { replace: true })
  }

  function handleTemporaryPasswordChangeClose() {
    setTemporaryPasswordChange(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthShell
      copy={{
        title: 'A gestão clínica, humanizada e eficiente.',
        description:
          'Acesse o painel central para gerenciar artigos, interações, usuários e monitorar o radar de suporte com precisão e empatia.',
      }}
      dataNodeId="327:3049"
      variant="login"
    >
      <AuthCard variant="login">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="mb-8 text-center">
            <h2 className="font-serif text-[32px] font-semibold leading-[1.2] text-ink">Bem-vindo</h2>
            <p className="mt-2 text-base leading-6 text-muted">Acesse sua conta para continuar.</p>
          </div>

          <TextField
            autoComplete="email"
            label="E-mail corporativo"
            leftIcon={<Mail size={20} strokeWidth={1.8} />}
            name="identificador"
            placeholder="Digite seu e-mail"
            required
            type="email"
          />

          <TextField
            autoComplete="current-password"
            label="Senha"
            leftIcon={<LockKeyhole size={20} strokeWidth={1.8} />}
            name="senha"
            onRightIconClick={() => setIsPasswordVisible((current) => !current)}
            placeholder="Digite sua senha"
            required
            rightIcon={isPasswordVisible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
            rightIconButtonLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            type={isPasswordVisible ? 'text' : 'password'}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
            <label className="inline-flex items-center gap-2.5 font-semibold text-muted">
              <input
                checked={remember}
                className="h-5 w-5 rounded border-line accent-brand-teal"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              <span>Manter conectado</span>
            </label>
            <Link className="font-bold text-brand-teal hover:underline" to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          </div>

          <Button className="h-15 rounded-3xl" disabled={isSubmitting} icon={<LogIn size={20} strokeWidth={2.2} />} type="submit">
            {isSubmitting ? 'Acessando...' : 'Acessar painel'}
          </Button>

          {status ? <p className="pt-1 text-center text-sm font-semibold text-red-700" role="alert">{status}</p> : null}
        </form>
      </AuthCard>
      {temporaryPasswordChange ? <RequiredPasswordChangeModal identifier={temporaryPasswordChange.identificador} mode="temporary" temporaryPassword={temporaryPasswordChange.senhaTemporaria} onClose={handleTemporaryPasswordChangeClose} onCompleted={handleTemporaryPasswordChanged} /> : null}
    </AuthShell>
  )
}
