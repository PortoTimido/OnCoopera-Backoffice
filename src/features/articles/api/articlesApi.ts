import { httpClient } from '../../../shared/api/httpClient'

export type ArticleStatus = 'RASCUNHO' | 'PUBLICADO' | 'DESATIVADO'

export type ArticleTaxonomy = {
  id: string
  nome: string
}

export type Article = {
  id: string
  autorId: string
  titulo: string
  resumo: string | null
  conteudo: string
  tempoLeituraMinutos: number
  imagemUrl: string | null
  status: ArticleStatus
  categorias: ArticleTaxonomy[]
  tags: ArticleTaxonomy[]
  dataCriacao: string
  dataAtualizacao: string
  dataPublicacao: string | null
}

export type PaginatedArticles = {
  data: Article[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ListArticlesParams = {
  autorId?: string
  categoriaId?: string
  page?: number
  pageSize?: number
  search?: string
  status?: ArticleStatus
  tagId?: string
}

export type SaveArticlePayload = {
  categoriaIds: string[]
  conteudo: string
  resumo: string
  status?: ArticleStatus
  tagIds?: string[]
  tempoLeituraMinutos: number
  titulo: string
}

type TaxonomyListResponse = {
  data: ArticleTaxonomy[]
}

export async function listBackofficeArticles(params?: ListArticlesParams) {
  const { data } = await httpClient.get<PaginatedArticles>('/backoffice/artigos', { params })

  return data
}

export async function getBackofficeArticle(id: string) {
  const { data } = await httpClient.get<Article>(`/backoffice/artigos/${id}`)

  return data
}

export async function createBackofficeArticle(payload: SaveArticlePayload) {
  const { data } = await httpClient.post<Article>('/backoffice/artigos', payload)

  return data
}

export async function updateBackofficeArticle(id: string, payload: Partial<SaveArticlePayload>) {
  const { data } = await httpClient.patch<Article>(`/backoffice/artigos/${id}`, payload)

  return data
}

export async function deleteBackofficeArticle(id: string) {
  await httpClient.delete(`/backoffice/artigos/${id}`)
}

export async function uploadBackofficeArticleImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('imagem', file)

  const { data } = await httpClient.post<Article>(`/backoffice/artigos/${id}/imagem`, formData)

  return data
}

export async function deleteBackofficeArticleImage(id: string) {
  await httpClient.delete(`/backoffice/artigos/${id}/imagem`)
}

export async function listBackofficeArticleCategories(search?: string) {
  const { data } = await httpClient.get<TaxonomyListResponse>('/backoffice/artigo-categorias', {
    params: search ? { search } : undefined,
  })

  return data.data
}

export async function createBackofficeArticleCategory(nome: string) {
  const { data } = await httpClient.post<ArticleTaxonomy>('/backoffice/artigo-categorias', { nome })

  return data
}

export async function listBackofficeArticleTags(search?: string) {
  const { data } = await httpClient.get<TaxonomyListResponse>('/backoffice/artigo-tags', {
    params: search ? { search } : undefined,
  })

  return data.data
}

export async function createBackofficeArticleTag(nome: string) {
  const { data } = await httpClient.post<ArticleTaxonomy>('/backoffice/artigo-tags', { nome })

  return data
}
