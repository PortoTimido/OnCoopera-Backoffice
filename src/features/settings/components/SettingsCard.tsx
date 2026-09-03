import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'

export function SettingsCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cx(
        'relative overflow-hidden rounded-[36px] bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.2)]',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
        className,
      )}
    >
      <div className="relative z-1">{children}</div>
    </section>
  )
}
