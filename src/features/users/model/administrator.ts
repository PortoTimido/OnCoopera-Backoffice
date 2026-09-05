import type { AdminProfile, AdministrativePermission } from '../../backoffice/api/backofficeApi'

export const administratorProfiles: Array<{ value: AdminProfile; label: string; description: string }> = [
  { value: 'TOTAL', label: 'Administrador', description: 'Acesso total ao sistema' },
  { value: 'MODERADOR_DE_CONTEUDO', label: 'Moderador de conteúdo', description: 'Gestão de conteúdo e artigos' },
  { value: 'GERENTE_DE_APOIOS', label: 'Gestão de apoios', description: 'Gestão do Radar de Apoio' },
  { value: 'ANALISTA_DE_INTERACOES', label: 'Analista de interações', description: 'Análise de interações' },
]

export const administrativePermissions: Array<{ value: AdministrativePermission; label: string; description: string }> = [
  { value: 'GERENCIAR_USUARIOS', label: 'Gerenciar usuários', description: 'Criar, editar e bloquear acessos.' },
  { value: 'GESTAO_CONTEUDOS', label: 'Gestão de conteúdos', description: 'Publicar artigos e cartilhas.' },
  { value: 'GESTAO_RADAR_APOIO', label: 'Gestão de Radar de Apoio', description: 'Criar, editar e excluir apoios.' },
]

export function profileLabel(value: string) {
  return administratorProfiles.find((profile) => profile.value === value)?.label ?? value
}

export function createLoginFromName(value: string) {
  const parts = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/\s+/).map((part) => part.replace(/[^a-z0-9]/g, '')).filter(Boolean)
  return parts.length > 1 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0] ?? 'administrador'
}
