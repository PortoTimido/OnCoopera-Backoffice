import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { cx } from '../../../lib/cx'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { deleteBackofficeArticle, listBackofficeArticles, type Article, type ArticleStatus, type PaginatedArticles } from '../api/articlesApi'

const statusFilters: Array<{ label: string; value?: ArticleStatus }> = [
  { label: 'Todos' },
  { label: 'Publicados', value: 'PUBLICADO' },
  { label: 'Rascunhos', value: 'RASCUNHO' },
  { label: 'Desativados', value: 'DESATIVADO' },
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [articlesResult, setArticlesResult] = useState<PaginatedArticles>(emptyPagination)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
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
          setSelectedIds([])
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

  function toggleSelected(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  async function refreshArticles() {
    const data = await listBackofficeArticles({
      page: currentPage,
      pageSize: 10,
      search: search || undefined,
      status: activeStatus,
    })

    setArticlesResult(data)
  }

  async function handleDeleteArticle(article: Article) {
    const confirmed = window.confirm(`Desativar o artigo "${article.titulo}"?`)

    if (!confirmed) {
      return
    }

    setError('')

    try {
      await deleteBackofficeArticle(article.id)
      await refreshArticles()
      setSelectedIds((current) => current.filter((id) => id !== article.id))
      setActiveMenu(null)
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError))
    }
  }

  async function handleDeleteSelectedArticles() {
    if (selectedIds.length === 0) {
      return
    }

    const confirmed = window.confirm(`Desativar ${selectedIds.length} artigo(s) selecionado(s)?`)

    if (!confirmed) {
      return
    }

    setError('')

    try {
      await Promise.all(selectedIds.map((id) => deleteBackofficeArticle(id)))
      await refreshArticles()
      setSelectedIds([])
      setActiveMenu(null)
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError))
    }
  }

  const hasPreviousPage = articlesResult.page > 1
  const hasNextPage = articlesResult.page < articlesResult.totalPages

  return (
    <AppLayout activeItem="Artigos" user={user}>
      <main className="flex min-h-0 flex-1 flex-col gap-10 overflow-auto p-6 sm:p-10 lg:p-12" data-figma-node-id="327:119">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-2">
            <span className="h-5" aria-hidden="true" />
            <h1 className="font-display text-[length:var(--admin-list-title-size)] leading-[var(--admin-list-title-line-height)] text-admin-text">Artigos</h1>
          </div>

          <Link
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-base text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint"
            to="/artigos/novo"
          >
            <Plus size={16} strokeWidth={2.2} />
            Novo artigo
          </Link>
        </header>

        <section className="flex flex-col gap-5 rounded-2xl bg-surface-soft p-5 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)] lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-[var(--admin-search-max)]">
            <span className="sr-only">Pesquisar artigos</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-strong" size={18} strokeWidth={2} />
            <input
              className="h-14 w-full rounded-xl border-0 bg-[#e6e9e8] px-12 text-base text-admin-text shadow-[4px_4px_0_rgba(187,202,196,0.2)] outline-none transition placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar..."
              value={query}
            />
          </label>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar artigos">
            {statusFilters.map((filter) => (
              <button
                className={cx(
                  'h-10 rounded-full border border-[#bbcac4]/15 px-5 text-sm text-admin-text transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-brand-mint',
                  activeStatus === filter.value ? 'bg-white shadow-[2px_2px_0_rgba(187,202,196,0.2)]' : 'bg-white/70',
                  !activeStatus && !filter.value ? 'bg-white shadow-[2px_2px_0_rgba(187,202,196,0.2)]' : undefined,
                )}
                key={filter.label}
                onClick={() => updateSearchParams({ page: null, status: filter.value ?? null })}
                type="button"
                role="tab"
                aria-selected={activeStatus === filter.value || (!activeStatus && !filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {selectedIds.length > 0 ? (
          <div className="flex items-center justify-between rounded-2xl bg-brand-mint/15 px-5 py-3 text-sm font-semibold text-brand-teal">
            <span>{selectedIds.length} item selecionado</span>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-red-700 shadow-[2px_2px_0_rgba(187,202,196,0.2)]"
              onClick={handleDeleteSelectedArticles}
              type="button"
            >
              <Trash2 size={16} strokeWidth={2} />
              Apagar
            </button>
          </div>
        ) : null}

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <section className="overflow-hidden rounded-3xl bg-white shadow-[4px_4px_0_rgba(187,202,196,0.2),inset_2px_2px_4px_rgba(215,219,218,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[var(--admin-table-min-width)] border-collapse text-left">
              <thead className="bg-surface-soft text-xs font-bold uppercase tracking-[0.6px] text-muted-strong">
                <tr>
                  <th className="w-16 px-4 py-4">
                    <span className="sr-only">Selecionar</span>
                  </th>
                  <th className="px-4 py-4">Título</th>
                  <th className="px-4 py-4">Categoria</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Autor</th>
                  <th className="px-4 py-4">Dt. publicação</th>
                  <th className="w-20 px-4 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm text-muted" colSpan={7}>
                      Carregando artigos...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && articlesResult.data.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm text-muted" colSpan={7}>
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
                          <td className="px-4 py-4">
                            <button
                              className={cx(
                                'grid h-5 w-5 place-items-center rounded border border-[#bbcac4]/50 transition focus-visible:outline-2 focus-visible:outline-brand-mint',
                                selectedIds.includes(article.id) ? 'border-brand-teal bg-brand-teal text-white' : 'bg-white',
                              )}
                              onClick={() => toggleSelected(article.id)}
                              type="button"
                              aria-label={`Selecionar ${article.titulo}`}
                            >
                              {selectedIds.includes(article.id) ? <Check size={13} strokeWidth={2.4} /> : null}
                            </button>
                          </td>
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
                          <td className="relative px-4 py-4 text-right">
                            <button
                              className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-mint"
                              onClick={() => setActiveMenu((current) => (current === article.id ? null : article.id))}
                              type="button"
                              aria-label={`Abrir ações de ${article.titulo}`}
                            >
                              <MoreVertical size={18} strokeWidth={2} />
                            </button>
                            {activeMenu === article.id ? (
                              <div className="absolute right-4 top-12 z-10 grid w-36 gap-1 rounded-2xl border border-[#bbcac4]/20 bg-white p-2 text-left shadow-[4px_4px_0_rgba(187,202,196,0.2)]">
                                <Link className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-admin-text hover:bg-surface-soft" to={`/artigos/${article.id}/editar`}>
                                  <Pencil size={15} strokeWidth={2} />
                                  Editar
                                </Link>
                                <button
                                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteArticle(article)}
                                  type="button"
                                >
                                  <Trash2 size={15} strokeWidth={2} />
                                  Apagar
                                </button>
                              </div>
                            ) : null}
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
    </AppLayout>
  )
}
