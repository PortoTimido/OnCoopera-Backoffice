import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getStoredAccessToken, getStoredUser } from '../features/auth/model/authSession'
import { hasAdministrativePermission, type AdministrativePermission } from '../features/auth/model/administrativePermissions'

type PermissionRouteProps = {
  children: ReactNode
  permission?: AdministrativePermission
}

/** Impede o carregamento de páginas administrativas sem a permissão correspondente. */
export function PermissionRoute({ children, permission }: PermissionRouteProps) {
  const location = useLocation()
  const user = getStoredUser()

  if (!getStoredAccessToken() || !user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (permission && !hasAdministrativePermission(user, permission)) {
    return <Navigate replace to="/dashboard" />
  }

  return <>{children}</>
}
