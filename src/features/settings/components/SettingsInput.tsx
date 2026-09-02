import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../../lib/cx'

export function SettingsInput({
  className,
  label,
  rightElement,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  rightElement?: ReactNode
}) {
  return (
    <label className={cx('grid gap-1 text-xs font-normal uppercase tracking-[0.6px] text-muted-strong', className)}>
      <span>{label}</span>
      <span className="relative block">
        <input
          className={cx(
            'h-10 w-full rounded-[32px] border-0 bg-[#e6e9e8] px-4 text-sm normal-case tracking-normal text-admin-text outline-none shadow-[2px_2px_0_rgba(187,202,196,0.2),inset_2px_2px_4px_rgba(215,219,218,0.5)] transition placeholder:text-[#6b7280] focus:ring-4 focus:ring-brand-mint/20',
            rightElement ? 'pr-12' : undefined,
          )}
          {...props}
        />
        {rightElement ? (
          <span className="absolute right-4 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center">{rightElement}</span>
        ) : null}
      </span>
    </label>
  )
}
