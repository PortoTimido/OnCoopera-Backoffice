import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../../lib/cx'

export function AdminCreateInput({
  className,
  label,
  rightElement,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  rightElement?: ReactNode
}) {
  return (
    <label className={cx('grid gap-2 text-sm font-semibold text-ink-strong', className)}>
      <span>{label}</span>
      <span className="relative block">
        <input
          className={cx(
            'h-13 w-full rounded-xl border-2 border-[#e9efeb] bg-surface-mint px-5 text-base text-admin-text outline-none shadow-[inset_3px_3px_6px_2px_rgba(0,0,0,0.04),inset_-3px_-3px_6px_2px_rgba(255,255,255,0.7)] transition placeholder:text-[#6b7280] read-only:text-muted-strong focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20',
            rightElement ? 'pr-[50px]' : undefined,
          )}
          {...props}
        />
        {rightElement ? (
          <span className="absolute right-4 top-1/2 grid h-5 w-[22px] -translate-y-1/2 place-items-center">{rightElement}</span>
        ) : null}
      </span>
    </label>
  )
}
