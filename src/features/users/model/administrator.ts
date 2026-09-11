import type { AdministrativePermission } from '../../backoffice/api/backofficeApi'

export type DetailedAdministrativePermission = Exclude<AdministrativePermission, 'TOTAL'>

export const administrativePermissions: Array<{ value: DetailedAdministrativePermission; label: string; description: string }> = [
  { value: 'GERENCIAR_USUARIOS', label: 'Gerenciar usuários', description: 'Criar, editar e bloquear acessos.' },
  { value: 'GESTAO_CONTEUDOS', label: 'Gestão de conteúdos', description: 'Publicar artigos e cartilhas.' },
  { value: 'GESTAO_RADAR_APOIO', label: 'Gestão de Radar de Apoio', description: 'Criar, editar e excluir apoios.' },
]

export function permissionsToPayload(permissions: DetailedAdministrativePermission[]): AdministrativePermission[] {
  return permissions.length === administrativePermissions.length ? ['TOTAL'] : permissions
}

export function permissionsFromApi(permissions: readonly string[] | undefined, legacyProfiles: readonly string[] = []): DetailedAdministrativePermission[] {
  const hasTotalAccess = permissions?.includes('TOTAL') || (!permissions?.length && legacyProfiles.includes('TOTAL'))
  if (hasTotalAccess) return administrativePermissions.map((permission) => permission.value)

  return administrativePermissions
    .map((permission) => permission.value)
    .filter((permission) => permissions?.includes(permission))
}

export function permissionsLabel(permissions: readonly string[] | undefined, legacyProfiles: readonly string[] = []) {
  if (permissions?.includes('TOTAL') || (!permissions?.length && legacyProfiles.includes('TOTAL'))) return 'TOTAL'

  const labels = administrativePermissions
    .filter((permission) => permissions?.includes(permission.value))
    .map((permission) => permission.label)

  return labels.join(', ') || '—'
}

export function createLoginFromName(value: string) {
  const parts = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/\s+/).map((part) => part.replace(/[^a-z0-9]/g, '')).filter(Boolean)
  return parts.length > 1 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0] ?? 'administrador'
}
