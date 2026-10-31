import type { ReactNode } from 'react'

type ReadOnlySectionProps = {
  children: ReactNode
  title: string
}

export function ReadOnlySection({ children, title }: ReadOnlySectionProps) {
  return (
    <section className="grid gap-5 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.25)]">
      <h2 className="border-b border-line pb-3 font-display text-2xl text-admin-text">{title}</h2>
      {children}
    </section>
  )
}

export function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <dt className="text-sm font-bold text-muted-strong">{label}</dt>
      <dd className="min-h-6 text-sm leading-6 text-admin-text">{value || 'Não informado'}</dd>
    </div>
  )
}

export function ReadOnlyFields({ children }: { children: ReactNode }) {
  return <dl className="grid gap-5 sm:grid-cols-2">{children}</dl>
}
