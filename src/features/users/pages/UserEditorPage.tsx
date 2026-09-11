import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Check, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { createBackofficeAdministrator, getBackofficeUsuario, updateBackofficeAdministrator } from '../../backoffice/api/backofficeApi'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { administrativePermissions, createLoginFromName, permissionsFromApi, permissionsToPayload } from '../model/administrator'
import type { DetailedAdministrativePermission } from '../model/administrator'
import { DatePicker } from '../../../components/ui/DatePicker'
import { formatPhoneNumber, isValidEmail } from '../../../lib/formatters'

const todayIsoDate = new Date().toISOString().slice(0, 10)

type FormState = { nome: string; email: string; telefone: string; dataNascimento: string; permissoes: DetailedAdministrativePermission[]; login: string }
const initialForm: FormState = { nome: '', email: '', telefone: '', dataNascimento: '', permissoes: [], login: '' }

export function UserEditorPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(userId)
  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const generatedLogin = useMemo(() => createLoginFromName(form.nome), [form.nome])

  useEffect(() => {
    if (!userId) return
    const id = userId
    let active = true
    async function load() {
      try {
        const details = await getBackofficeUsuario(id)
        if (!active) return
        const administrator = details.usuario
        if (administrator.tipo !== 'ADMINISTRADOR') { setError('Este cadastro não é um administrador.'); return }
        setForm({ nome: administrator.nome, email: administrator.email, telefone: administrator.telefone, dataNascimento: administrator.dataNascimento, permissoes: permissionsFromApi(administrator.permissoesAdministrativas, administrator.perfisAdministrativos), login: administrator.login })
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [userId])

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) { setForm((current) => ({ ...current, [field]: value })) }
  function togglePermission(permission: DetailedAdministrativePermission) { setForm((current) => ({ ...current, permissoes: current.permissoes.includes(permission) ? current.permissoes.filter((value) => value !== permission) : [...current.permissoes, permission] })) }
  const emailIsInvalid = form.email.trim().length > 0 && !isValidEmail(form.email)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setTemporaryPassword('')
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || !form.dataNascimento) { setError('Preencha todos os dados pessoais obrigatórios.'); return }
    if (!isValidEmail(form.email)) { setError('Informe um e-mail válido.'); return }
    setIsSubmitting(true)
    try {
      const payload = { nome: form.nome.trim(), email: form.email.trim(), telefone: form.telefone.replace(/\D/g, ''), dataNascimento: form.dataNascimento, permissoesAdministrativas: permissionsToPayload(form.permissoes) }
      if (isEditing && userId) { await updateBackofficeAdministrator(userId, { ...payload, login: form.login }); navigate('/usuarios') }
      else { const created = await createBackofficeAdministrator({ ...payload, login: generatedLogin }); setTemporaryPassword(created.senhaTemporaria ?? 'A API não retornou a senha temporária.'); setForm(initialForm) }
    } catch (submitError) { setError(getApiErrorMessage(submitError)) } finally { setIsSubmitting(false) }
  }

  const inputClass = 'h-12 w-full rounded-lg border-2 border-[#dce4e0] bg-white px-4 text-sm text-admin-text outline-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.03)] placeholder:text-muted focus:border-brand-mint'
  return <AppLayout activeItem="Usuários" user={getStoredUser()}><main className="min-h-0 flex-1 overflow-auto bg-[#f1f4f3] p-6 sm:p-9 lg:p-10"><form className="mx-auto grid max-w-[970px] gap-5" onSubmit={handleSubmit}><header><Link className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-teal" to="/usuarios"><ArrowLeft size={16} />Voltar para usuários</Link><h1 className="mt-2 font-serif text-4xl text-admin-text">{isEditing ? 'Editar administrador' : 'Novo administrador'}</h1></header>{isLoading ? <section className="rounded-3xl bg-white p-10 text-center text-sm text-muted">Carregando administrador...</section> : <><section className="rounded-2xl bg-white p-6 shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><h2 className="flex items-center gap-2 border-b border-line pb-3 font-serif text-2xl text-admin-text"><UserRound className="text-brand-teal" size={20} />Dados Pessoais</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-bold text-muted-strong">Nome completo<input className={inputClass} onChange={(event) => setField('nome', event.target.value)} placeholder="Ex: Dra. Ana Silva" required value={form.nome} /></label><label className="grid gap-1.5 text-sm font-bold text-muted-strong">E-mail profissional<input aria-invalid={emailIsInvalid} className={emailIsInvalid ? `${inputClass} border-red-400` : inputClass} onChange={(event) => setField('email', event.target.value)} placeholder="ana.silva@oncoopera.com" required type="email" value={form.email} />{emailIsInvalid ? <span className="text-xs font-semibold text-red-700">Informe um e-mail válido.</span> : null}</label><label className="grid gap-1.5 text-sm font-bold text-muted-strong">Telefone<input className={inputClass} inputMode="tel" onChange={(event) => setField('telefone', formatPhoneNumber(event.target.value))} placeholder="(00) 00000-0000" required value={form.telefone} /></label><DatePicker className={inputClass} label="Data de nascimento" max={todayIsoDate} onChange={(value) => setField('dataNascimento', value)} required value={form.dataNascimento} /></div>{!isEditing ? <p className="mt-4 text-xs text-muted">Login que será criado: <strong>{generatedLogin}</strong></p> : null}</section><div className="grid gap-5 lg:grid-cols-[1fr_.95fr]"><section className="rounded-2xl bg-white p-6 shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><h2 className="border-b border-line pb-3 font-serif text-2xl text-admin-text">Permissões Detalhadas</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{administrativePermissions.map((permission) => <label className="flex cursor-pointer gap-3" key={permission.value}><input checked={form.permissoes.includes(permission.value)} className="mt-1 h-5 w-5 rounded accent-brand-teal" onChange={() => togglePermission(permission.value)} type="checkbox" /><span><strong className="block text-sm text-admin-text">{permission.label}</strong><span className="block text-xs text-muted">{permission.description}</span></span></label>)}</div></section><section className="rounded-2xl bg-white p-6 shadow-[5px_5px_0_rgba(187,202,196,0.55)]"><h2 className="flex items-center gap-2 border-b border-line pb-3 font-serif text-2xl text-admin-text"><ShieldCheck className="text-red-700" size={20} />Segurança Inicial</h2><p className="mt-5 text-sm text-muted">{isEditing ? 'A senha atual não é exibida nem alterada nesta ficha.' : 'Uma senha temporária forte será gerada pela API e exibida somente uma vez após o cadastro.'}</p><div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-surface-mint p-3 text-sm font-semibold text-muted-strong"><Check className="rounded bg-brand-teal p-0.5 text-white" size={20} />Obrigar redefinição de senha no primeiro acesso</div></section></div><footer className="flex justify-end gap-4 pb-6"><Link className="rounded-xl border-2 border-[#cfdcd6] bg-white px-6 py-3 text-sm font-bold text-muted-strong" to="/usuarios">Cancelar</Link><button className="rounded-xl bg-brand-teal px-6 py-3 text-sm font-bold text-white shadow-button-dark disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar cadastro'}</button></footer></>}{temporaryPassword ? <section className="rounded-2xl border border-brand-mint bg-white p-5 shadow-[5px_5px_0_rgba(187,202,196,0.35)]" role="status"><h2 className="font-serif text-2xl text-admin-text">Administrador criado</h2><p className="mt-2 text-sm text-muted-strong">Guarde e compartilhe esta senha de forma segura. Ela não será exibida novamente.</p><code className="mt-4 block rounded-lg bg-surface-mint p-3 text-base font-bold text-brand-teal">{temporaryPassword}</code><Link className="mt-4 inline-block text-sm font-bold text-brand-teal" to="/usuarios">Voltar para usuários</Link></section> : null}{error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}</form></main></AppLayout>
}
