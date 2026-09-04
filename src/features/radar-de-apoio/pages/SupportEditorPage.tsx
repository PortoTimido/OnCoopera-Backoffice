import { useMemo, useState } from 'react'
import { Image, Info, MapPinned, Save, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { SupportMapPlaceholder } from '../components/SupportMapPlaceholder'
import { SupportPhotoUpload } from '../components/SupportPhotoUpload'
import { SupportScheduleCard } from '../components/SupportScheduleCard'
import { demoSupportResources, defaultSupportSchedule } from '../model/supportDemoData'
import { supportCategoryLabels, supportCategories, type SupportFormValues } from '../model/supportTypes'

type FieldName = keyof Omit<SupportFormValues, 'coordinates'>
type FormErrors = Partial<Record<FieldName, string>>

const emptyValues: SupportFormValues = { name: '', category: 'CLINICA', description: '', address: '', city: '', state: '', coordinates: { latitude: -15.7801, longitude: -47.9292 } }

function getInitialValues(supportId?: string): SupportFormValues {
  const support = demoSupportResources.find((resource) => resource.id === supportId)
  if (!support) return emptyValues
  return { name: support.name, category: support.category, description: support.description, address: support.address, city: support.city, state: support.state, coordinates: support.coordinates }
}

export function SupportEditorPage() {
  const { supportId } = useParams()
  const navigate = useNavigate()
  const existingSupport = useMemo(() => demoSupportResources.find((resource) => resource.id === supportId), [supportId])
  const [values, setValues] = useState<SupportFormValues>(() => getInitialValues(supportId))
  const [errors, setErrors] = useState<FormErrors>({})
  const [notice, setNotice] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const user = getStoredUser()
  const isEditing = Boolean(existingSupport)

  function setField(field: FieldName, value: string) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setNotice('') }
  function validate() { const next: FormErrors = {}; if (!values.name.trim()) next.name = 'Informe o nome do local.'; if (!values.address.trim()) next.address = 'Informe o endereço completo.'; if (!values.city.trim()) next.city = 'Informe a cidade.'; if (!values.state.trim()) next.state = 'Informe o estado.'; setErrors(next); return Object.keys(next).length === 0 }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validate()) { setNotice('Revise os campos obrigatórios antes de salvar.'); return }; setNotice(`${isEditing ? 'Alterações preparadas' : 'Cadastro preparado'} com sucesso. Os dados não são persistidos nesta etapa.`) }

  return <AppLayout activeItem="Radar de Apoio" user={user}><main className="flex min-h-0 flex-1 flex-col overflow-auto p-6 sm:p-10 lg:p-10" data-figma-node-id="327:503"><nav aria-label="Breadcrumb" className="mb-5 text-base text-muted"><Link className="hover:text-brand-teal" to="/radar-de-apoio">Radar de Apoio</Link><span className="px-2" aria-hidden="true">›</span><span className="font-semibold text-brand-teal">{isEditing ? 'Editar cadastro' : 'Novo Cadastro'}</span></nav><form className="grid gap-7 xl:grid-cols-[minmax(0,1.9fr)_minmax(250px,1fr)]" noValidate onSubmit={handleSubmit}>
    <div className="grid content-start gap-7">
      <FormCard icon={Info} title="Informações Gerais"><div className="grid gap-5"><TextInput error={errors.name} label="Nome do Local *" onChange={(value) => setField('name', value)} placeholder="Ex: Hospital do Câncer" value={values.name} /><label className="grid gap-2 text-sm font-bold text-admin-text">Categoria *<select aria-label="Categoria" className="h-12 rounded-xl border border-[#bbcac4]/35 bg-white px-4 text-base font-normal text-admin-text outline-none focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => setField('category', event.target.value)} value={values.category}>{supportCategories.map((category) => <option key={category} value={category}>{supportCategoryLabels[category]}</option>)}</select></label><label className="grid gap-2 text-sm font-bold text-admin-text">Descrição (Opcional)<textarea className="min-h-28 resize-y rounded-xl border border-[#bbcac4]/35 bg-white px-4 py-3 text-base font-normal text-admin-text outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => setField('description', event.target.value)} placeholder="Breve descrição sobre os serviços oferecidos..." value={values.description} /></label></div></FormCard>
      <FormCard icon={MapPinned} title="Endereço e Geolocalização"><div className="grid gap-5"><TextInput error={errors.address} label="Endereço Completo *" onChange={(value) => setField('address', value)} placeholder="Rua, Número, Bairro" value={values.address} /><div className="grid gap-5 sm:grid-cols-2"><TextInput error={errors.city} label="Cidade *" onChange={(value) => setField('city', value)} placeholder="Cidade" value={values.city} /><TextInput error={errors.state} label="Estado *" maxLength={2} onChange={(value) => setField('state', value.toUpperCase())} placeholder="UF" value={values.state} /></div><SupportMapPlaceholder coordinates={values.coordinates} onSelect={(coordinates) => { setValues((current) => ({ ...current, coordinates })); setNotice('Localização atualizada no mapa de demonstração.') }} /></div></FormCard>
    </div>
    <aside className="grid content-start gap-7"><SupportScheduleCard schedule={existingSupport?.schedule ?? defaultSupportSchedule} /><FormCard icon={Image} title="Foto do Local"><SupportPhotoUpload onFileChange={setPhoto} />{photo ? <p className="sr-only">Imagem selecionada: {photo.name}</p> : null}</FormCard></aside>
    <footer className="flex flex-col-reverse gap-3 xl:col-span-2 xl:flex-row xl:justify-end"><button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-[#bbcac4]/50 bg-white px-7 text-base font-bold text-muted-strong shadow-[3px_3px_0_rgba(187,202,196,0.45)] transition hover:bg-surface-soft" onClick={() => navigate('/radar-de-apoio')} type="button"><X size={17} />Cancelar</button><button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-teal px-8 text-base font-bold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3),4px_4px_0_rgba(0,81,67,0.9)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" type="submit"><Save size={17} />Salvar cadastro</button></footer>
    {notice ? <p className={Object.keys(errors).length ? 'xl:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700' : 'xl:col-span-2 rounded-xl bg-brand-mint/15 px-4 py-3 text-sm font-semibold text-brand-teal'} role="status">{notice}</p> : null}
  </form></main></AppLayout>
}

function FormCard({ children, icon: Icon, title }: { children: React.ReactNode; icon: typeof Info; title: string }) { return <section className="grid gap-5 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.45)]"><h1 className="flex items-center gap-3 border-b border-line pb-4 font-display text-2xl text-admin-text"><Icon className="text-brand-teal" size={21} />{title}</h1>{children}</section> }
function TextInput({ error, label, onChange, ...props }: { error?: string; label: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) { return <label className="grid gap-2 text-sm font-bold text-admin-text">{label}<input className="h-12 rounded-xl border border-[#bbcac4]/35 bg-white px-4 text-base font-normal text-admin-text outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => onChange(event.target.value)} {...props} />{error ? <span className="text-sm font-semibold text-red-700" role="alert">{error}</span> : null}</label> }
