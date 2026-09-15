import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authAssets } from '../assets'
import { AuthShell } from '../components/AuthShell'
import { ResetPasswordCard } from '../components/ResetPasswordCard'

type LocationState = { resetToken?: string } | null

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const resetToken = (location.state as LocationState)?.resetToken

  if (!resetToken) {
    return <Navigate to="/recuperar-senha" replace />
  }

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
      <ResetPasswordCard resetToken={resetToken} onSuccess={() => navigate('/senha-atualizada', { replace: true })} />
    </AuthShell>
  )
}
