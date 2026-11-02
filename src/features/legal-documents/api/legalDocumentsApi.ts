import { httpClient } from '../../../shared/api/httpClient'

export type LegalDocumentType = 'TERMOS_USO' | 'POLITICA_PRIVACIDADE'

export type LegalDocument = {
  id: string
  tipo: LegalDocumentType
  versao: string
  conteudo: string
  atualizadoEm: string
}

export type CreateLegalDocumentPayload = {
  tipo: LegalDocumentType
  conteudo: string
}

export type UpdateLegalDocumentPayload = Pick<CreateLegalDocumentPayload, 'conteudo'>

export async function getLegalDocument(type: LegalDocumentType) {
  const { data } = await httpClient.get<LegalDocument>(`/backoffice/documentos-legais/${type}`)

  return data
}

export async function createLegalDocument(payload: CreateLegalDocumentPayload) {
  const { data } = await httpClient.post<LegalDocument>('/backoffice/documentos-legais', payload)

  return data
}

export async function updateLegalDocument(
  type: LegalDocumentType,
  payload: UpdateLegalDocumentPayload,
) {
  const { data } = await httpClient.put<LegalDocument>(
    `/backoffice/documentos-legais/${type}`,
    payload,
  )

  return data
}
