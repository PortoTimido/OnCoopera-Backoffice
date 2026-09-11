import { useCallback, useEffect, useState } from 'react'
import { Eye, ListFilter, Pencil, Plus, ShieldBan, ToggleLeft, ToggleRight, UserCheck, UserX } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { listBackofficeUsuarios, updateBackofficeAdministrator, type PaginatedUsuarios } from '../../backoffice/api/backofficeApi'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { SearchFilterBar, type SearchFilterOption } from '../../backoffice/components/SearchFilterBar'
import { getStoredUser } from '../../auth/model/authSession'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { permissionsLabel } from '../model/administrator'

const emptyResult: PaginatedUsuarios = { data: [], page: 1, pageSize: 10, total: 0, totalPages: 1 }
const statusLabel = { ATIVO: 'Ativo', INATIVO: 'Inativo', BLOQUEADO: 'Bloqueado' }
type UserStatusFilter = 'ATIVO' | 'INATIVO' | 'BLOQUEADO'
const userStatusFilters: Array<SearchFilterOption<UserStatusFilter>> = [
  { label: 'Todos', icon: ListFilter },
  { label: 'Ativos', value: 'ATIVO', icon: UserCheck },
  { label: 'Inativos', value: 'INATIVO', icon: UserX },
  { label: 'Bloqueados', value: 'BLOQUEADO', icon: ShieldBan },
]
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) : 'Nunca acessou' }

export function UserListPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('search') ?? '')
  const [result, setResult] = useState<PaginatedUsuarios>(emptyResult)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [administratorToDeactivate, setAdministratorToDeactivate] = useState<PaginatedUsuarios['data'][number] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
  const search = params.get('search') ?? ''
  const status = params.get('status') as UserStatusFilter | null
  const updateParams = useCallback((values: Record<string, string | number | null>) => { const next = new URLSearchParams(params); Object.entries(values).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key)); setParams(next) }, [params, setParams])
  useEffect(() => { const timeout = window.setTimeout(() => { if (query !== search) updateParams({ search: query.trim() || null, page: null }) }, 300); return () => window.clearTimeout(timeout) }, [query, search, updateParams])
  useEffect(() => { let active = true; async function load() { setIsLoading(true); setError(''); try { const data = await listBackofficeUsuarios({ page, pageSize: 10, search: search || undefined, status: status ?? undefined, tipo: 'ADMINISTRADOR' }); if (active) setResult(data) } catch (loadError) { if (active) { setResult(emptyResult); setError(getApiErrorMessage(loadError)) } } finally { if (active) setIsLoading(false) } } void load(); return () => { active = false } }, [page, reload, search, status])
  async function confirmDelete() { if (!administratorToDeactivate) return; setIsDeleting(true); setError(''); try { await updateBackofficeAdministrator(administratorToDeactivate.id, { status: administratorToDeactivate.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' }); setAdministratorToDeactivate(null); setReload((value) => value + 1) } catch (deleteError) { setError(getApiErrorMessage(deleteError)) } finally { setIsDeleting(false) } }
  return (
    <AppLayout activeItem="Usuários" user={getStoredUser()}>
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-auto p-6 sm:p-10 lg:p-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-display text-[length:var(--admin-list-title-size)] leading-[var(--admin-list-title-line-height)] text-admin-text">Usuários</h1><p className="mt-1 text-sm text-muted">Gerencie as contas administrativas do sistema.</p></div><Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-base text-white" to="/usuarios/novo"><Plus size={17} />Novo administrador</Link></header>
        <SearchFilterBar activeValue={status ?? undefined} filtersLabel="Filtrar administradores" onFilterChange={(value) => updateParams({ status: value ?? null, page: null })} onQueryChange={setQuery} options={userStatusFilters} query={query} searchLabel="Pesquisar administradores" searchPlaceholder="Pesquisar por nome ou e-mail" />
        {error ? <div className="flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert"><span>{error}</span><button className="rounded-lg bg-white px-3 py-2" onClick={() => setReload((value) => value + 1)} type="button">Tentar novamente</button></div> : null}
        {isLoading ? <section className="rounded-3xl bg-white px-4 py-12 text-center text-sm text-muted">Carregando administradores...</section> : <UserTable page={result.page} users={result.data} totalPages={result.totalPages} onDelete={setAdministratorToDeactivate} onPageChange={(next) => updateParams({ page: next })} />}
      </main>
      <ConfirmationModal confirmLabel={administratorToDeactivate?.status === 'ATIVO' ? 'Inativar administrador' : 'Ativar administrador'} description={administratorToDeactivate?.status === 'ATIVO' ? `O administrador \"${administratorToDeactivate.nome}\" perderá o acesso ao sistema.` : `O administrador \"${administratorToDeactivate?.nome ?? ''}\" voltará a ter acesso ao sistema.`} isConfirming={isDeleting} isOpen={Boolean(administratorToDeactivate)} onCancel={() => setAdministratorToDeactivate(null)} onConfirm={confirmDelete} title={administratorToDeactivate?.status === 'ATIVO' ? 'Inativar administrador?' : 'Ativar administrador?'} />
    </AppLayout>
  )
}

function UserTable({ users, page, totalPages, onDelete, onPageChange }: { users: PaginatedUsuarios['data']; page: number; totalPages: number; onDelete: (administrator: PaginatedUsuarios['data'][number]) => void; onPageChange: (page: number) => void }) {
  return <section className="overflow-hidden rounded-3xl bg-white shadow-[4px_4px_0_rgba(187,202,196,0.2)]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-surface-soft text-xs font-bold uppercase tracking-[0.6px] text-muted-strong"><tr><th className="px-4 py-4">Usuário</th><th className="px-4 py-4">Contato</th><th className="px-4 py-4">Permissões</th><th className="px-4 py-4">Último acesso</th><th className="px-4 py-4">Status</th><th className="w-32 px-4 py-4 text-center">Ações</th></tr></thead><tbody>{users.length === 0 ? <tr><td className="px-4 py-12 text-center text-sm text-muted" colSpan={6}>Nenhum administrador encontrado.</td></tr> : users.map((administrator) => { const isActive = administrator.status === 'ATIVO'; return <tr className="border-t border-[#bbcac4]/15" key={administrator.id}><td className="px-4 py-4"><p className="font-semibold text-admin-text">{administrator.nome}</p><p className="text-xs text-muted">{administrator.login}</p></td><td className="px-4 py-4 text-sm text-muted-strong">{administrator.email}</td><td className="px-4 py-4 text-sm text-muted-strong">{permissionsLabel(administrator.permissoesAdministrativas, administrator.perfisAdministrativos)}</td><td className="px-4 py-4 text-sm text-muted">{formatDate(administrator.ultimoAcesso)}</td><td className="px-4 py-4"><span className={isActive ? 'rounded-full bg-brand-mint/20 px-3 py-1 text-xs font-semibold text-brand-teal' : 'rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700'}>{statusLabel[administrator.status]}</span></td><td className="px-4 py-4"><div className="flex justify-center gap-1"><Link aria-label={`Visualizar ${administrator.nome}`} className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong hover:bg-surface-soft" to={`/usuarios/${administrator.id}/editar`}><Eye size={16} /></Link><Link aria-label={`Editar ${administrator.nome}`} className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong hover:bg-surface-soft" to={`/usuarios/${administrator.id}/editar`}><Pencil size={16} /></Link><button aria-label={`${isActive ? 'Inativar' : 'Ativar'} ${administrator.nome}`} className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong hover:bg-surface-soft hover:text-brand-teal" onClick={() => onDelete(administrator)} type="button">{isActive ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}</button></div></td></tr> })}</tbody></table></div><footer className="flex items-center justify-between border-t border-[#bbcac4]/15 bg-surface-soft px-4 py-3"><p className="text-xs text-muted">Página {page} de {totalPages}</p><div className="flex items-center gap-2"><button aria-label="Página anterior" className="rounded px-2 text-muted-strong disabled:opacity-40" disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">‹</button><span className="grid h-7 min-w-7 place-items-center rounded-full bg-brand-teal px-2 text-xs text-white">{page}</span><button aria-label="Próxima página" className="rounded px-2 text-muted-strong disabled:opacity-40" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button">›</button></div></footer></section>
}
