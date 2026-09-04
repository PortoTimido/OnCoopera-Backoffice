import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { SupportFilters } from '../components/SupportFilters'
import { SupportListTable } from '../components/SupportListTable'
import { demoSupportResources } from '../model/supportDemoData'
import { supportCategories, type SupportCategory } from '../model/supportTypes'

function getCategory(value: string | null): SupportCategory | undefined { return supportCategories.includes(value as SupportCategory) ? value as SupportCategory : undefined }

export function SupportListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '')
  const category = getCategory(searchParams.get('categoria'))
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const search = searchParams.get('search') ?? ''
  const user = getStoredUser()
  const updateParams = useCallback((values: Record<string, string | number | null>) => { const next = new URLSearchParams(searchParams); Object.entries(values).forEach(([key, value]) => { if (value === null || value === '') next.delete(key); else next.set(key, String(value)) }); setSearchParams(next) }, [searchParams, setSearchParams])
  useEffect(() => { const timeout = window.setTimeout(() => { if (query !== search) updateParams({ search: query.trim() || null, page: null }) }, 300); return () => window.clearTimeout(timeout) }, [query, search, updateParams])
  const filtered = demoSupportResources.filter((resource) => (!category || resource.category === category) && `${resource.name} ${resource.address} ${resource.city}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  return <AppLayout activeItem="Radar de Apoio" user={user}><main className="flex min-h-0 flex-1 flex-col gap-8 overflow-auto p-6 sm:p-10 lg:p-12" data-figma-node-id="327:306"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><h1 className="font-display text-[length:var(--admin-list-title-size)] leading-[var(--admin-list-title-line-height)] text-admin-text">Radar de Apoio</h1><Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-base text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" to="/radar-de-apoio/novo"><Plus size={17} />Novo apoio</Link></header><SupportFilters activeCategory={category} onCategoryChange={(value) => updateParams({ categoria: value ?? null, page: null })} onQueryChange={setQuery} query={query} /><SupportListTable onPageChange={(value) => updateParams({ page: value })} page={page} resources={filtered} totalPages={3} /></main></AppLayout>
}
