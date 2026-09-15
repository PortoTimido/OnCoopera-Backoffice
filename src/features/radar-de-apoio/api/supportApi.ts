import { httpClient } from '../../../shared/api/httpClient'
import type { PaginatedSupports, SaveSupportPayload, SupportCategory, SupportResource, SupportStatus } from '../model/supportTypes'

export type ListSupportsParams = { cidade?: string; page?: number; pageSize?: number; search?: string; status?: SupportStatus; tipoApoio?: SupportCategory }

export async function listBackofficeSupports(params?: ListSupportsParams) { const { data } = await httpClient.get<PaginatedSupports>('/backoffice/apoios', { params }); return data }
export async function getBackofficeSupport(id: string) { const { data } = await httpClient.get<SupportResource>(`/backoffice/apoios/${id}`); return data }
export async function createBackofficeSupport(payload: SaveSupportPayload) { const { data } = await httpClient.post<SupportResource>('/backoffice/apoios', payload); return data }
export async function updateBackofficeSupport(id: string, payload: Partial<SaveSupportPayload>) { const { data } = await httpClient.patch<SupportResource>(`/backoffice/apoios/${id}`, payload); return data }
export async function deleteBackofficeSupport(id: string) { await httpClient.delete(`/backoffice/apoios/${id}`) }

function createImageFormData(file: File) {
  const formData = new FormData()
  formData.append('imagem', file)

  return formData
}

export async function uploadBackofficeSupportImage(id: string, file: File) {
  const { data } = await httpClient.post<SupportResource>(`/backoffice/apoios/${id}/imagens`, createImageFormData(file))

  return data
}

export async function replaceBackofficeSupportImage(id: string, imageId: string, file: File) {
  const { data } = await httpClient.patch<SupportResource>(`/backoffice/apoios/${id}/imagens/${imageId}`, createImageFormData(file))

  return data
}

export async function deleteBackofficeSupportImage(id: string, imageId: string) {
  await httpClient.delete(`/backoffice/apoios/${id}/imagens/${imageId}`)
}
