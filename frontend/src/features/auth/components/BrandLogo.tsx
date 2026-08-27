import { Link } from 'react-router-dom'
import { cx } from '../../../lib/cx'
import { authAssets } from '../assets'

type BrandLogoProps = {
  variant?: 'light' | 'teal'
}

export function BrandLogo({ variant = 'light' }: BrandLogoProps) {
  const isLight = variant === 'light'

  return (
    <Link
      className={cx('relative z-10 inline-flex w-fit items-center gap-4 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand-mint')}
      to="/login"
      aria-label="Ir para login"
    >
      <span
        className={cx(
          'grid h-12 w-12 place-items-center rounded-2xl',
          isLight ? 'bg-white' : 'bg-brand-mint',
        )}
        aria-hidden="true"
      >
        <img className="h-4 w-5.5" src={isLight ? authAssets.logoWaveDark : authAssets.logoWaveTeal} alt="" />
      </span>
      <span className={cx('font-serif text-2xl leading-none', isLight ? 'text-white' : 'text-brand-mint')}>
        OnCoopera
      </span>
    </Link>
  )
}
