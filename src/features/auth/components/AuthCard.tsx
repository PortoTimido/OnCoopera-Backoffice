import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'

type AuthCardVariant = 'login' | 'recovery' | 'reset'

const cardClassName: Record<AuthCardVariant, string> = {
  login: 'rounded-[36px] border border-line bg-white p-[41px] shadow-clay-teal',
  recovery: 'rounded-[32px] border border-line/50 bg-surface-clay px-[34px] pb-[50px] pt-[34px] shadow-clay-sage-soft',
  reset: 'rounded-[32px] border-2 border-line bg-white px-[34px] pb-[50px] pt-[34px] shadow-clay-sage',
}

export function AuthCard({
  children,
  className,
  variant,
}: {
  children: ReactNode
  className?: string
  variant: AuthCardVariant
}) {
  return <div className={cx('w-full max-w-[448px]', cardClassName[variant], className)}>{children}</div>
}
