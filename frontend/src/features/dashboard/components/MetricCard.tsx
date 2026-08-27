import { cx } from '../../../lib/cx'

type MetricTone = 'mint' | 'blue' | 'neutral'

const toneClassName: Record<MetricTone, string> = {
  mint: 'bg-brand-mint/20',
  blue: 'bg-security-blue/20',
  neutral: 'bg-[#e0e3e2]',
}

export function MetricCard({
  icon,
  iconClassName,
  label,
  tone,
  value,
}: {
  icon: string
  iconClassName: string
  label: string
  tone: MetricTone
  value: string
}) {
  return (
    <article className="relative h-[175px] overflow-hidden rounded-3xl bg-white px-6 pb-[27px] pt-6 shadow-admin-card">
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(0,0,0,0.02)]" />
      <div className={cx('grid h-12 w-12 place-items-center rounded-2xl shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]', toneClassName[tone])}>
        <img className={iconClassName} src={icon} alt="" aria-hidden="true" />
      </div>
      <p className="mt-5 text-sm leading-5 text-muted-strong">{label}</p>
      <p className="mt-1 font-display text-[30px] leading-9 text-admin-text">{value}</p>
    </article>
  )
}
