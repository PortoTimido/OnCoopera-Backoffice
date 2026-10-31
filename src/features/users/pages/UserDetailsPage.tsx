import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatPhoneNumber } from '../../../lib/formatters'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { getBackofficeUsuario } from '../../backoffice/api/backofficeApi'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { BackofficeDirectoryHeader } from '../../backoffice/components/BackofficeDirectoryHeader'
import {
  ReadOnlyField,
  ReadOnlyFields,
  ReadOnlySection,
} from '../../backoffice/components/ReadOnlyDetails'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { permissionsLabel } from '../model/administrator'

const statusLabels = { ATIVO: 'Ativo', INATIVO: 'Inativo', BLOQUEADO: 'Bloqueado' }

function formatDate(value: string | null, fallback = 'Não informado') {
  return value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
    : fallback
}

export function UserDetailsPage() {
  const { userId } = useParams()
  const [administrator, setAdministrator] = useState<AuthenticatedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    let active = true
    void getBackofficeUsuario(userId)
      .then(({ usuario }) => {
        if (!active) return
        if (usuario.tipo !== 'ADMINISTRADOR') {
          setError('Este cadastro não é um administrador.')
          return
        }
        setAdministrator(usuario)
      })
      .catch((loadError) => active && setError(getApiErrorMessage(loadError)))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [userId])

  return (
    <AppLayout activeItem="Usuários" user={getStoredUser()}>
      <main className="min-h-0 flex-1 overflow-auto bg-admin-canvas p-6 sm:p-10 lg:p-12">
        <div className="mx-auto grid w-full max-w-5xl gap-6">
          <BackofficeDirectoryHeader
            backTo="/usuarios"
            currentPage="Consultar usuário"
            directory="Usuários"
          />
          {isLoading ? (
            <p className="rounded-3xl bg-white p-8 text-sm text-muted">Carregando usuário...</p>
          ) : null}
          {error ? <p className="rounded-3xl bg-white p-8 text-sm text-red-700">{error}</p> : null}
          {administrator ? (
            <>
              <ReadOnlySection title="Dados pessoais">
                <ReadOnlyFields>
                  <ReadOnlyField label="Nome completo" value={administrator.nome} />
                  <ReadOnlyField label="E-mail profissional" value={administrator.email} />
                  <ReadOnlyField
                    label="Telefone"
                    value={formatPhoneNumber(administrator.telefone)}
                  />
                  <ReadOnlyField
                    label="Data de nascimento"
                    value={formatDate(administrator.dataNascimento)}
                  />
                </ReadOnlyFields>
              </ReadOnlySection>
              <ReadOnlySection title="Acesso administrativo">
                <ReadOnlyFields>
                  <ReadOnlyField label="Login" value={administrator.login} />
                  <ReadOnlyField label="Status" value={statusLabels[administrator.status]} />
                  <ReadOnlyField
                    label="Permissões"
                    value={permissionsLabel(
                      administrator.permissoesAdministrativas,
                      administrator.perfisAdministrativos,
                    )}
                  />
                  <ReadOnlyField
                    label="Último acesso"
                    value={formatDate(administrator.ultimoAcesso, 'Nunca acessou')}
                  />
                </ReadOnlyFields>
              </ReadOnlySection>
            </>
          ) : null}
        </div>
      </main>
    </AppLayout>
  )
}
