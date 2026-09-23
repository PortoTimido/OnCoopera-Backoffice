import { useEffect, useMemo, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { Image, Info, MapPinned, Save, X } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { AdminCreateSelect } from '../../settings/components/AdminCreateSelect'
import { createBackofficeSupport, deleteBackofficeSupportImage, getBackofficeSupport, replaceBackofficeSupportImage, updateBackofficeSupport, uploadBackofficeSupportImage } from '../api/supportApi'
import { SupportMapPlaceholder } from '../components/SupportMapPlaceholder'
import { SupportPhotoUpload } from '../components/SupportPhotoUpload'
import { SupportScheduleCard } from '../components/SupportScheduleCard'
import { supportCategoryLabels, supportCategories, type SaveSupportPayload, type SupportFormValues, type SupportResource } from '../model/supportTypes'
import { useToast } from '../../../components/ui/useToast'

type FieldName = Exclude<keyof SupportFormValues, 'coordinates' | 'category' | 'schedules'>
type FormErrors = Partial<Record<FieldName, string>>
type ViaCepAddress = { bairro: string; localidade: string; logradouro: string; uf: string; erro?: boolean }
const emptyValues: SupportFormValues = { name: '', category: 'CLINICA', phone: '', description: '', cep: '', street: '', number: '', neighborhood: '', city: '', state: '', coordinates: { latitude: -15.7801, longitude: -47.9292 }, schedules: [] }

function formatPhone(value: string) { const digits = value.replace(/\D/g, '').slice(0, 11); if (digits.length <= 2) return digits ? `(${digits}` : ''; if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`; if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`; return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` }
const formatMobilePhone = formatPhone
function formatCep(value: string) { const digits = value.replace(/\D/g, '').slice(0, 8); return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits }
function mapSupportToForm(support: SupportResource): SupportFormValues { return { name: support.nome, category: support.tipoApoio, phone: formatPhone(support.telefone), description: support.descricao ?? '', cep: formatCep(support.endereco.cep), street: support.endereco.logradouro, number: support.endereco.numero, neighborhood: support.endereco.bairro, city: support.endereco.cidade, state: support.endereco.estado, coordinates: { latitude: support.endereco.latitude, longitude: support.endereco.longitude }, schedules: support.horarios } }
function toPayload(values: SupportFormValues): SaveSupportPayload { return { nome: values.name.trim(), tipoApoio: values.category, telefone: formatPhone(values.phone), descricao: values.description.trim() || null, endereco: { cep: formatCep(values.cep), logradouro: values.street.trim(), numero: values.number.trim(), bairro: values.neighborhood.trim(), cidade: values.city.trim(), estado: values.state.trim(), latitude: values.coordinates.latitude, longitude: values.coordinates.longitude }, horarios: values.schedules } }

export function SupportEditorPage() {
  const { supportId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [values, setValues] = useState<SupportFormValues>(emptyValues)
  const [support, setSupport] = useState<SupportResource | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(Boolean(supportId))
  const [isSaving, setIsSaving] = useState(false)
  const [isAddressLocked, setIsAddressLocked] = useState(false)
  const [isLookingUpCep, setIsLookingUpCep] = useState(false)
  const [cepLookupMessage, setCepLookupMessage] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [isPhotoRemovalRequested, setIsPhotoRemovalRequested] = useState(false)
  const user = getStoredUser()
  const isEditing = Boolean(supportId)
  const primaryImage = useMemo(() => [...(support?.imagens ?? [])].sort((a, b) => a.ordem - b.ordem)[0] ?? null, [support])

  useEffect(() => {
    if (new URLSearchParams(location.search).has('imageUploadFailed')) {
      toast.error('Apoio salvo, mas não foi possível persistir a foto. Selecione-a novamente para tentar de novo.')
    }
  }, [location.search, toast])

  useEffect(() => {
    if (!supportId) return
    const id = supportId
    let active = true
    async function loadSupport() { setIsLoading(true); try { const result = await getBackofficeSupport(id); if (active) { setSupport(result); setValues(mapSupportToForm(result)); setIsPhotoRemovalRequested(false) } } catch (loadError) { if (active) toast.error(getApiErrorMessage(loadError)) } finally { if (active) setIsLoading(false) } }
    void loadSupport()
    return () => { active = false }
  }, [supportId, toast])

  useEffect(() => {
    const cepDigits = values.cep.replace(/\D/g, '')
    if (cepDigits.length !== 8) { setIsAddressLocked(false); setIsLookingUpCep(false); setCepLookupMessage(''); return }
    const controller = new AbortController()
    async function lookupCep() {
      setIsLookingUpCep(true); setIsAddressLocked(false); setCepLookupMessage('')
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal: controller.signal })
        if (!response.ok) throw new Error('CEP não encontrado')
        const address = await response.json() as ViaCepAddress
        if (address.erro) { setCepLookupMessage('CEP não encontrado. Preencha o endereço manualmente.'); return }
        setValues((current) => current.cep.replace(/\D/g, '') === cepDigits ? { ...current, street: address.logradouro, neighborhood: address.bairro, city: address.localidade, state: address.uf } : current)
        setIsAddressLocked(true)
      } catch (lookupError) { if (!(lookupError instanceof DOMException && lookupError.name === 'AbortError')) setCepLookupMessage('Não foi possível consultar o CEP. Preencha o endereço manualmente.') } finally { if (!controller.signal.aborted) setIsLookingUpCep(false) }
    }
    void lookupCep()
    return () => controller.abort()
  }, [values.cep])

  function setField(field: FieldName, value: string) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })) }
  function setCep(value: string) { setIsAddressLocked(false); setCepLookupMessage(''); setField('cep', formatCep(value)) }
  function validate() { const next: FormErrors = {}; const required: Array<[FieldName, string]> = [['name', 'Informe o nome do local.'], ['phone', 'Informe o telefone.'], ['cep', 'Informe o CEP.'], ['street', 'Informe o logradouro.'], ['number', 'Informe o número.'], ['neighborhood', 'Informe o bairro.'], ['city', 'Informe a cidade.'], ['state', 'Informe o estado.']]; required.forEach(([field, message]) => { if (!values[field].trim()) next[field] = message }); const phoneDigits = values.phone.replace(/\D/g, '').length; if (phoneDigits !== 10 && phoneDigits !== 11) next.phone = 'Informe um telefone com DDD válido.'; setErrors(next); return Object.keys(next).length === 0 }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validate()) { toast.error('Revise os campos obrigatórios antes de salvar.'); return }; setIsSaving(true); let savedSupport: SupportResource | null = null; try { const payload = toPayload(values); savedSupport = supportId ? await updateBackofficeSupport(supportId, payload) : await createBackofficeSupport(payload); if (photo) { savedSupport = primaryImage ? await replaceBackofficeSupportImage(savedSupport.id, primaryImage.id, photo) : await uploadBackofficeSupportImage(savedSupport.id, photo) } else if (isPhotoRemovalRequested && primaryImage) { await deleteBackofficeSupportImage(savedSupport.id, primaryImage.id); savedSupport = { ...savedSupport, imagens: savedSupport.imagens.filter((image) => image.id !== primaryImage.id), imagensUrl: savedSupport.imagensUrl.filter((url) => url !== primaryImage.url) } } setSupport(savedSupport); setPhoto(null); setIsPhotoRemovalRequested(false); navigate('/radar-de-apoio', { state: { feedback: isEditing ? 'Apoio atualizado com sucesso.' : 'Apoio cadastrado com sucesso.' } }) } catch (saveError) { if (savedSupport && !supportId) { navigate(`/radar-de-apoio/${savedSupport.id}/editar?imageUploadFailed=1`, { replace: true }); return } toast.error(getApiErrorMessage(saveError)) } finally { setIsSaving(false) } }

  const categoryOptions = supportCategories.map((category) => ({ value: category, label: supportCategoryLabels[category] }))
  return <AppLayout activeItem="Radar de Apoio" user={user}><main className="flex min-h-0 flex-1 flex-col overflow-auto p-6 sm:p-10 lg:p-10"><nav aria-label="Breadcrumb" className="mb-5 text-base text-muted"><Link className="hover:text-brand-teal" to="/radar-de-apoio">Radar de Apoio</Link><span aria-hidden="true" className="px-2">›</span><span className="font-semibold text-brand-teal">{isEditing ? 'Editar cadastro' : 'Novo Cadastro'}</span></nav>{isLoading ? <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted">Carregando cadastro...</p> : <form className="grid gap-7 xl:grid-cols-[minmax(0,1.9fr)_minmax(250px,1fr)]" noValidate onSubmit={handleSubmit}><div className="grid content-start gap-7"><FormCard icon={Info} title="Informações Gerais"><div className="grid gap-5"><TextInput error={errors.name} label="Nome do Local *" onChange={(value) => setField('name', value)} placeholder="Ex: Hospital do Câncer" value={values.name} /><div className="grid gap-5 sm:grid-cols-2"><AdminCreateSelect buttonClassName="h-12 !border !border-[#bbcac4]/35 bg-white px-4 text-base font-normal shadow-none" className="font-bold text-admin-text" label="Categoria *" onChange={(category) => setValues((current) => ({ ...current, category }))} options={categoryOptions} tone="adminField" value={values.category} /><TextInput error={errors.phone} inputMode="numeric" label="Telefone *" maxLength={15} onChange={(value) => setField('phone', formatMobilePhone(value))} placeholder="(11) 99999-9999" value={values.phone} /></div><label className="grid gap-2 text-sm font-bold text-admin-text">Descrição (Opcional)<textarea className="min-h-28 resize-y rounded-xl border border-[#bbcac4]/35 bg-white px-4 py-3 text-base font-normal text-admin-text outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => setField('description', event.target.value)} placeholder="Breve descrição sobre os serviços oferecidos..." value={values.description} /></label></div></FormCard><FormCard icon={MapPinned} title="Endereço e Geolocalização"><div className="grid gap-5"><div className="grid gap-5 sm:grid-cols-2"><div className="grid gap-1"><TextInput error={errors.cep} inputMode="numeric" label="CEP *" maxLength={9} onChange={setCep} placeholder="00000-000" value={values.cep} />{isLookingUpCep ? <span className="text-xs text-muted">Buscando CEP...</span> : null}{cepLookupMessage ? <span className="text-xs font-semibold text-amber-700" role="status">{cepLookupMessage}</span> : null}</div><TextInput error={errors.state} label="Estado *" maxLength={2} onChange={(value) => setField('state', value.toUpperCase())} placeholder="UF" readOnly={isAddressLocked} value={values.state} /></div><div className="grid gap-5 sm:grid-cols-2"><TextInput error={errors.city} label="Cidade *" onChange={(value) => setField('city', value)} placeholder="Cidade" readOnly={isAddressLocked} value={values.city} /><TextInput error={errors.neighborhood} label="Bairro *" onChange={(value) => setField('neighborhood', value)} placeholder="Bairro" readOnly={isAddressLocked} value={values.neighborhood} /></div><div className="grid gap-5 sm:grid-cols-[4fr_1fr]"><TextInput error={errors.street} label="Logradouro *" onChange={(value) => setField('street', value)} placeholder="Rua, avenida..." readOnly={isAddressLocked} value={values.street} /><TextInput error={errors.number} label="Número *" onChange={(value) => setField('number', value)} placeholder="123" value={values.number} /></div><SupportMapPlaceholder coordinates={values.coordinates} onSelect={(coordinates) => setValues((current) => ({ ...current, coordinates }))} /></div></FormCard></div><aside className="grid content-start gap-7"><SupportScheduleCard onChange={(schedules) => setValues((current) => ({ ...current, schedules }))} schedule={values.schedules} /><FormCard icon={Image} title="Foto do Local"><SupportPhotoUpload existingImage={isPhotoRemovalRequested ? null : primaryImage} file={photo} onFileChange={(file) => { setPhoto(file); if (file) setIsPhotoRemovalRequested(false) }} onRemoveImage={() => { setIsPhotoRemovalRequested(true); setPhoto(null) }} /></FormCard></aside><footer className="flex flex-col-reverse gap-3 xl:col-span-2 xl:flex-row xl:justify-end"><button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-[#bbcac4]/50 bg-white px-7 text-base font-bold text-muted-strong" onClick={() => navigate('/radar-de-apoio')} type="button"><X size={17} />Cancelar</button><button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-teal px-8 text-base font-bold text-white disabled:opacity-60" disabled={isSaving} type="submit"><Save size={17} />{isSaving ? 'Salvando...' : 'Salvar cadastro'}</button></footer></form>}</main></AppLayout>
}

function FormCard({ children, icon: Icon, title }: { children: ReactNode; icon: typeof Info; title: string }) { return <section className="grid gap-5 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.45)]"><h1 className="flex items-center gap-3 border-b border-line pb-4 font-display text-2xl text-admin-text"><Icon className="text-brand-teal" size={21} />{title}</h1>{children}</section> }
function TextInput({ error, label, onChange, ...props }: { error?: string; label: string; onChange: (value: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) { return <label className="grid gap-2 text-sm font-bold text-admin-text">{label}<input className="h-12 rounded-xl border border-[#bbcac4]/35 bg-white px-4 text-base font-normal text-admin-text outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20 read-only:bg-[#edf0ef] read-only:text-muted" onChange={(event) => onChange(event.target.value)} {...props} />{error ? <span className="text-sm font-semibold text-red-700" role="alert">{error}</span> : null}</label> }
