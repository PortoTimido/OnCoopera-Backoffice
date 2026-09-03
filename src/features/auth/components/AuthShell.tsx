import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import { authAssets } from '../assets'
import { BrandLogo } from './BrandLogo'

type AuthShellVariant = 'login' | 'illustrated'

type SideCopy = {
  title: string
  description: string
}

type AuthShellProps = {
  children: ReactNode
  copy: SideCopy
  dataNodeId: string
  image?: string
  imagePresentation?: 'figma' | 'full'
  rightSurface?: 'mint' | 'clay'
  showAdminBadge?: boolean
  sideSize?: 'default' | 'login'
  variant: AuthShellVariant
}

export function AuthShell({
  children,
  copy,
  dataNodeId,
  image,
  imagePresentation = 'figma',
  rightSurface = 'mint',
  showAdminBadge = false,
  sideSize = 'default',
  variant,
}: AuthShellProps) {
  const isLogin = variant === 'login'
  const shouldUseLoginSideSize = isLogin || sideSize === 'login'

  return (
    <main
      className={cx(
        'grid min-h-svh overflow-hidden',
        shouldUseLoginSideSize ? 'lg:grid-cols-[minmax(480px,46.78%)_1fr]' : 'lg:grid-cols-[634px_1fr]',
        isLogin ? 'bg-surface-mint' : 'bg-surface-clay',
      )}
      data-figma-node-id={dataNodeId}
    >
      {isLogin ? (
        <LoginPanel copy={copy} />
      ) : (
        <IllustratedPanel copy={copy} image={image} imagePresentation={imagePresentation} showAdminBadge={showAdminBadge} />
      )}

      <section
        className={cx(
          'relative grid min-h-svh place-items-center px-5 py-10 sm:px-8 lg:px-12',
          rightSurface === 'mint' ? 'bg-surface-mint' : 'bg-surface-clay',
        )}
        aria-label="Acesso administrativo"
      >
        {children}
      </section>
    </main>
  )
}

function LoginPanel({ copy }: { copy: SideCopy }) {
  return (
    <section
      className="relative hidden min-h-svh overflow-hidden bg-[linear-gradient(136.168deg,#3ecfb2_0%,#1a8a78_100%)] px-[88px] py-[75px] text-white lg:flex lg:flex-col lg:justify-between"
      aria-label="Sobre o OnCoopera"
    >
      <div className="pointer-events-none absolute -left-[110px] top-[245px] h-[330px] w-[330px] rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute right-[36px] top-[94px] h-[178px] w-[178px] rounded-full bg-white/15 blur-xl" />
      <div className="pointer-events-none absolute bottom-[122px] right-[63px] h-[92px] w-[92px] rounded-full bg-white/10 blur-lg" />

      <BrandLogo variant="light" />

      <div className="relative z-10 max-w-[496px]">
        <h1 className="font-serif text-5xl font-semibold leading-[1.08] text-white">{copy.title}</h1>
        <p className="mt-6 max-w-[492px] text-lg leading-[1.7] text-white/90">{copy.description}</p>
      </div>

      <p className="relative z-10 text-xs text-white/70">© 2026 OnCoopera. Todos os direitos reservados.</p>
    </section>
  )
}

function IllustratedPanel({
  copy,
  image = authAssets.recoveryBg,
  imagePresentation,
  showAdminBadge,
}: {
  copy: SideCopy
  image?: string
  imagePresentation: 'figma' | 'full'
  showAdminBadge: boolean
}) {
  return (
    <section
      className="relative hidden min-h-svh overflow-hidden bg-surface-illustration px-[76px] py-[58px] lg:flex lg:flex-col lg:justify-between"
      aria-label="Sobre o OnCoopera"
    >
      <img
        className={cx(
          'absolute max-w-none',
          imagePresentation === 'full'
            ? 'left-0 top-0 h-auto w-full object-contain object-top'
            : 'bottom-0 left-[-30%] top-0 h-full w-[160%] object-cover',
        )}
        src={image}
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-brand-teal/20" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(233,239,235,0)_0%,rgba(233,239,235,0)_41.83%,#e9efeb_78.77%)]" />

      <BrandLogo variant="teal" />

      <div className="relative z-10 max-w-[490px] pb-[86px]">
        {showAdminBadge ? (
          <div className="mb-8 inline-flex h-10 items-center gap-2.5 rounded-2xl bg-white px-4 shadow-clay-sage-sm">
            <img className="h-5 w-5" src={authAssets.adminBadge} alt="" aria-hidden="true" />
            <span className="text-sm font-bold text-brand-teal">Acesso Administrativo</span>
          </div>
        ) : null}
        <h1 className={cx('font-serif text-5xl leading-[1.08] text-ink-strong', showAdminBadge ? 'font-semibold' : 'font-normal')}>
          {copy.title}
        </h1>
        <p className="mt-6 text-lg leading-[1.7] text-muted-strong">{copy.description}</p>
      </div>
    </section>
  )
}
