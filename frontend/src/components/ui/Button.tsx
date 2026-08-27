import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cx } from '../../lib/cx'

type ButtonTone = 'teal' | 'dark' | 'soft'

const toneClassName: Record<ButtonTone, string> = {
  teal:
    'bg-brand-mint text-brand-teal-deep shadow-clay-teal-strong hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(0,107,90,0.2)]',
  dark:
    'bg-brand-teal text-white shadow-button-dark hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#005143]',
  soft:
    'border-2 border-line bg-white text-ink shadow-[3px_3px_0_#bbcac4] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#bbcac4]',
}

type ButtonContentProps = {
  children: ReactNode
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

function ButtonContent({ children, icon, iconPosition = 'right' }: ButtonContentProps) {
  const iconElement =
    typeof icon === 'string' ? (
      <img className="h-5 w-5 shrink-0" src={icon} alt="" aria-hidden="true" />
    ) : icon ? (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
    ) : null

  return (
    <>
      {iconElement && iconPosition === 'left' ? iconElement : null}
      <span>{children}</span>
      {iconElement && iconPosition === 'right' ? iconElement : null}
    </>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonContentProps & {
    tone?: ButtonTone
  }

export function Button({ children, className, icon, iconPosition, tone = 'teal', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex h-15 w-full items-center justify-center gap-3 rounded-3xl px-6 text-base font-bold transition duration-200 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand-mint disabled:opacity-60',
        toneClassName[tone],
        className,
      )}
      type={type}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </button>
  )
}

type LinkButtonProps = LinkProps &
  ButtonContentProps & {
    tone?: ButtonTone
  }

export function LinkButton({ children, className, icon, iconPosition, tone = 'teal', ...props }: LinkButtonProps) {
  return (
    <Link
      className={cx(
        'inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-bold transition duration-200 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand-mint',
        toneClassName[tone],
        className,
      )}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </Link>
  )
}
