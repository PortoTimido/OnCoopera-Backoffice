import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../auth/api/authApi'
import { getStoredAccessToken, getStoredUser, storeAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import {
  deleteBackofficeAdministrator,
  listBackofficeUsuarios,
  updateBackofficeAdministrator,
} from '../../backoffice/api/backofficeApi'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { settingsAssets } from '../assets'
import { SettingsCard } from '../components/SettingsCard'
import { SettingsInput } from '../components/SettingsInput'

type AdminRow = {
  id?: string
  name: string
  avatar: string
}

const fallbackAdmins: AdminRow[] = [
  { name: 'Dr. James Wilson', avatar: settingsAssets.adminJames },
  { name: 'Elena Rodriguez', avatar: settingsAssets.adminElena },
  { name: 'Marcus Thorne', avatar: settingsAssets.adminMarcus },
]

const adminAvatars = [settingsAssets.adminJames, settingsAssets.adminElena, settingsAssets.adminMarcus]

export function SettingsPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser())
  const [name, setName] = useState(() => getStoredUser()?.nome || 'Dr. Sarah Chen')
  const [email, setEmail] = useState(() => getStoredUser()?.email || 'admin@oncoopera.com')
  const [admins, setAdmins] = useState<AdminRow[]>(fallbackAdmins)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const token = getStoredAccessToken()

    if (!token) {
      return
    }

    const accessToken = token
    let isMounted = true

    async function loadSettings() {
      const [currentUserResult, adminsResult] = await Promise.allSettled([
        getCurrentUser(),
        listBackofficeUsuarios({ page: 1, pageSize: 20, tipo: 'ADMINISTRADOR' }),
      ])

      if (!isMounted) {
        return
      }

      if (currentUserResult.status === 'fulfilled') {
        setUser(currentUserResult.value)
        setName(currentUserResult.value.nome)
        setEmail(currentUserResult.value.email)
        storeAuthSession(accessToken, currentUserResult.value)
      }

      if (adminsResult.status === 'fulfilled' && adminsResult.value.data.length > 0) {
        setAdmins(
          adminsResult.value.data.map((admin, index) => ({
            id: admin.id,
            name: admin.nome,
            avatar: adminAvatars[index % adminAvatars.length],
          })),
        )
      }
    }

    loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSaveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    setError('')

    if (!user) {
      setError('Entre com uma conta administrativa para salvar alterações.')
      return
    }

    setIsSaving(true)

    try {
      const updated = await updateBackofficeAdministrator(user.id, {
        email,
        login: user.login,
        nome: name,
      })

      setUser(updated.usuario)
      storeAuthSession(getStoredAccessToken() || '', updated.usuario)
      setFeedback('Conta atualizada com sucesso.')
    } catch (saveError) {
      setError(getApiErrorMessage(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAdmin(admin: AdminRow) {
    if (!admin.id) {
      setAdmins((current) => current.filter((item) => item.name !== admin.name))
      return
    }

    setFeedback('')
    setError('')

    try {
      await deleteBackofficeAdministrator(admin.id)
      setAdmins((current) => current.filter((item) => item.id !== admin.id))
      setFeedback('Administrador inativado com sucesso.')
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError))
    }
  }

  return (
    <AppLayout activeItem="Configurações" user={user}>
      <main
        className="grid min-h-0 flex-1 place-items-center overflow-auto bg-admin-canvas px-6 py-6 sm:px-10 lg:overflow-hidden lg:px-10 lg:py-0"
        data-figma-node-id="327:1021"
      >
        <div className="grid w-full max-w-[1080px] gap-5 px-0 lg:max-h-[calc(100svh-96px)]">
          <header className="grid gap-2">
            <h1 className="font-serif text-[32px] leading-9 text-admin-text">Configurações</h1>
            <p className="text-sm leading-5 text-muted-strong">Administre sua conta de acesso</p>
          </header>

          <SettingsCard>
            <h2 className="border-b border-[#bbcac4]/15 pb-3.5 font-serif text-[22px] leading-7 text-admin-text">Minha conta</h2>

            <form className="mt-4 grid gap-6 lg:grid-cols-[230px_1fr]" onSubmit={handleSaveAccount}>
              <div className="grid justify-items-center gap-3">
                <div className="relative">
                  <img
                    className="h-28 w-28 rounded-full border-2 border-white object-cover shadow-[4px_4px_0_rgba(187,202,196,0.2),inset_2px_2px_4px_2px_rgba(215,219,218,0.5)]"
                    src={settingsAssets.currentUserAvatar}
                    alt=""
                    aria-hidden="true"
                  />
                  <button
                    className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-[#e0e3e2] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                    type="button"
                    aria-label="Alterar avatar"
                  >
                    <img className="h-[10.5px] w-[11.667px]" src={settingsAssets.camera} alt="" aria-hidden="true" />
                  </button>
                </div>
                <p className="pt-1 text-center text-xs leading-4 text-muted-strong">JPG or PNG - máximo de 200 mb</p>
              </div>

              <div className="grid content-start gap-4">
                <SettingsInput label="Nome completo" onChange={(event) => setName(event.target.value)} value={name} />
                <SettingsInput label="Endereço e-mail" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
                <div className="flex justify-end pt-1">
                  <button
                    className="rounded-xl bg-brand-teal px-6 py-3 text-sm leading-5 text-white shadow-[4px_4px_0_rgba(187,202,196,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </SettingsCard>

          <SettingsCard>
            <div className="flex items-center justify-between border-b border-[#bbcac4]/15 pb-3.5">
              <h2 className="font-serif text-[22px] leading-7 text-admin-text">Administradores</h2>
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-[#e0e3e2] px-4 py-2.5 text-xs leading-4 text-admin-text transition hover:-translate-y-0.5"
                to="/configuracoes/administradores/novo"
              >
                <img className="h-[9.333px] w-[9.333px]" src={settingsAssets.plus} alt="" aria-hidden="true" />
                Add Admin
              </Link>
            </div>

            <div className="mt-4 grid gap-3.5">
              {admins.map((admin) => (
                <div className="flex items-center justify-between rounded-[28px] bg-admin-canvas p-3.5" key={admin.id ?? admin.name}>
                  <div className="flex min-w-0 items-center gap-4">
                    <img className="h-10 w-10 shrink-0 rounded-full border border-[#bbcac4]/30 object-cover" src={admin.avatar} alt="" />
                    <p className="truncate text-sm leading-5 text-admin-text">{admin.name}</p>
                  </div>
                  <button
                    className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white"
                    onClick={() => handleDeleteAdmin(admin)}
                    type="button"
                    aria-label={`Remover ${admin.name}`}
                  >
                    <img className="h-[18px] w-4" src={settingsAssets.trash} alt="" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </SettingsCard>

          {feedback ? <p className="rounded-2xl bg-brand-mint/20 px-4 py-3 text-sm font-semibold text-brand-teal">{feedback}</p> : null}
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      </main>
    </AppLayout>
  )
}
