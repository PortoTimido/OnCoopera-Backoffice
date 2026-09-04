import { Building2, Car, HandHeart, Search, Stethoscope } from 'lucide-react'
import { cx } from '../../../lib/cx'
import type { SupportCategory } from '../model/supportTypes'

type Filter = { label: string; value?: SupportCategory; icon?: typeof Building2 }

const filters: Filter[] = [
  { label: 'Todos' },
  { label: 'Clínicas', value: 'CLINICA', icon: Building2 },
  { label: 'ONGs', value: 'ONG', icon: HandHeart },
  { label: 'Transporte', value: 'TRANSPORTE', icon: Car },
  { label: 'Psicólogo', value: 'PSICOLOGO', icon: Stethoscope },
]

export function SupportFilters({ activeCategory, onCategoryChange, query, onQueryChange }: { activeCategory?: SupportCategory; onCategoryChange: (category?: SupportCategory) => void; query: string; onQueryChange: (query: string) => void }) {
  return <section className="flex flex-col gap-5 rounded-3xl bg-surface-soft p-5 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)] lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar apoios">
      {filters.map((filter) => {
        const Icon = filter.icon
        const selected = activeCategory === filter.value || (!activeCategory && !filter.value)
        return <button aria-selected={selected} className={cx('inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-brand-mint', selected ? 'bg-brand-mint text-brand-teal-deep shadow-[2px_2px_0_rgba(0,107,90,0.15)]' : 'bg-[#e0e3e2] text-muted-strong hover:bg-white')} key={filter.label} onClick={() => onCategoryChange(filter.value)} role="tab" type="button">
          {Icon ? <Icon aria-hidden="true" size={15} strokeWidth={2} /> : null}{filter.label}
        </button>
      })}
    </div>
    <label className="relative block w-full max-w-[var(--admin-search-max)]">
      <span className="sr-only">Pesquisar apoios</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-strong" size={18} strokeWidth={2} />
      <input className="h-12 w-full rounded-xl border border-[#bbcac4]/25 bg-white px-12 text-base text-admin-text shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)] outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20" onChange={(event) => onQueryChange(event.target.value)} placeholder="Pesquisar..." value={query} />
    </label>
  </section>
}
