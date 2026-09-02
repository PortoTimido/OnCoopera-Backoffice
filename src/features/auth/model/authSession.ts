import type { AuthenticatedUser } from './authTypes'

const accessTokenKey = 'oncoopera.accessToken'
const userKey = 'oncoopera.user'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function getStoredAccessToken() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(accessTokenKey)
}

export function getStoredUser(): AuthenticatedUser | null {
  if (!canUseStorage()) {
    return null
  }

  const rawUser = window.localStorage.getItem(userKey)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthenticatedUser
  } catch {
    window.localStorage.removeItem(userKey)
    return null
  }
}

export function storeAuthSession(accessToken: string, user: AuthenticatedUser) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(accessTokenKey, accessToken)
  window.localStorage.setItem(userKey, JSON.stringify(user))
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(accessTokenKey)
  window.localStorage.removeItem(userKey)
}
