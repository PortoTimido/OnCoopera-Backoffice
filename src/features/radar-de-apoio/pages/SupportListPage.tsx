import { useCallback, useEffect, useState } from 'react'
import { Building2, Car, HandHeart, ListFilter, Plus, Stethoscope } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { SearchFilterBar, type SearchFilterOption } from '../../backoffice/components/SearchFilterBar'
import { listBackofficeSupports, updateBackofficeSupport } from '../api/supportApi'
import { SupportListTable } from '../components/SupportListTable'
import { supportCategories, type PaginatedSupports, type SupportCategory, type SupportResource } from '../model/supportTypes'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'

const emptyResult: PaginatedSupports = { data: [], page: 1, pageSize: 10, total: 0, totalPages: 1 }
const supportFilters: Array<SearchFilterOption<SupportCategory>> = [
  { label: 'Todos', icon: ListFilter },
  { label: 'Clínicas', value: 'CLINICA', icon: Building2 },
  { label: 'ONGs', value: 'ONG', icon: HandHeart },
  { label: 'Transporte', value: 'TRANSPORTE', icon: Car },
  { label: 'Psicólogo', value: 'PSICOLOGO', icon: Stethoscope },
]
function getCategory(value: string | null): SupportCategory | undefined { return supportCategories.includes(value as SupportCategory) ? value as SupportCategory : undefined }

export function SupportListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '')
  const [result, setResult] = useState<PaginatedSupports>(emptyResult)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [supportToDeactivate, setSupportToDeactivate] = useState<SupportResource | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const category = getCategory(searchParams.get('categoria'))
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const search = searchParams.get('search') ?? ''
  const user = getStoredUser()
  const updateParams = useCallback((values: Record<string, string | number | null>) => { const next = new URLSearchParams(searchParams); Object.entries(values).forEach(([key, value]) => { if (value === null || value === '') next.delete(key); else next.set(key, String(value)) }); setSearchParams(next) }, [searchParams, setSearchParams])
  useEffect(() => { const timeout = window.setTimeout(() => { if (query !== search) updateParams({ search: query.trim() || null, page: null }) }, 300); return () => window.clearTimeout(timeout) }, [query, search, updateParams])
  useEffect(() => { let active = true; async function loadSupports() { setIsLoading(true); setError(''); try { const data = await listBackofficeSupports({ page, pageSize: 10, search: search || undefined, tipoApoio: category }); if (active) setResult(data) } catch (loadError) { if (active) { setResult(emptyResult); setError(getApiErrorMessage(loadError)) } } finally { if (active) setIsLoading(false) } } void loadSupports(); return () => { active = false } }, [category, page, reloadVersion, search])
  async function confirmDelete() { if (!supportToDeactivate) return; setIsDeleting(true); setError(''); try { await updateBackofficeSupport(supportToDeactivate.id, { status: supportToDeactivate.status === 'ATIVO' ? 'DESATIVADO' : 'ATIVO' }); setSupportToDeactivate(null); setReloadVersion((current) => current + 1) } catch (deleteError) { setError(getApiErrorMessage(deleteError)) } finally { setIsDeleting(false) } }
  return <AppLayout activeItem="Radar de Apoio" user={user}><main className="flex min-h-0 flex-1 flex-col gap-8 overflow-auto p-6 sm:p-10 lg:p-12" data-figma-node-id="327:306"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-display text-[length:var(--admin-list-title-size)] leading-[var(--admin-list-title-line-height)] text-admin-text">Radar de Apoio</h1><p className="mt-1 text-sm text-muted">Gerencie locais e serviços de apoio cadastrados.</p></div><Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-base text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" to="/radar-de-apoio/novo"><Plus size={17} />Novo apoio</Link></header><SearchFilterBar activeValue={category} filtersLabel="Filtrar apoios" onFilterChange={(value) => updateParams({ categoria: value ?? null, page: null })} onQueryChange={setQuery} options={supportFilters} query={query} searchLabel="Pesquisar apoios" searchPlaceholder="Pesquisar..." />{error ? <div className="flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert"><span>{error}</span><button className="rounded-lg bg-white px-3 py-2" onClick={() => setReloadVersion((current) => current + 1)} type="button">Tentar novamente</button></div> : null}{isLoading ? <section className="rounded-3xl bg-white px-4 py-12 text-center text-sm text-muted shadow-[4px_4px_0_rgba(187,202,196,0.2)]">Carregando apoios...</section> : <SupportListTable onDelete={setSupportToDeactivate} onPageChange={(value) => updateParams({ page: value })} page={result.page} resources={result.data} totalPages={result.totalPages} />}</main><ConfirmationModal confirmLabel={supportToDeactivate?.status === 'ATIVO' ? 'Desativar apoio' : 'Ativar apoio'} description={supportToDeactivate?.status === 'ATIVO' ? `O apoio \"${supportToDeactivate.nome}\" deixará de aparecer para os usuários.` : `O apoio \"${supportToDeactivate?.nome ?? ''}\" voltará a aparecer para os usuários.`} isConfirming={isDeleting} isOpen={Boolean(supportToDeactivate)} onCancel={() => setSupportToDeactivate(null)} onConfirm={confirmDelete} title={supportToDeactivate?.status === 'ATIVO' ? 'Desativar apoio?' : 'Ativar apoio?'} /></AppLayout>
}
