import { httpClient } from '../../../shared/api/httpClient'
import type { AuthenticatedUser } from '../../auth/model/authTypes'

export type PaginatedUsuarios = {
  data: AuthenticatedUser[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type AdminProfile = 'TOTAL' | 'MODERADOR_DE_CONTEUDO' | 'GERENTE_DE_APOIOS' | 'ANALISTA_DE_INTERACOES'

export type CreateAdministratorPayload = {
  nome: string
  email: string
  login: string
  telefone: string
  dataNascimento: string
  perfisAdministrativos: AdminProfile[]
}

export type UpdateAdministratorPayload = Partial<CreateAdministratorPayload> & {
  status?: AuthenticatedUser['status']
}

export type AdministratorDetails = {
  usuario: AuthenticatedUser
  endereco: unknown | null
  senhaTemporaria?: string
}

export async function listBackofficeUsuarios(params?: {
  page?: number
  pageSize?: number
  status?: AuthenticatedUser['status']
  tipo?: AuthenticatedUser['tipo']
}) {
  const { data } = await httpClient.get<PaginatedUsuarios>('/backoffice/usuarios', { params })

  return data
}

export async function createBackofficeAdministrator(payload: CreateAdministratorPayload) {
  const { data } = await httpClient.post<AdministratorDetails>('/backoffice/administradores', payload)

  return data
}

export async function updateBackofficeAdministrator(id: string, payload: UpdateAdministratorPayload) {
  const { data } = await httpClient.patch<AdministratorDetails>(`/backoffice/administradores/${id}`, payload)

  return data
}

export async function deleteBackofficeAdministrator(id: string) {
  await httpClient.delete(`/backoffice/administradores/${id}`)
}
