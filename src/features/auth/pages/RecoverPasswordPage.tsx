import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { authAssets } from '../assets'
import { AuthCard } from '../components/AuthCard'
import { AuthShell } from '../components/AuthShell'
import { authContract } from '../model/authContract'

export function RecoverPasswordPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
              Informe seu e-mail corporativo para receber as instruções de redefinição de senha.
            </p>
          </div>

          <TextField
            autoComplete="email"
            defaultValue="admin@oncoopera.com.br"
            label="E-mail corporativo"
            leftIcon={authAssets.mail}
            name="email"
            required
            surface="white"
            type="email"
          />

          <div className="flex gap-3 rounded-2xl border border-security-blue/20 bg-security-blue/10 p-4 shadow-[2px_2px_0_rgba(110,181,255,0.15)]" role="status">
            <img className="mt-0.5 h-5 w-5 shrink-0" src={authAssets.mailBlue} alt="" aria-hidden="true" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[#275d97]">
                {authContract.hasPasswordRecovery ? 'E-mail enviado' : 'Recuperação indisponível'}
              </strong>
              <p className="text-sm leading-5 text-[#275d97]">
                {authContract.hasPasswordRecovery
                  ? 'Verifique sua caixa de entrada. O link expira em 30 minutos.'
                  : 'O contrato atual da API ainda não expõe um endpoint para envio de link de recuperação.'}
              </p>
            </div>
          </div>

          <Button disabled={!authContract.hasPasswordRecovery} icon={authAssets.arrowDark} type="submit">
            Enviar link de recuperação
          </Button>

          <Link className="block text-center text-sm font-bold text-brand-teal hover:underline" to="/login">
            Voltar para login
          </Link>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
