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
    <label className={cx('grid gap-[clamp(8px,0.625vw,14px)] text-[clamp(12px,0.94vw,17px)] font-semibold text-ink-strong', className)}>
      <span>{label}</span>
      <span className="relative block">
        <input
          className={cx(
            'h-[clamp(44px,3.44vw,70px)] w-full rounded-xl border-2 border-[#e9efeb] bg-surface-mint px-[clamp(18px,1.4vw,29px)] text-[clamp(16px,1.25vw,24px)] text-admin-text outline-none shadow-[inset_3px_3px_6px_2px_rgba(0,0,0,0.04),inset_-3px_-3px_6px_2px_rgba(255,255,255,0.7)] transition placeholder:text-[#6b7280] focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20',
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
