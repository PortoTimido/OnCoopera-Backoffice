import type { ReactNode } from 'react'

export function DashboardChartCard({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-admin-card sm:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(0,0,0,0.02)]" />
      <div className="relative flex items-center justify-between gap-3">
        <h2 className="font-display text-xl leading-6 text-admin-text">{title}</h2>
        {action}
      </div>
      <div className="relative mt-5">{children}</div>
    </section>
  )
}
