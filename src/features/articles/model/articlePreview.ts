import type { Article } from '../api/articlesApi'

export type ArticlePreviewData = {
  categories: string[]
  contentHtml: string
  imageUrl: string | null
  readingTimeMinutes: number
  status: string
  summary: string
  tags: string[]
  title: string
}

const previewStorageKey = 'oncoopera.articlePreview'

export function storeArticlePreview(preview: ArticlePreviewData) {
  window.sessionStorage.setItem(previewStorageKey, JSON.stringify(preview))
}

export function getStoredArticlePreview() {
  const stored = window.sessionStorage.getItem(previewStorageKey)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as ArticlePreviewData
  } catch {
    window.sessionStorage.removeItem(previewStorageKey)
    return null
  }
}

export function createArticlePreviewFromArticle(article: Article, summary = article.resumo ?? ''): ArticlePreviewData {
  return {
    categories: article.categorias.map((category) => category.nome),
    contentHtml: article.conteudo,
    imageUrl: article.imagemUrl,
    readingTimeMinutes: article.tempoLeituraMinutos,
    status: article.status,
    summary,
    tags: article.tags.map((tag) => tag.nome),
    title: article.titulo,
  }
}
