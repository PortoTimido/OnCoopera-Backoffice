import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../auth/api/authApi'
import { getStoredAccessToken, getStoredUser, storeAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { createBackofficeAdministrator } from '../../backoffice/api/backofficeApi'
import type { AdminProfile } from '../../backoffice/api/backofficeApi'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { settingsAssets } from '../assets'
import { AdminCreateInput } from '../components/AdminCreateInput'
import { AdminCreateSelect } from '../components/AdminCreateSelect'

const permissionOptions: Array<{ label: string; value: AdminProfile }> = [
  { label: 'Acesso total', value: 'TOTAL' },
  { label: 'Moderação de conteúdo', value: 'MODERADOR_DE_CONTEUDO' },
  { label: 'Gestão de apoios', value: 'GERENTE_DE_APOIOS' },
  { label: 'Análise de interações', value: 'ANALISTA_DE_INTERACOES' },
]

function normalizeLoginPart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function createLoginFromName(name: string) {
  const parts = name.trim().split(/\s+/).map(normalizeLoginPart).filter(Boolean)

  if (parts.length === 0) {
    return 'administrador'
  }

  if (parts.length === 1) {
    return parts[0]
  }

  return `${parts[0]}.${parts[parts.length - 1]}`
}

function getPasswordScore(password: string) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%&*?._-]/.test(password),
  ].filter(Boolean).length
}

export function CreateAdministratorPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<AdminProfile>('TOTAL')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [error, setError] = useState('')

  const passwordScore = useMemo(() => getPasswordScore(password), [password])
  const passwordStrengthLabel = passwordScore >= 3 ? 'Boa' : passwordScore >= 2 ? 'Razoável' : 'Fraca'
  const generatedLogin = useMemo(() => createLoginFromName(name), [name])

  useEffect(() => {
    const token = getStoredAccessToken()

    if (!token) {
      return
    }

    const accessToken = token
    let isMounted = true

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()

        if (isMounted) {
          setUser(currentUser)
          storeAuthSession(accessToken, currentUser)
        }
      } catch {
        // A tela continua usável visualmente; a API retornará 401 se o envio for tentado sem sessão válida.
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setTemporaryPassword('')

    if (!acceptedTerms) {
      setError('Aceite os termos de uso e a política de privacidade para continuar.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve conter ao menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas informadas não coincidem.')
      return
    }

    setIsSubmitting(true)

    try {
      const created = await createBackofficeAdministrator({
        dataNascimento: '1990-01-01',
        email,
        login: generatedLogin,
        nome: name,
        perfisAdministrativos: [permission],
        telefone: '11999999999',
      })

      setTemporaryPassword(created.senhaTemporaria || 'Senha temporária criada pela API.')
      setName('')
      setEmail('')
      setPermission('TOTAL')
      setPassword('')
      setConfirmPassword('')
      setAcceptedTerms(false)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout activeItem="Configurações" user={user}>
      <main
        className="grid min-h-0 flex-1 place-items-center overflow-auto bg-[#f1f4f3] px-6 py-8 sm:px-10 lg:overflow-hidden lg:px-10 lg:py-0"
        data-figma-node-id="327:3355"
      >
        <div className="grid w-full max-w-[1180px] gap-6">
          <header className="mx-auto grid w-full max-w-[900px] gap-1">
            <nav className="flex items-center gap-2 text-base leading-6" aria-label="Caminho">
              <Link className="text-muted hover:text-brand-teal" to="/configuracoes">
                Configurações
              </Link>
              <img className="h-2 w-[4.933px]" src={settingsAssets.breadcrumbChevron} alt="" aria-hidden="true" />
              <span className="font-bold text-brand-teal">Criar conta administrativa</span>
            </nav>
            <h1 className="font-serif text-[40px] font-semibold leading-[1.15] text-ink">Criar conta administrativa</h1>
          </header>

          <form
            className="mx-auto grid w-full max-w-[900px] gap-4 rounded-[28px] border-2 border-[#e9efeb] bg-white px-10 py-8 shadow-[6px_6px_0_rgba(187,202,196,0.6)]"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminCreateInput
                label="Nome completo"
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Helena Vasconcelos"
                required
                value={name}
              />

              <AdminCreateInput
                label="Usuário de login"
                name="login"
                readOnly
                value={generatedLogin}
              />

              <AdminCreateInput
                label="E-mail corporativo"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="helena@instituicao.org"
                required
                type="email"
                value={email}
              />

              <AdminCreateSelect
                label="Nível de permissão"
                onChange={setPermission}
                options={permissionOptions}
                value={permission}
              />
            </div>

            <div className="grid gap-2">
              <AdminCreateInput
                label="Senha"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 8 caracteres"
                required
                rightElement={<img className="h-[19.8px] w-[22px]" src={settingsAssets.formEyeOff} alt="" aria-hidden="true" />}
                type="password"
                value={password}
              />
              <div className="grid gap-2 pt-1">
                <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                  {Array.from({ length: 4 }, (_, index) => (
                    <span
                      className={index < Math.max(passwordScore, 2) ? 'h-2 rounded-full bg-warning' : 'h-2 rounded-full bg-line'}
                      key={index}
                    />
                  ))}
                </div>
                <p className="text-right text-[clamp(12px,0.94vw,17px)] font-semibold leading-[1.2] text-muted-strong">Força: {passwordStrengthLabel}</p>
              </div>
            </div>

            <AdminCreateInput
              label="Confirmar senha"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Digite a senha novamente"
              required
              type="password"
              value={confirmPassword}
            />

            <label className="mt-1 flex items-start gap-3 text-base leading-6 text-muted-strong">
              <input
                checked={acceptedTerms}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-[#bbcac4] accent-brand-teal"
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                type="checkbox"
              />
              <span>
                Eu concordo com os <span className="text-brand-teal">Termos de uso</span> e a{' '}
                <span className="text-brand-teal">Política de privacidade</span> institucionais.
              </span>
            </label>

            <button
              className="mt-1 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-base font-bold tracking-[0.28px] text-white shadow-button-dark transition hover:-translate-y-0.5 disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <span>{isSubmitting ? 'Criando...' : 'Criar conta administrativa'}</span>
              <img className="h-[13.333px] w-[13.333px]" src={settingsAssets.formArrow} alt="" aria-hidden="true" />
            </button>

            {temporaryPassword ? (
              <p className="rounded-xl bg-brand-mint/20 px-4 py-3 text-sm font-semibold text-brand-teal">
                Conta criada. Senha temporária: {temporaryPassword}
              </p>
            ) : null}
            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          </form>
        </div>
      </main>
    </AppLayout>
  )
}
