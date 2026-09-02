import { LinkButton } from '../../../components/ui/Button'
import { authAssets } from '../assets'
import { AuthShell } from '../components/AuthShell'
import { ResetPasswordCard } from '../components/ResetPasswordCard'

export function PasswordUpdatedPage() {
  return (
    <AuthShell
      copy={{
        title: 'Segurança em primeiro lugar.',
        description:
          'Proteja o ambiente clínico com uma credencial robusta. Nossa arquitetura garante a integridade e privacidade dos dados dos pacientes.',
      }}
      dataNodeId="327:3255"
      image={authAssets.successBg}
      rightSurface="clay"
      showAdminBadge
      variant="illustrated"
    >
      <div aria-hidden="true">
        <ResetPasswordCard mode="preview" />
      </div>

      <div className="fixed inset-0 z-20 grid place-items-center bg-[#1b1c19]/60 px-5 backdrop-blur-[2px]">
        <section
          aria-labelledby="password-updated-title"
          className="grid w-full max-w-[448px] justify-items-center rounded-2xl border border-line bg-surface-mint/80 p-[18px] text-center shadow-clay-sage-sm"
          role="dialog"
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-mint">
            <img className="h-6 w-6" src={authAssets.shield} alt="" aria-hidden="true" />
          </div>

          <div className="mt-4 max-w-[350px] space-y-2">
            <h2 className="font-serif text-2xl font-medium leading-[1.2] text-ink" id="password-updated-title">
              Senha atualizada
            </h2>
            <p className="text-sm leading-6 text-muted-strong">
              Sua credencial administrativa foi redefinida com sucesso e já está ativa.
            </p>
          </div>

          <LinkButton className="mt-6 max-w-[261px]" icon={authAssets.arrowTeal} to="/login" tone="soft">
            Ir para login
          </LinkButton>
        </section>
      </div>
    </AuthShell>
  )
}
