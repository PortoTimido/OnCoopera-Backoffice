import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { clearAuthSession, getStoredAccessToken, getStoredUser, storeAuthSession } from '../../auth/model/authSession'
import { RequiredPasswordChangeModal } from '../../auth/components/RequiredPasswordChangeModal'
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
  const navigate = useNavigate()
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(() => (user ?? getStoredUser())?.trocaSenhaObrigatoria === true)
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

  function handlePasswordChangeCompleted(_newPassword: string) {
    const currentUser = user ?? getStoredUser()
    const accessToken = getStoredAccessToken()

    if (currentUser && accessToken) {
      storeAuthSession(accessToken, { ...currentUser, trocaSenhaObrigatoria: false })
    }

    setRequiresPasswordChange(false)
  }

  function handleRequiredPasswordChangeClose() {
    clearAuthSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-admin-canvas font-backoffice text-admin-text" data-layout="backoffice" style={layoutStyle}>
      <div inert={requiresPasswordChange}>
        <SideNav activeItem={activeItem} isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} user={user} />
        <div className="relative z-1 flex min-h-svh min-w-0 flex-col overflow-hidden bg-admin-canvas pl-[var(--backoffice-current-sidebar-width)] transition-[padding] duration-200">
          <TopBar />
          {children}
        </div>
      </div>
      {requiresPasswordChange ? <RequiredPasswordChangeModal onClose={handleRequiredPasswordChangeClose} onCompleted={handlePasswordChangeCompleted} /> : null}
    </div>
  )
}
