import type { AuthenticatedUser } from './authTypes'

export type AdministrativePermission = 'GERENCIAR_USUARIOS' | 'GESTAO_CONTEUDOS' | 'GESTAO_RADAR_APOIO'

export function hasAdministrativePermission(user: AuthenticatedUser | null, permission: AdministrativePermission) {
  if (!user) {
    return false
  }

  const permissions = user.permissoesAdministrativas
  const effectivePermissions = permissions?.length ? permissions : user.perfisAdministrativos

  return effectivePermissions.includes('TOTAL') || effectivePermissions.includes(permission)
}
