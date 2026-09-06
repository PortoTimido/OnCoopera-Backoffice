import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

export function AppLayout({
  activeItem = 'Início',
  children,
  user,
}: {
  activeItem?: string
  children: ReactNode
  user: AuthenticatedUser | null
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 1280)

  useEffect(() => {
    const compactSidebar = window.matchMedia('(max-width: 1279px)')
    const syncSidebarWithViewport = () => setIsSidebarCollapsed(compactSidebar.matches)

    compactSidebar.addEventListener('change', syncSidebarWithViewport)
    return () => compactSidebar.removeEventListener('change', syncSidebarWithViewport)
  }, [])

  const layoutStyle = {
    '--backoffice-current-sidebar-width': isSidebarCollapsed
      ? 'var(--backoffice-sidebar-collapsed-width)'
      : 'var(--backoffice-sidebar-width)',
  } as CSSProperties

  return (
    <div className="min-h-svh bg-admin-canvas font-backoffice text-admin-text" data-layout="backoffice" style={layoutStyle}>
      <SideNav activeItem={activeItem} isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed((current) => !current)} user={user} />
      <div className="relative z-1 flex min-h-svh min-w-0 flex-col overflow-hidden bg-admin-canvas pl-[var(--backoffice-current-sidebar-width)] transition-[padding] duration-200">
        <TopBar showBrand={isSidebarCollapsed} />
        {children}
      </div>
    </div>
  )
}
