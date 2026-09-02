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
    <div className="flex min-h-svh bg-admin-canvas font-backoffice text-admin-text" data-layout="backoffice">
      <SideNav activeItem={activeItem} user={user} />
      <div className="relative z-1 flex min-w-0 flex-1 flex-col overflow-hidden bg-admin-canvas">
        <TopBar />
        {children}
      </div>
    </div>
  )
}
