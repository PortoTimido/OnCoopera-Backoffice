import { cx } from '../../../lib/cx'
import { authAssets } from '../assets'

export type PasswordCriterion = {
  label: string
  met: boolean
}

export function PasswordStrength({ criteria, score }: { criteria: PasswordCriterion[]; score: number }) {
  const label = score <= 1 ? 'Fraca' : score === 2 ? 'Média' : score === 3 ? 'Boa' : 'Forte'

  return (
    <section className="rounded-xl border-2 border-line bg-surface-soft px-4 py-2.5" aria-label="Critérios da senha">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold leading-5 text-muted-strong">FORÇA DA SENHA</span>
        <strong className={cx('text-sm font-bold', score >= 4 ? 'text-brand-teal' : score >= 2 ? 'text-warning' : 'text-muted')}>
          {label}
        </strong>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            className={cx('h-2 rounded-full', index < score ? (score >= 4 ? 'bg-brand-teal' : 'bg-warning') : 'bg-line')}
            key={index}
          />
        ))}
      </div>

      <ul className="mt-4 grid gap-2">
        {criteria.map((criterion) => (
          <li className="flex items-center gap-2 text-sm leading-5" key={criterion.label}>
            <img className="h-4 w-4 shrink-0" src={criterion.met ? authAssets.check : authAssets.circle} alt="" aria-hidden="true" />
            <span className={criterion.met ? 'font-semibold text-brand-teal' : 'text-muted'}>{criterion.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
