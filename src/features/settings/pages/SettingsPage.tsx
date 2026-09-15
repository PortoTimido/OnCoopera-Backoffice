import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getCurrentUser, updateOwnProfile } from '../../auth/api/authApi'
import { getStoredAccessToken, getStoredUser, storeAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { formatPhoneNumber } from '../../../lib/formatters'
import { DatePicker } from '../../../components/ui/DatePicker'
import { settingsAssets } from '../assets'
import { SettingsCard } from '../components/SettingsCard'
import { SettingsInput } from '../components/SettingsInput'

const todayIsoDate = new Date().toISOString().slice(0, 10)
const datePickerInputClass =
  'h-10 w-full rounded-[32px] border-0 bg-[#e6e9e8] px-4 text-sm normal-case tracking-normal text-admin-text outline-none shadow-[2px_2px_0_rgba(187,202,196,0.2),inset_2px_2px_4px_rgba(215,219,218,0.5)] transition placeholder:text-[#6b7280] focus:ring-4 focus:ring-brand-mint/20'

function toIsoDateOnly(value: string | null | undefined): string {
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value ?? '')
  return match ? match[0] : ''
}

export function SettingsPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser())
  const [name, setName] = useState(() => getStoredUser()?.nome || 'Dr. Sarah Chen')
  const [email, setEmail] = useState(() => getStoredUser()?.email || 'admin@oncoopera.com')
  const [phone, setPhone] = useState(() => getStoredUser()?.telefone || '')
  const [birthDate, setBirthDate] = useState(() => toIsoDateOnly(getStoredUser()?.dataNascimento))
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
      const currentUserResult = await Promise.allSettled([getCurrentUser()])

      if (!isMounted) {
        return
      }

      if (currentUserResult[0].status === 'fulfilled') {
        setUser(currentUserResult[0].value)
        setName(currentUserResult[0].value.nome)
        setEmail(currentUserResult[0].value.email)
        setPhone(currentUserResult[0].value.telefone || '')
        setBirthDate(toIsoDateOnly(currentUserResult[0].value.dataNascimento))
        storeAuthSession(accessToken, currentUserResult[0].value)
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
      const trimmedPhone = phone.replace(/\D/g, '')
      const normalizedBirthDate = toIsoDateOnly(birthDate)

      const updated = await updateOwnProfile({
        email,
        nome: name,
        ...(trimmedPhone ? { telefone: trimmedPhone } : {}),
        ...(normalizedBirthDate ? { dataNascimento: normalizedBirthDate } : {}),
      })

      setUser(updated)
      storeAuthSession(getStoredAccessToken() || '', updated)
      setFeedback('Conta atualizada com sucesso.')
    } catch (saveError) {
      setError(getApiErrorMessage(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout activeItem="Configurações" user={user}>
      <main
        className="min-h-0 flex-1 overflow-auto bg-admin-canvas px-6 py-6 sm:px-10 lg:px-10 lg:py-8"
        data-figma-node-id="327:1021"
      >
        <div className="mx-auto grid w-full max-w-[1080px] gap-5 px-0">
          <header className="grid gap-2">
            <h1 className="font-serif text-[32px] leading-9 text-admin-text">Configurações</h1>
            <p className="text-sm leading-5 text-muted-strong">Administre sua conta de acesso</p>
          </header>

          <SettingsCard className="!overflow-visible">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsInput label="Nome completo" onChange={(event) => setName(event.target.value)} value={name} />
                  <SettingsInput label="Endereço e-mail" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
                  <SettingsInput
                    inputMode="tel"
                    label="Telefone"
                    onChange={(event) => setPhone(formatPhoneNumber(event.target.value))}
                    placeholder="(00) 00000-0000"
                    value={phone}
                  />
                  <label className="grid gap-1 text-xs font-normal uppercase tracking-[0.6px] text-muted-strong">
                    <span>Data de nascimento</span>
                    <DatePicker className={datePickerInputClass} max={todayIsoDate} onChange={setBirthDate} value={birthDate} />
                  </label>
                </div>
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

          {feedback ? <p className="rounded-2xl bg-brand-mint/20 px-4 py-3 text-sm font-semibold text-brand-teal">{feedback}</p> : null}
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      </main>
    </AppLayout>
  )
}
