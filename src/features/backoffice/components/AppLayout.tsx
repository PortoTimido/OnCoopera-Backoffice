import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

const sidebarStateKey = 'oncoopera.backoffice.sidebarCollapsed'

export function AppLayout({
  activeItem = 'Início',
  children,
  user,
}: {
  activeItem?: string
  children: ReactNode
  user: AuthenticatedUser | null
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const storedValue = window.sessionStorage.getItem(sidebarStateKey)
    return storedValue === null ? window.innerWidth < 1280 : storedValue === 'true'
  })

  useEffect(() => {
    const compactSidebar = window.matchMedia('(max-width: 1279px)')
    const syncSidebarWithViewport = () => {
      setIsSidebarCollapsed(compactSidebar.matches)
      window.sessionStorage.setItem(sidebarStateKey, String(compactSidebar.matches))
    }

    compactSidebar.addEventListener('change', syncSidebarWithViewport)
    return () => compactSidebar.removeEventListener('change', syncSidebarWithViewport)
  }, [])

  const layoutStyle = {
    '--backoffice-current-sidebar-width': isSidebarCollapsed
      ? 'var(--backoffice-sidebar-collapsed-width)'
      : 'var(--backoffice-sidebar-width)',
  } as CSSProperties

  function toggleSidebar() {
    setIsSidebarCollapsed((current) => {
      const nextValue = !current
      window.sessionStorage.setItem(sidebarStateKey, String(nextValue))
      return nextValue
    })
  }

  return (
    <div className="min-h-svh bg-admin-canvas font-backoffice text-admin-text" data-layout="backoffice" style={layoutStyle}>
      <SideNav activeItem={activeItem} isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} user={user} />
      <div className="relative z-1 flex min-h-svh min-w-0 flex-col overflow-hidden bg-admin-canvas pl-[var(--backoffice-current-sidebar-width)] transition-[padding] duration-200">
        <TopBar />
        {children}
      </div>
    </div>
  )
}
