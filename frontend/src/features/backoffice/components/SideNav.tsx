import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cx } from '../../../lib/cx'
import { logout } from '../../auth/api/authApi'
import { clearAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { backofficeAssets } from '../assets'

const navItems = [
  {
    label: 'Início',
    href: '/dashboard',
    icon: backofficeAssets.navHomeInactive,
    activeIcon: backofficeAssets.navHome,
    iconClassName: 'h-[14px] w-[14px]',
  },
  { label: 'Artigos', href: '/artigos', icon: backofficeAssets.navArticles, iconClassName: 'h-5 w-4' },
  { label: 'Radar de Apoio', href: '/radar-de-apoio', icon: backofficeAssets.navRadar, iconClassName: 'h-5 w-5' },
  { label: 'Usuários', href: '/usuarios', icon: backofficeAssets.navUsers, iconClassName: 'h-4 w-[17px]' },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: backofficeAssets.navSettings,
    activeIcon: backofficeAssets.navSettingsActive,
    iconClassName: 'h-4 w-[15px]',
  },
] as const

export function SideNav({ activeItem, user }: { activeItem: string; user: AuthenticatedUser | null }) {
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userName = user?.nome || 'Admin'
  const userEmail = user?.email || 'admin@oncoopera.com'

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      // A sessão local deve sair mesmo quando o refresh cookie já expirou.
    } finally {
      clearAuthSession()
      navigate('/login', { replace: true })
    }
  }

  return (
    <aside className="relative z-2 hidden min-h-svh w-[clamp(180px,15vw,288px)] shrink-0 flex-col justify-between bg-admin-topbar/80 py-[clamp(24px,2vw,39px)] pl-[clamp(12px,1vw,20px)] shadow-admin-sidebar backdrop-blur-xl lg:flex">
      <div className="grid gap-[clamp(30px,2.5vw,48px)]">
        <div className="grid gap-1 px-[clamp(12px,1vw,20px)]">
          <Link className="font-serif text-[clamp(21px,1.5vw,29px)] font-semibold leading-[1.33] text-brand-admin" to="/dashboard">
            OnCoopera
          </Link>
          <p className="text-[clamp(12px,0.9vw,17px)] leading-[1.45] text-muted">Painel Administrativo</p>
        </div>

        <nav className="grid gap-2" aria-label="Navegação principal">
          {navItems.map((item) => {
            const isActive = item.label === activeItem

            return (
              <Link
                className={cx(
                  'flex h-[clamp(36px,3vw,48px)] items-center gap-[clamp(9px,0.75vw,15px)] rounded-l-full px-[clamp(12px,1vw,20px)] text-[clamp(13px,1vw,17px)] leading-[1.5] transition',
                  isActive
                    ? 'bg-white text-brand-admin shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]'
                    : 'text-admin-nav hover:bg-white/60 hover:text-brand-admin',
                )}
                key={item.label}
                to={item.href}
              >
                <img
                  className={cx('shrink-0', item.iconClassName)}
                  src={'activeIcon' in item && isActive ? item.activeIcon : item.icon}
                  alt=""
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="relative pr-0">
        {isUserMenuOpen ? (
          <div className="absolute bottom-[calc(100%+10px)] left-0 right-0 rounded-2xl border border-red-100 bg-red-50 p-2 shadow-[4px_4px_0_rgba(220,38,38,0.08)]">
            <button
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={17} strokeWidth={2} />
              <span>{isLoggingOut ? 'Saindo...' : 'Sair do sistema'}</span>
            </button>
          </div>
        ) : null}

        <button
          aria-expanded={isUserMenuOpen}
          className="flex h-[clamp(36px,3vw,48px)] w-full min-w-0 items-center gap-[clamp(9px,0.75vw,15px)] rounded-l-full px-[clamp(12px,1vw,20px)] text-left transition hover:bg-white/70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint"
          onClick={() => setIsUserMenuOpen((current) => !current)}
          type="button"
        >
          <img
            className="h-[clamp(26px,2.1vw,33px)] w-[clamp(26px,2.1vw,33px)] shrink-0 rounded-full object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            src={backofficeAssets.adminAvatar}
            alt=""
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block truncate text-[clamp(11px,0.9vw,14px)] leading-[1.25] text-admin-text">{userName}</span>
            <span className="block truncate text-[clamp(9px,0.7vw,11px)] leading-[1.25] text-muted">{userEmail}</span>
          </span>
        </button>
      </div>
    </aside>
  )
}
