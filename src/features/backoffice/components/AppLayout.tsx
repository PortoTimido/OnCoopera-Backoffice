import type { ReactNode } from 'react'
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
  return (
    <div className="min-h-svh bg-admin-canvas font-backoffice text-admin-text" data-layout="backoffice">
      <SideNav activeItem={activeItem} user={user} />
      <div className="relative z-1 flex min-h-svh min-w-0 flex-col overflow-hidden bg-admin-canvas lg:pl-[var(--backoffice-sidebar-width)]">
        <TopBar />
        {children}
      </div>
    </div>
  )
}
