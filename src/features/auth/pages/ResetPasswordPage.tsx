import { authAssets } from '../assets'
import { AuthShell } from '../components/AuthShell'
import { ResetPasswordCard } from '../components/ResetPasswordCard'

export function ResetPasswordPage() {
  return (
    <AuthShell
      copy={{
        title: 'Segurança em primeiro lugar.',
        description:
          'Proteja o ambiente clínico com uma credencial robusta. Nossa arquitetura garante a integridade e privacidade dos dados dos pacientes.',
      }}
      dataNodeId="327:3170"
      image={authAssets.resetBg}
      rightSurface="clay"
      showAdminBadge
      variant="illustrated"
    >
      <ResetPasswordCard />
    </AuthShell>
  )
}
