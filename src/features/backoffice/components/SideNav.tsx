import { useState } from 'react'
import { Cog, FileText, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Radar, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cx } from '../../../lib/cx'
import { logout } from '../../auth/api/authApi'
import { clearAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { backofficeAssets } from '../assets'

const navItems = [
  { label: 'Início', href: '/dashboard', icon: LayoutDashboard, iconClassName: 'h-5 w-5' },
  { label: 'Artigos', href: '/artigos', icon: FileText, iconClassName: 'h-5 w-5' },
  { label: 'Radar de Apoio', href: '/radar-de-apoio', icon: Radar, iconClassName: 'h-5 w-5' },
  { label: 'Usuários', href: '/usuarios', icon: UsersRound, iconClassName: 'h-5 w-5' },
  { label: 'Configurações', href: '/configuracoes', icon: Cog, iconClassName: 'h-5 w-5' },
] as const

type SideNavProps = {
  activeItem: string
  isCollapsed: boolean
  onToggle: () => void
  user: AuthenticatedUser | null
}

export function SideNav({ activeItem, isCollapsed, onToggle, user }: SideNavProps) {
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
    <aside className={cx('fixed inset-y-0 left-0 z-20 flex flex-col justify-between bg-admin-topbar/80 py-5 shadow-admin-sidebar backdrop-blur-xl transition-[width,padding] duration-200 sm:py-8', isCollapsed ? 'w-[var(--backoffice-sidebar-collapsed-width)] px-2' : 'w-[var(--backoffice-sidebar-width)] pl-4')}>
      <div className={cx('grid', isCollapsed ? 'gap-7' : 'gap-10')}>
        <div className={cx('relative min-h-7', isCollapsed ? 'px-1' : 'px-3 pr-12')}>
          {isCollapsed ? <div className="group relative mx-auto h-7 w-7"><img className="absolute inset-1 h-5 w-5 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0" src={backofficeAssets.logoWaveDark} alt="Logo OnCoopera" /><button aria-label="Expandir barra lateral" className="absolute inset-0 grid place-items-center rounded-md text-muted-strong opacity-0 transition hover:bg-surface-soft focus-visible:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint group-hover:opacity-100" onClick={onToggle} type="button"><PanelLeftOpen size={18} /></button><span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-30 w-max -translate-y-1/2 rounded-md bg-admin-text px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">Abrir barra lateral</span></div> : <div className="flex items-center gap-2"><Link aria-label="Ir para início" className="shrink-0 rounded-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" to="/dashboard"><img className="h-5 w-5" src={backofficeAssets.logoWaveDark} alt="" aria-hidden="true" /></Link><Link className="font-serif text-[21px] font-semibold leading-[1.1] text-brand-admin" to="/dashboard">OnCoopera</Link></div>}
          {!isCollapsed ? <p className="ml-7 mt-1 text-[12px] leading-[1.2] text-muted">Painel Administrativo</p> : null}
          {!isCollapsed ? <div className="absolute right-[8px] top-0">
            <button aria-label={isCollapsed ? 'Expandir barra lateral' : 'Retrair barra lateral'} className="grid h-7 w-7 place-items-center rounded-md text-muted-strong transition hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint" onClick={onToggle} type="button">
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div> : null}
        </div>

        <nav className="grid gap-2" aria-label="Navegação principal">
          {navItems.map((item) => {
            const isActive = item.label === activeItem
            const Icon = item.icon
            return <Link className={cx('group relative flex h-10 items-center text-[13px] leading-[1.5] transition', isCollapsed ? 'justify-center rounded-xl px-2' : 'gap-3 rounded-l-full px-3', isActive ? 'bg-white text-brand-admin shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]' : 'text-admin-nav hover:bg-white/60 hover:text-brand-admin')} key={item.label} to={item.href}><Icon aria-hidden="true" className={cx('shrink-0', item.iconClassName)} strokeWidth={2.35} /><span className={isCollapsed ? 'sr-only' : undefined}>{item.label}</span>{isCollapsed ? <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-30 w-max -translate-y-1/2 rounded-md bg-admin-text px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus:opacity-100">{item.label}</span> : null}</Link>
          })}
        </nav>
      </div>

      <div className="relative">
        {isUserMenuOpen ? <div className={cx('absolute bottom-[calc(100%+10px)] rounded-2xl border border-red-100 bg-red-50 p-2 shadow-[4px_4px_0_rgba(220,38,38,0.08)]', isCollapsed ? 'left-0 w-48' : 'left-0 right-0')}><button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60" disabled={isLoggingOut} onClick={handleLogout} type="button"><LogOut size={17} strokeWidth={2} /><span>{isLoggingOut ? 'Saindo...' : 'Sair do sistema'}</span></button></div> : null}

        <button aria-expanded={isUserMenuOpen} aria-label={isCollapsed ? `Menu de ${userName}` : undefined} className={cx('flex h-10 min-w-0 items-center text-left transition hover:bg-white/70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint', isCollapsed ? 'mx-auto w-10 justify-center rounded-xl' : 'w-full gap-3 rounded-l-full px-3')} onClick={() => setIsUserMenuOpen((current) => !current)} type="button"><img className="h-7 w-7 shrink-0 rounded-full object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)]" src={backofficeAssets.adminAvatar} alt="" aria-hidden="true" /><span className={cx('min-w-0', isCollapsed && 'sr-only')}><span className="block truncate text-[11px] leading-[1.25] text-admin-text">{userName}</span><span className="block truncate text-[9px] leading-[1.25] text-muted">{userEmail}</span></span></button>
      </div>
    </aside>
  )
}
