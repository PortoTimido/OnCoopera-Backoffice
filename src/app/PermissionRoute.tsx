import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../features/auth/api/authApi'
import {
  getStoredAccessToken,
  getStoredUser,
  storeAuthSession,
} from '../features/auth/model/authSession'
import {
  hasAdministrativePermission,
  type AdministrativePermission,
} from '../features/auth/model/administrativePermissions'

type PermissionRouteProps = {
  children: ReactNode
  permission?: AdministrativePermission
}

/** Impede o carregamento de páginas administrativas sem a permissão correspondente. */
export function PermissionRoute({ children, permission }: PermissionRouteProps) {
  const location = useLocation()
  const [user, setUser] = useState(() => getStoredUser())
  const [isLoadingUser, setIsLoadingUser] = useState(
    () => Boolean(getStoredAccessToken()) && !getStoredUser(),
  )
  const accessToken = getStoredAccessToken()

  useEffect(() => {
    if (!accessToken || user) {
      return
    }

    const token = accessToken
    let isActive = true

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser()

        if (isActive) {
          storeAuthSession(token, currentUser)
          setUser(currentUser)
        }
      } catch {
        if (isActive) {
          setIsLoadingUser(false)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      isActive = false
    }
  }, [accessToken, user])

  if (!accessToken || (!user && !isLoadingUser)) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (!user) {
    return (
      <main aria-live="polite" className="min-h-svh bg-admin-canvas p-8 text-sm text-muted">
        Validando sessão...
      </main>
    )
  }

  if (permission && !hasAdministrativePermission(user, permission)) {
    return <Navigate replace to="/dashboard" />
  }

  return <>{children}</>
}
