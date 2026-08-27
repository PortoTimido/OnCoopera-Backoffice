import { backofficeAssets } from '../assets'

export function TopBar() {
  return (
    <header className="relative z-2 flex h-[clamp(64px,5vw,102px)] shrink-0 items-center justify-between bg-admin-topbar px-6 shadow-admin-topbar lg:justify-end lg:px-[clamp(32px,2.5vw,52px)]">
      <div className="lg:hidden">
        <p className="font-serif text-xl font-semibold leading-none text-brand-admin">OnCoopera</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="grid h-[clamp(40px,3.125vw,64px)] w-[clamp(40px,3.125vw,64px)] place-items-center rounded-full transition hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint"
          type="button"
          aria-label="Notificações"
        >
          <img className="h-5 w-4" src={backofficeAssets.topBell} alt="" aria-hidden="true" />
        </button>
        <button
          className="grid h-[clamp(40px,3.125vw,64px)] w-[clamp(40px,3.125vw,64px)] place-items-center rounded-full transition hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint"
          type="button"
          aria-label="Ajuda"
        >
          <img className="h-5 w-5" src={backofficeAssets.topHelp} alt="" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
