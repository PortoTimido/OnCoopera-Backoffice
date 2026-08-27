import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

type TextFieldSurface = 'soft' | 'mint' | 'white'

const surfaceClassName: Record<TextFieldSurface, string> = {
  soft: 'border-2 border-line bg-surface-soft shadow-input-inset',
  mint: 'border-2 border-line bg-surface-mint shadow-input-inset',
  white: 'border-0 bg-white shadow-none',
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  leftIcon?: ReactNode
  onRightIconClick?: () => void
  rightIcon?: ReactNode
  rightIconButtonLabel?: string
  surface?: TextFieldSurface
}

export function TextField({
  className,
  id,
  label,
  leftIcon,
  onRightIconClick,
  rightIcon,
  rightIconButtonLabel,
  surface = 'soft',
  type = 'text',
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const renderIcon = (icon: ReactNode) => {
    if (typeof icon === 'string') {
      return <img className="h-5 w-5" src={icon} alt="" aria-hidden="true" />
    }

    return icon
  }

  return (
    <div className={cx('grid gap-2.5 text-sm font-semibold text-ink', className)}>
      <label htmlFor={inputId}>{label}</label>
      <span className="relative block">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center text-muted" aria-hidden="true">
            {renderIcon(leftIcon)}
          </span>
        ) : null}
        <input
          className={cx(
            'h-16 w-full rounded-2xl px-5 text-base font-normal text-ink outline-none transition placeholder:text-[#bbcac4] focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20',
            leftIcon ? 'pl-14' : undefined,
            rightIcon ? 'pr-14' : undefined,
            surfaceClassName[surface],
          )}
          id={inputId}
          type={type}
          {...props}
        />
        {rightIcon && onRightIconClick ? (
          <button
            aria-label={rightIconButtonLabel}
            className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-white/70 hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-brand-mint"
            onClick={onRightIconClick}
            type="button"
          >
            {renderIcon(rightIcon)}
          </button>
        ) : rightIcon ? (
          <span className="pointer-events-none absolute right-5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center text-muted" aria-hidden="true">
            {renderIcon(rightIcon)}
          </span>
        ) : null}
      </span>
    </div>
  )
}
