import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Check, CheckCircle2, Copy, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { createBackofficeAdministrator, getBackofficeUsuario, updateBackofficeAdministrator } from '../../backoffice/api/backofficeApi'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { administrativePermissions, createLoginFromName, hasTotalPermission, permissionsFromApi, permissionsToPayload } from '../model/administrator'
import type { DetailedAdministrativePermission } from '../model/administrator'
import { DatePicker } from '../../../components/ui/DatePicker'
import { useToast } from '../../../components/ui/useToast'
import { formatPhoneNumber, isValidEmail } from '../../../lib/formatters'

const todayIsoDate = new Date().toISOString().slice(0, 10)

type FormState = { nome: string; email: string; telefone: string; dataNascimento: string; permissoes: DetailedAdministrativePermission[]; login: string }
const initialForm: FormState = { nome: '', email: '', telefone: '', dataNascimento: '', permissoes: [], login: '' }

function toIsoDateOnly(value: string | null | undefined): string {
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value ?? '')
  return match ? match[0] : ''
}

function TemporaryPasswordModal({
  password,
  email,
  emailStatus,
  onNewUser,
  onBack,
}: {
  password: string
  email: string
  emailStatus?: 'ENVIADO' | 'FALHOU'
  onNewUser: () => void
  onBack: () => void
}) {
  const [hasCopied, setHasCopied] = useState(false)

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password)
      setHasCopied(true)
    } catch {
      setHasCopied(false)
    }
  }

  const emailWasSent = emailStatus === 'ENVIADO'

  return createPortal(<div aria-describedby="temporary-password-description" aria-labelledby="temporary-password-title" aria-modal="true" className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,0.35)] sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-mint text-brand-teal"><CheckCircle2 aria-hidden="true" size={26} /></span><h2 className="mt-5 font-serif text-3xl text-admin-text" id="temporary-password-title">Usuário criado</h2><p className="mt-3 text-sm leading-6 text-muted-strong" id="temporary-password-description">{emailWasSent ? <>Enviamos a senha temporária por e-mail para <strong className="text-admin-text">{email}</strong>. Ela também está disponível abaixo, caso precise compartilhar manualmente.</> : <>Não foi possível enviar o e-mail automaticamente para <strong className="text-admin-text">{email}</strong>. Compartilhe a senha abaixo de forma segura com o usuário.</>}</p>{!emailWasSent ? <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">Falha no envio do e-mail de acesso temporário.</p> : null}<label className="mt-6 grid gap-2 text-sm font-bold text-muted-strong"><span>Senha temporária</span><div className="flex gap-2"><input aria-label="Senha temporária" className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface-mint px-3 font-mono text-sm font-bold text-brand-teal outline-none" readOnly value={password} /><button aria-label="Copiar senha" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-line text-brand-teal transition hover:bg-surface-mint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" onClick={() => void copyPassword()} type="button"><Copy aria-hidden="true" size={18} /></button></div></label><p aria-live="polite" className="mt-2 min-h-5 text-xs font-semibold text-brand-teal">{hasCopied ? 'Senha copiada.' : ''}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button className="h-11 rounded-xl border-2 border-line bg-white px-5 text-sm font-bold text-admin-text transition hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" onClick={onBack} type="button">Cancelar</button><button className="h-11 rounded-xl bg-brand-teal px-5 text-sm font-bold text-white shadow-button-dark transition hover:bg-brand-teal/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" onClick={onNewUser} type="button">Novo usuário</button></div></section></div>, document.body)
}

export function UserEditorPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(userId)
  const toast = useToast()
  const [form, setForm] = useState<FormState>(initialForm)
  const [createdUser, setCreatedUser] = useState<{ email: string; senhaTemporaria: string; emailEnvio?: 'ENVIADO' | 'FALHOU' } | null>(null)
  const currentUser = getStoredUser()
  const isEditingSelf = isEditing && Boolean(userId) && currentUser?.id === userId
  const currentUserHasTotal = hasTotalPermission(currentUser?.permissoesAdministrativas, currentUser?.perfisAdministrativos)
  const isBlockedBySelfEdit = isEditingSelf && !currentUserHasTotal
  const [isLoading, setIsLoading] = useState(isEditing && !isBlockedBySelfEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const generatedLogin = useMemo(() => createLoginFromName(form.nome), [form.nome])

  useEffect(() => {
    if (!userId || isBlockedBySelfEdit) return
    const id = userId
    let active = true
    async function load() {
      try {
        const details = await getBackofficeUsuario(id)
        if (!active) return
        const administrator = details.usuario
        if (administrator.tipo !== 'ADMINISTRADOR') { toast.error('Este cadastro não é um administrador.'); return }
        setForm({ nome: administrator.nome, email: administrator.email, telefone: administrator.telefone, dataNascimento: toIsoDateOnly(administrator.dataNascimento), permissoes: permissionsFromApi(administrator.permissoesAdministrativas, administrator.perfisAdministrativos), login: administrator.login })
      } catch (loadError) {
        if (active) toast.error(getApiErrorMessage(loadError))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [isBlockedBySelfEdit, toast, userId])

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) { setForm((current) => ({ ...current, [field]: value })) }
  function togglePermission(permission: DetailedAdministrativePermission) { setForm((current) => ({ ...current, permissoes: current.permissoes.includes(permission) ? current.permissoes.filter((value) => value !== permission) : [...current.permissoes, permission] })) }
  function startNewUser() { setCreatedUser(null); setForm(initialForm); navigate('/usuarios/novo') }
  const emailIsInvalid = form.email.trim().length > 0 && !isValidEmail(form.email)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreatedUser(null)
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || !form.dataNascimento) { toast.error('Preencha todos os dados pessoais obrigatórios.'); return }
    if (!isValidEmail(form.email)) { toast.error('Informe um e-mail válido.'); return }
    setIsSubmitting(true)
    try {
      const payload = { nome: form.nome.trim(), email: form.email.trim(), telefone: form.telefone.replace(/\D/g, ''), dataNascimento: form.dataNascimento, permissoesAdministrativas: permissionsToPayload(form.permissoes) }
      if (isEditing && userId) { await updateBackofficeAdministrator(userId, { ...payload, login: form.login }); toast.success('Administrador atualizado com sucesso.'); navigate('/usuarios') }
      else {
        const created = await createBackofficeAdministrator({ ...payload, login: generatedLogin })
        setCreatedUser({ email: payload.email, senhaTemporaria: created.senhaTemporaria ?? 'A API não retornou a senha temporária.', emailEnvio: created.emailEnvio })
        setForm(initialForm)
      }
    } catch (submitError) { toast.error(getApiErrorMessage(submitError)) } finally { setIsSubmitting(false) }
  }

  const inputClass = 'h-12 w-full rounded-lg border-2 border-[#dce4e0] bg-white px-4 text-sm text-admin-text outline-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.03)] placeholder:text-muted focus:border-brand-mint'
  return <AppLayout activeItem="Usuários" user={getStoredUser()}><main className="min-h-0 flex-1 overflow-auto bg-admin-canvas p-6 sm:p-9 lg:p-10"><form className="grid w-full gap-5" onSubmit={handleSubmit}><header><Link className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-teal" to="/usuarios"><ArrowLeft size={16} />Voltar para usuários</Link><h1 className="mt-2 font-serif text-4xl text-admin-text">{isEditing ? 'Editar administrador' : 'Novo administrador'}</h1></header>{isBlockedBySelfEdit ? <section className="grid justify-items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><ShieldAlert className="text-red-700" size={32} /><h2 className="font-serif text-2xl text-admin-text">Permissão administrativa insuficiente</h2><p className="max-w-md text-sm text-muted">Apenas administradores com permissão TOTAL podem editar o próprio usuário por aqui. Atualize seus dados pela tela de Configurações.</p><Link className="mt-2 rounded-xl bg-brand-teal px-6 py-3 text-sm font-bold text-white shadow-button-dark" to="/configuracoes">Ir para Configurações</Link></section> : isLoading ? <section className="rounded-3xl bg-white p-10 text-center text-sm text-muted">Carregando administrador...</section> : <><section className="rounded-2xl bg-white p-6 shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><h2 className="flex items-center gap-2 border-b border-line pb-3 font-serif text-2xl text-admin-text"><UserRound className="text-brand-teal" size={20} />Dados Pessoais</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-bold text-muted-strong">Nome completo<input className={inputClass} onChange={(event) => setField('nome', event.target.value)} placeholder="Ex: Dra. Ana Silva" required value={form.nome} /></label><label className="grid gap-1.5 text-sm font-bold text-muted-strong">E-mail profissional<input aria-invalid={emailIsInvalid} className={emailIsInvalid ? `${inputClass} border-red-400` : inputClass} onChange={(event) => setField('email', event.target.value)} placeholder="ana.silva@oncoopera.com" required type="email" value={form.email} />{emailIsInvalid ? <span className="text-xs font-semibold text-red-700">Informe um e-mail válido.</span> : null}</label><label className="grid gap-1.5 text-sm font-bold text-muted-strong">Telefone<input className={inputClass} inputMode="tel" onChange={(event) => setField('telefone', formatPhoneNumber(event.target.value))} placeholder="(00) 00000-0000" required value={form.telefone} /></label><DatePicker className={inputClass} label="Data de nascimento" max={todayIsoDate} onChange={(value) => setField('dataNascimento', value)} required value={form.dataNascimento} /></div>{!isEditing ? <p className="mt-4 text-xs text-muted">Login que será criado: <strong>{generatedLogin}</strong></p> : null}</section><div className="grid gap-5 lg:grid-cols-[1fr_.95fr]"><section className="rounded-2xl bg-white p-6 shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><h2 className="border-b border-line pb-3 font-serif text-2xl text-admin-text">Permissões Detalhadas</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{administrativePermissions.map((permission) => <label className="flex cursor-pointer gap-3" key={permission.value}><input checked={form.permissoes.includes(permission.value)} className="mt-1 h-5 w-5 rounded accent-brand-teal" onChange={() => togglePermission(permission.value)} type="checkbox" /><span><strong className="block text-sm text-admin-text">{permission.label}</strong><span className="block text-xs text-muted">{permission.description}</span></span></label>)}</div></section><section className="rounded-2xl bg-white p-6 shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><h2 className="flex items-center gap-2 border-b border-line pb-3 font-serif text-2xl text-admin-text"><ShieldCheck className="text-red-700" size={20} />Segurança Inicial</h2><p className="mt-5 text-sm text-muted">{isEditing ? 'A senha atual não é exibida nem alterada nesta ficha.' : 'Uma senha temporária forte será gerada e enviada automaticamente para o e-mail do usuário. Ela também será exibida uma única vez após o cadastro.'}</p><div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-surface-mint p-3 text-sm font-semibold text-muted-strong"><Check className="rounded bg-brand-teal p-0.5 text-white" size={20} />Obrigar redefinição de senha no primeiro acesso</div></section></div><footer className="flex justify-end gap-4 pb-6"><Link className="rounded-xl border-2 border-[#cfdcd6] bg-white px-6 py-3 text-sm font-bold text-muted-strong" to="/usuarios">Cancelar</Link><button className="rounded-xl bg-brand-teal px-6 py-3 text-sm font-bold text-white shadow-button-dark disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar cadastro'}</button></footer></>}</form></main>{createdUser ? <TemporaryPasswordModal email={createdUser.email} emailStatus={createdUser.emailEnvio} onBack={() => navigate('/usuarios')} onNewUser={startNewUser} password={createdUser.senhaTemporaria} /> : null}</AppLayout>
}
