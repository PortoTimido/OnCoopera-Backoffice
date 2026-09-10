import { useCallback, useEffect, useState } from 'react'
import { ArchiveX, ChevronLeft, ChevronRight, Eye, FileClock, FileText, Pencil, Plus, Send, ToggleLeft, ToggleRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { cx } from '../../../lib/cx'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { SearchFilterBar, type SearchFilterOption } from '../../backoffice/components/SearchFilterBar'
import { listBackofficeArticles, updateBackofficeArticle, type Article, type ArticleStatus, type PaginatedArticles } from '../api/articlesApi'
import { createArticlePreviewFromArticle, storeArticlePreview } from '../model/articlePreview'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'

const statusFilters: Array<SearchFilterOption<ArticleStatus>> = [
  { label: 'Todos', icon: FileText },
  { label: 'Publicados', value: 'PUBLICADO', icon: Send },
  { label: 'Rascunhos', value: 'RASCUNHO', icon: FileClock },
  { label: 'Desativados', value: 'DESATIVADO', icon: ArchiveX },
]

const categoryTone: Record<string, string> = {
  'bem-estar': 'bg-[#fff4e1] text-[#754b00]',
  emocional: 'bg-[#e6e9e8] text-muted-strong',
  interações: 'bg-security-blue text-[#004676]',
  interacoes: 'bg-security-blue text-[#004676]',
  nutrição: 'bg-[#e6e9e8] text-muted-strong',
  nutricao: 'bg-[#e6e9e8] text-muted-strong',
}

const statusCopy: Record<ArticleStatus, string> = {
  DESATIVADO: 'Desativado',
  PUBLICADO: 'Publicado',
  RASCUNHO: 'Rascunho',
}

const statusTone: Record<ArticleStatus, string> = {
  DESATIVADO: 'bg-[#ffa28d] text-[#842d1a]',
  PUBLICADO: 'bg-brand-mint text-brand-teal-dark',
  RASCUNHO: 'bg-[#e6e9e8] text-muted-strong',
}

const emptyPagination: PaginatedArticles = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
}

function getValidStatus(value: string | null): ArticleStatus | undefined {
  if (value === 'PUBLICADO' || value === 'RASCUNHO' || value === 'DESATIVADO') {
    return value
  }

  return undefined
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Pendente'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getArticleDescription(article: Article) {
  const text = article.conteudo.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  return text || 'Sem resumo cadastrado'
}

function getCategory(article: Article) {
  return article.categorias[0]?.nome ?? 'Sem categoria'
}

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articlesResult, setArticlesResult] = useState<PaginatedArticles>(emptyPagination)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '')
  const [articleToDeactivate, setArticleToDeactivate] = useState<Article | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const user = getStoredUser()
  const activeStatus = getValidStatus(searchParams.get('status'))
  const currentPage = Number(searchParams.get('page') ?? '1') || 1
  const search = searchParams.get('search') ?? ''

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const next = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          next.delete(key)
          return
        }

        next.set(key, String(value))
      })

      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (query === search) {
        return
      }

      updateSearchParams({ page: null, search: query.trim() || null })
    }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [query, search, updateSearchParams])

  useEffect(() => {
    let isMounted = true

    async function loadArticles() {
      setIsLoading(true)
      setError('')

      try {
        const data = await listBackofficeArticles({
          page: currentPage,
          pageSize: 10,
          search: search || undefined,
          status: activeStatus,
        })

        if (isMounted) {
          setArticlesResult(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setArticlesResult(emptyPagination)
          setError(getApiErrorMessage(loadError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadArticles()

    return () => {
      isMounted = false
    }
  }, [activeStatus, currentPage, search])

  async function refreshArticles() {
    const data = await listBackofficeArticles({
      page: currentPage,
      pageSize: 10,
      search: search || undefined,
      status: activeStatus,
    })

    setArticlesResult(data)
  }

  async function confirmDeleteArticle() {
    if (!articleToDeactivate) return
    setIsDeleting(true)
    setError('')

    try {
      await updateBackofficeArticle(articleToDeactivate.id, { status: articleToDeactivate.status === 'PUBLICADO' ? 'DESATIVADO' : 'PUBLICADO' })
      setArticleToDeactivate(null)
      await refreshArticles()
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError))
    } finally {
      setIsDeleting(false)
    }
  }

  const hasPreviousPage = articlesResult.page > 1
  const hasNextPage = articlesResult.page < articlesResult.totalPages

  return (
    <AppLayout activeItem="Artigos" user={user}>
      <main className="flex min-h-0 flex-1 flex-col gap-10 overflow-auto p-6 sm:p-10 lg:p-12" data-figma-node-id="327:119">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[length:var(--admin-list-title-size)] leading-[var(--admin-list-title-line-height)] text-admin-text">Artigos</h1>
            <p className="mt-1 text-sm text-muted">Gerencie os artigos e conteúdos do sistema.</p>
          </div>

          <Link
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-base text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint"
            to="/artigos/novo"
          >
            <Plus size={16} strokeWidth={2.2} />
            Novo artigo
          </Link>
        </header>

        <SearchFilterBar activeValue={activeStatus} filtersLabel="Filtrar artigos" onFilterChange={(value) => updateSearchParams({ page: null, status: value ?? null })} onQueryChange={setQuery} options={statusFilters} query={query} searchLabel="Pesquisar artigos" searchPlaceholder="Pesquisar..." />

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <section className="overflow-hidden rounded-3xl bg-white shadow-[4px_4px_0_rgba(187,202,196,0.2),inset_2px_2px_4px_rgba(215,219,218,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[var(--admin-table-min-width)] border-collapse text-left">
              <thead className="bg-surface-soft text-xs font-bold uppercase tracking-[0.6px] text-muted-strong">
                <tr>
                  <th className="px-4 py-4">Título</th>
                  <th className="px-4 py-4">Categoria</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Autor</th>
                  <th className="px-4 py-4">Dt. publicação</th>
                  <th className="w-32 px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm text-muted" colSpan={6}>
                      Carregando artigos...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && articlesResult.data.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm text-muted" colSpan={6}>
                      Nenhum artigo encontrado.
                    </td>
                  </tr>
                ) : null}

                {!isLoading
                  ? articlesResult.data.map((article) => {
                      const category = getCategory(article)
                      const categoryKey = category.toLowerCase()

                      return (
                        <tr className="border-t border-[#bbcac4]/15 first:border-t-0" key={article.id}>
                          <td className="max-w-[var(--admin-table-title-max)] px-4 py-4">
                            <p className="truncate text-base leading-6 text-admin-text">{article.titulo}</p>
                            <p className="truncate text-xs leading-4 text-muted-strong">{getArticleDescription(article)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cx('inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.55px]', categoryTone[categoryKey] ?? 'bg-[#e6e9e8] text-muted-strong')}>
                              {category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cx('inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.55px]', statusTone[article.status])}>
                              {statusCopy[article.status]}
                            </span>
                          </td>
                          <td className="max-w-[var(--admin-table-author-max)] px-4 py-4 text-sm leading-5 text-admin-text">{article.autorId.slice(0, 8)}</td>
                          <td className="px-4 py-4 text-sm leading-5 text-muted-strong">{formatDate(article.dataPublicacao)}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-1">
                              <Link
                                aria-label={`Visualizar ${article.titulo}`}
                                className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-mint"
                                onClick={() => storeArticlePreview(createArticlePreviewFromArticle(article, getArticleDescription(article)))}
                                state={{ preview: createArticlePreviewFromArticle(article, getArticleDescription(article)) }}
                                to="/artigos/preview"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link aria-label={`Editar ${article.titulo}`} className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-mint" to={`/artigos/${article.id}/editar`}>
                                <Pencil size={16} />
                              </Link>
                              <button aria-label={`${article.status === 'PUBLICADO' ? 'Desativar' : 'Ativar'} ${article.titulo}`} className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-brand-mint" onClick={() => setArticleToDeactivate(article)} type="button">
                                {article.status === 'PUBLICADO' ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  : null}
              </tbody>
            </table>
          </div>

          <footer className="flex items-center justify-between border-t border-[#bbcac4]/15 bg-surface-soft px-4 py-3">
            <p className="text-xs leading-4 text-muted">
              Mostrando {articlesResult.total === 0 ? 0 : articlesResult.page} de {articlesResult.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                className="grid h-7 w-7 place-items-center rounded-full text-muted-strong hover:bg-white disabled:opacity-40"
                disabled={!hasPreviousPage}
                onClick={() => updateSearchParams({ page: articlesResult.page - 1 })}
                type="button"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-brand-teal px-2 text-xs text-white">{articlesResult.page}</span>
              <button
                className="grid h-7 w-7 place-items-center rounded-full text-muted-strong hover:bg-white disabled:opacity-40"
                disabled={!hasNextPage}
                onClick={() => updateSearchParams({ page: articlesResult.page + 1 })}
                type="button"
                aria-label="Próxima página"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </footer>
        </section>
      </main>
      <ConfirmationModal confirmLabel={articleToDeactivate?.status === 'PUBLICADO' ? 'Desativar artigo' : 'Ativar artigo'} description={articleToDeactivate?.status === 'PUBLICADO' ? `O artigo \"${articleToDeactivate.titulo}\" deixará de ficar disponível no sistema.` : `O artigo \"${articleToDeactivate?.titulo ?? ''}\" voltará a ficar disponível no sistema.`} isConfirming={isDeleting} isOpen={Boolean(articleToDeactivate)} onCancel={() => setArticleToDeactivate(null)} onConfirm={confirmDeleteArticle} title={articleToDeactivate?.status === 'PUBLICADO' ? 'Desativar artigo?' : 'Ativar artigo?'} />
    </AppLayout>
  )
}
