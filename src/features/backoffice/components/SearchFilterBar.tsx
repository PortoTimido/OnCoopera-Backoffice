import type { ComponentType } from 'react'
import { Search } from 'lucide-react'
import { cx } from '../../../lib/cx'

type FilterIcon = ComponentType<{
  'aria-hidden'?: boolean
  size?: number
  strokeWidth?: number
}>

export type SearchFilterOption<T extends string> = {
  icon: FilterIcon
  label: string
  value?: T
}

type SearchFilterBarProps<T extends string> = {
  activeValue?: T
  filtersLabel: string
  onFilterChange: (value?: T) => void
  onQueryChange: (query: string) => void
  query: string
  searchLabel: string
  searchPlaceholder: string
  options: Array<SearchFilterOption<T>>
}

export function SearchFilterBar<T extends string>({
  activeValue,
  filtersLabel,
  onFilterChange,
  onQueryChange,
  query,
  searchLabel,
  searchPlaceholder,
  options,
}: SearchFilterBarProps<T>) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-[4px_4px_0_rgba(187,202,196,0.2)] lg:flex-row lg:items-center lg:justify-between">
      <label className="relative block w-full max-w-[384px]">
        <span className="sr-only">{searchLabel}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} strokeWidth={2} />
        <input
          className="h-11 w-full rounded-xl border border-line bg-surface-mint pl-11 pr-4 text-sm outline-none placeholder:text-muted focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          value={query}
        />
      </label>

      <div className="flex flex-wrap justify-start gap-2 lg:justify-end" role="tablist" aria-label={filtersLabel}>
        {options.map((option) => {
          const Icon = option.icon
          const selected = activeValue === option.value || (!activeValue && !option.value)

          return (
            <button
              aria-selected={selected}
              className={cx(
                'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-brand-mint',
                selected ? 'bg-brand-mint text-brand-teal-deep shadow-[2px_2px_0_rgba(0,107,90,0.15)]' : 'bg-[#e0e3e2] text-muted-strong hover:bg-surface-soft',
              )}
              key={option.label}
              onClick={() => onFilterChange(option.value)}
              role="tab"
              type="button"
            >
              <Icon aria-hidden={true} size={15} strokeWidth={2} />
              {option.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
