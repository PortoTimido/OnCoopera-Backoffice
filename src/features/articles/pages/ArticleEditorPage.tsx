import { useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle2, Clock3, Eye, FileText, Lightbulb, MessageSquareQuote, Save, Send, X } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { cx } from '../../../lib/cx'
import { useToast } from '../../../components/ui/useToast'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { AdminCreateSelect } from '../../settings/components/AdminCreateSelect'
import {
  createBackofficeArticle,
  createBackofficeArticleCategory,
  createBackofficeArticleTag,
  getBackofficeArticle,
  listBackofficeArticleCategories,
  listBackofficeArticleTags,
  deleteBackofficeArticleImage,
  uploadBackofficeArticleImage,
  updateBackofficeArticle,
  type Article,
  type ArticleStatus,
  type ArticleTaxonomy,
  type SaveArticlePayload,
} from '../api/articlesApi'
import { ArticleDropzone } from '../components/ArticleDropzone'
import { RichTextEditor } from '../components/RichTextEditor'
import { createArticlePreviewFromArticle, storeArticlePreview, type ArticlePreviewData } from '../model/articlePreview'

type HelpModal = 'tip' | 'ask' | null

const initialBody = '<p></p>'

const statusOptions: Array<{ label: string; value: ArticleStatus }> = [
  { label: 'Rascunho', value: 'RASCUNHO' },
  { label: 'Publicado', value: 'PUBLICADO' },
  { label: 'Desativado', value: 'DESATIVADO' },
]

const fixedArticleCategories = ['Saúde', 'Tratamento', 'Nutrição', 'Bem-estar', 'Prevenção', 'Cuidadores'] as const

const fixedCategoryPrefix = 'fixed-category:'

function normalizeTaxonomyName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getFixedCategoryId(name: string) {
  return `${fixedCategoryPrefix}${normalizeTaxonomyName(name)}`
}

function mergeFixedCategories(apiCategories: ArticleTaxonomy[]) {
  const categoriesByName = new Map(apiCategories.map((category) => [normalizeTaxonomyName(category.nome), category]))
  const fixedCategories = fixedArticleCategories.map((name) => categoriesByName.get(normalizeTaxonomyName(name)) ?? { id: getFixedCategoryId(name), nome: name })
  const fixedNames = new Set(fixedArticleCategories.map(normalizeTaxonomyName))
  const remainingApiCategories = apiCategories.filter((category) => !fixedNames.has(normalizeTaxonomyName(category.nome)))

  return [...fixedCategories, ...remainingApiCategories]
}

function isFixedCategoryId(categoryId: string) {
  return categoryId.startsWith(fixedCategoryPrefix)
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function estimateReadingTime(html: string) {
  const words = stripHtml(html).split(' ').filter(Boolean).length

  return Math.max(1, Math.ceil(words / 180))
}

function getSelectedTags(options: ArticleTaxonomy[], selectedIds: string[]) {
  return selectedIds.map((id) => options.find((option) => option.id === id)).filter((tag): tag is ArticleTaxonomy => Boolean(tag))
}

function getFileDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

export function ArticleEditorPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [body, setBody] = useState(initialBody)
  const [categories, setCategories] = useState<ArticleTaxonomy[]>([])
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [helpModal, setHelpModal] = useState<HelpModal>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isImageRemovalRequested, setIsImageRemovalRequested] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(articleId))
  const [isSaving, setIsSaving] = useState(false)
  const [customReadingTime, setCustomReadingTime] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [status, setStatus] = useState<ArticleStatus>('RASCUNHO')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState<ArticleTaxonomy[]>([])
  const [title, setTitle] = useState('')
  const user = getStoredUser()
  const isEditing = Boolean(articleId)
  const hasImageSaveError = new URLSearchParams(location.search).has('imageUploadFailed')
  const estimatedReadingTime = useMemo(() => estimateReadingTime(body), [body])
  const readingTime = customReadingTime ?? estimatedReadingTime
  const categoryOptions = useMemo(
    () => [
      { label: 'Selecione', value: '' },
      ...categories.map((category) => ({
        label: category.nome,
        value: category.id,
      })),
    ],
    [categories],
  )
  const selectedTags = useMemo(() => getSelectedTags(tags, selectedTagIds), [selectedTagIds, tags])

  useEffect(() => {
    if (!hasImageSaveError) return

    toast.alert('Artigo salvo, mas não foi possível persistir a imagem. Selecione-a novamente para tentar de novo.')
    navigate(location.pathname, { replace: true })
  }, [hasImageSaveError, location.pathname, navigate, toast])

  useEffect(() => {
    let isMounted = true

    async function loadEditorData() {
      setIsLoading(true)

      try {
        const [categoriesResult, tagsResult, articleResult] = await Promise.all([
          listBackofficeArticleCategories(),
          listBackofficeArticleTags(),
          articleId ? getBackofficeArticle(articleId) : Promise.resolve(null),
        ])

        if (!isMounted) {
          return
        }

        const mergedCategories = mergeFixedCategories(categoriesResult)

        setCategories(mergedCategories)
        setTags(tagsResult)

        if (articleResult) {
          setTitle(articleResult.titulo)
          setSummary(articleResult.resumo ?? '')
          setBody(articleResult.conteudo || initialBody)
          setStatus(articleResult.status)
          setCustomReadingTime(Math.max(1, articleResult.tempoLeituraMinutos || estimateReadingTime(articleResult.conteudo || initialBody)))
          setImageUrl(articleResult.imagemUrl ?? '')
          setIsImageRemovalRequested(false)
          setSelectedCategoryId(articleResult.categorias[0]?.id ?? mergedCategories[0]?.id ?? '')
          setSelectedTagIds(articleResult.tags.map((tag) => tag.id))
        } else {
          setSelectedCategoryId(mergedCategories[0]?.id ?? '')
        }
      } catch (loadError) {
        if (isMounted) {
          const fallbackCategories = mergeFixedCategories([])

          setCategories(fallbackCategories)
          setSelectedCategoryId((current) => current || fallbackCategories[0]?.id || '')
          toast.error(getApiErrorMessage(loadError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadEditorData()

    return () => {
      isMounted = false
    }
  }, [articleId, toast])

  function removeTag(tagId: string) {
    setSelectedTagIds((current) => current.filter((id) => id !== tagId))
  }

  async function resolveSelectedCategoryId() {
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId)

    if (!selectedCategory || !isFixedCategoryId(selectedCategory.id)) {
      return selectedCategoryId
    }

    const existingCategories = await listBackofficeArticleCategories(selectedCategory.nome)
    const existingCategory = existingCategories.find((category) => normalizeTaxonomyName(category.nome) === normalizeTaxonomyName(selectedCategory.nome))
    const resolvedCategory = existingCategory ?? (await createBackofficeArticleCategory(selectedCategory.nome))

    setCategories((current) => mergeFixedCategories([...current.filter((category) => category.id !== selectedCategory.id), resolvedCategory]))
    setSelectedCategoryId(resolvedCategory.id)

    return resolvedCategory.id
  }

  async function buildPayload(nextStatus: ArticleStatus): Promise<SaveArticlePayload | null> {
    const trimmedTitle = title.trim()
    const textContent = stripHtml(body)

    if (!trimmedTitle) {
      toast.alert('Informe o título do artigo.')
      return null
    }

    if (!textContent) {
      toast.alert('Escreva o conteúdo do artigo.')
      return null
    }

    if (!selectedCategoryId) {
      toast.alert('Selecione uma categoria para o artigo.')
      return null
    }

    const resolvedCategoryId = await resolveSelectedCategoryId()

    return {
      categoriaIds: [resolvedCategoryId],
      conteudo: body,
      resumo: summary.trim(),
      status: nextStatus,
      tagIds: selectedTagIds,
      tempoLeituraMinutos: readingTime,
      titulo: trimmedTitle,
    }
  }

  function buildPreviewData(previewImageUrl = imageUrl || null): ArticlePreviewData {
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId)

    return {
      categories: selectedCategory ? [selectedCategory.nome] : [],
      contentHtml: body,
      imageUrl: previewImageUrl,
      readingTimeMinutes: readingTime,
      status,
      summary: summary.trim(),
      tags: selectedTags.map((tag) => tag.nome),
      title: title.trim() || 'Artigo sem título',
    }
  }

  function openPreview(preview: ArticlePreviewData) {
    storeArticlePreview(preview)
    navigate('/artigos/preview', { state: { preview } })
  }

  async function handlePreview() {
    try {
      const previewImageUrl = featuredImage ? await getFileDataUrl(featuredImage) : imageUrl || null
      openPreview(buildPreviewData(previewImageUrl))
    } catch {
      toast.error('Não foi possível preparar a imagem para pré-visualização.')
    }
  }

  function openPublishedPreview(article: Article) {
    const preview = createArticlePreviewFromArticle(article, summary.trim())

    storeArticlePreview(preview)
    navigate('/artigos/preview', { state: { preview } })
  }

  async function handleSave(nextStatus: ArticleStatus, shouldOpenPreview = false) {
    setIsSaving(true)

    let savedArticle: Article | null = null

    try {
      const payload = await buildPayload(nextStatus)

      if (!payload) {
        return
      }

      savedArticle = articleId ? await updateBackofficeArticle(articleId, payload) : await createBackofficeArticle(payload)

      if (featuredImage) {
        savedArticle = await uploadBackofficeArticleImage(savedArticle.id, featuredImage)
      } else if (isImageRemovalRequested && articleId) {
        await deleteBackofficeArticleImage(articleId)
        savedArticle = { ...savedArticle, imagemUrl: null }
      }

      toast.success(nextStatus === 'PUBLICADO' ? 'Artigo publicado com sucesso.' : 'Rascunho salvo com sucesso.')
      setStatus(savedArticle.status)
      setImageUrl(savedArticle.imagemUrl ?? '')
      setFeaturedImage(null)
      setIsImageRemovalRequested(false)

      if (shouldOpenPreview) {
        openPublishedPreview(savedArticle)
        return
      }

      if (!articleId) {
        navigate(`/artigos/${savedArticle.id}/editar`, { replace: true })
      }
    } catch (saveError) {
      if (savedArticle && !articleId) {
        navigate(`/artigos/${savedArticle.id}/editar?imageUploadFailed=1`, { replace: true })
        return
      }

      toast.error(getApiErrorMessage(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateTag(name: string) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    try {
      const createdTag = await createBackofficeArticleTag(trimmedName)
      setTags((current) => [...current.filter((tag) => tag.id !== createdTag.id), createdTag])
      setSelectedTagIds((current) => (current.includes(createdTag.id) ? current : [...current, createdTag.id]))
    } catch (tagError) {
      toast.error(getApiErrorMessage(tagError))
    }
  }

  async function handleCreateCategory(name: string) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    try {
      const createdCategory = await createBackofficeArticleCategory(trimmedName)
      setCategories((current) => [...current.filter((category) => category.id !== createdCategory.id), createdCategory])
      setSelectedCategoryId(createdCategory.id)
    } catch (categoryError) {
      toast.error(getApiErrorMessage(categoryError))
    }
  }

  return (
    <AppLayout activeItem="Artigos" user={user}>
      <main className="min-h-0 flex-1 overflow-auto bg-admin-canvas p-6 sm:p-10 lg:p-12" data-figma-node-id="327:1136">
        <div className="mx-auto grid w-full gap-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-2">
              <nav className="flex items-center gap-2 text-sm leading-5" aria-label="Breadcrumb">
                <Link className="text-muted transition hover:text-brand-teal" to="/artigos">
                  Artigos
                </Link>
                <span className="text-muted" aria-hidden="true">
                  ›
                </span>
                <span className="font-bold text-brand-teal">{isEditing ? 'Editar artigo' : 'Criar novo'}</span>
              </nav>
              <h1 className="font-serif text-[length:var(--admin-page-title-size)] font-semibold leading-[var(--admin-page-title-line-height)] text-admin-text">Artigo de rascunho</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-sm leading-5 text-muted">
                <CheckCircle2 size={16} strokeWidth={2} />
                Salvo a 2 mins atrás
              </span>
              <button
                className="rounded-xl bg-[#e0e3e2] px-6 py-3 text-sm leading-5 text-admin-text transition hover:-translate-y-0.5"
                onClick={handlePreview}
                type="button"
              >
                Pré-visualização
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="rounded-3xl bg-white p-8 text-sm text-muted shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">Carregando artigo...</div>
          ) : (
            <div className="grid items-start gap-7 lg:pr-12 lg:grid-cols-[minmax(0,1fr)_var(--admin-side-panel-width)] lg:gap-x-14">
              <section className="grid min-w-0 gap-6" aria-label="Conteúdo do artigo">
                <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
                  <input
                    className="w-full border-0 bg-transparent text-[length:var(--admin-field-title-size)] font-bold leading-tight text-admin-text outline-none placeholder:text-[#bbcac4]"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Título do artigo..."
                    value={title}
                  />
                  <div className="h-px bg-[#bbcac4]/15" />
                  <textarea
                    className="min-h-24 w-full resize-none border-0 bg-transparent text-base leading-6 text-admin-text outline-none placeholder:text-[#bbcac4]"
                    maxLength={250}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="Escreva um breve resumo ou introdução... (Máximo de 250 caracteres)"
                    value={summary}
                  />
                </div>

                <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
                  <h2 className="text-lg leading-7 text-admin-text">Imagem</h2>
                  <ArticleDropzone
                    file={featuredImage}
                    imageUrl={imageUrl || null}
                    onFileChange={(file) => {
                      setFeaturedImage(file)
                      if (file) {
                        setIsImageRemovalRequested(false)
                      }
                    }}
                    onRemoveImage={() => {
                      setImageUrl('')
                      setIsImageRemovalRequested(true)
                    }}
                  />
                </div>

                <RichTextEditor value={body} onChange={setBody} />
              </section>

              <aside className="grid gap-6 lg:sticky lg:top-6" aria-label="Configurações do artigo">
                <section className="grid gap-4 rounded-3xl bg-[#e0e3e2]/80 p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5)]">
                  <h2 className="pb-2 text-lg leading-7 text-admin-text">Edição</h2>
                  <button
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-teal px-4 text-sm text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 disabled:opacity-60"
                    disabled={isSaving}
                    onClick={() => handleSave('PUBLICADO', true)}
                    type="button"
                  >
                    <Send size={15} strokeWidth={2} />
                    Publicar artigo
                  </button>
                  <button
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm text-admin-text shadow-[4px_4px_0_rgba(187,202,196,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
                    disabled={isSaving}
                    onClick={() => handleSave(status)}
                    type="button"
                  >
                    <Save size={15} strokeWidth={2} />
                    Salve o rascunho
                  </button>
                </section>

                <section className="grid gap-5 rounded-3xl bg-white p-6 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
                  <h2 className="text-lg leading-7 text-admin-text">Detalhes</h2>

                  <AdminCreateSelect
                    className="grid gap-2"
                    label="Status"
                    labelClassName="text-xs font-bold uppercase tracking-[0.6px] text-muted"
                    leftElement={<Eye size={16} strokeWidth={2} />}
                    onChange={setStatus}
                    options={statusOptions}
                    tone="adminField"
                    value={status}
                  />

                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.6px] text-muted">Tempo médio de leitura (min.)</span>
                    <span className="relative block">
                      <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-strong" size={16} strokeWidth={2} />
                      <input
                        className="h-11 w-full rounded-xl border-0 bg-[#e6e9e8] px-10 text-sm text-admin-text shadow-[inset_2px_2px_4px_rgba(215,219,218,0.8)] outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20"
                        min={1}
                        onChange={(event) => {
                          setCustomReadingTime(Math.max(1, Number(event.target.value) || 1))
                        }}
                        type="number"
                        value={readingTime}
                      />
                    </span>
                  </label>

                  <div className="grid gap-2">
                    <AdminCreateSelect
                      className="grid gap-2"
                      label="Categoria"
                      labelClassName="text-xs font-bold uppercase tracking-[0.6px] text-muted"
                      leftElement={<FileText size={16} strokeWidth={2} />}
                      onChange={setSelectedCategoryId}
                      options={categoryOptions}
                      tone="adminField"
                      value={selectedCategoryId}
                    />
                    <input
                      className="h-8 rounded-xl border-0 bg-[#e6e9e8] px-3 text-sm text-admin-text outline-none placeholder:text-muted focus:ring-4 focus:ring-brand-mint/20"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleCreateCategory(event.currentTarget.value)
                          event.currentTarget.value = ''
                        }
                      }}
                      placeholder="Criar nova categoria..."
                    />
                  </div>

                  <FieldShell icon={Calendar} label="Data de publicação" value="Automática ao publicar" />

                  <div className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.6px] text-muted">Tags</span>
                    <div className="grid gap-2 rounded-xl bg-[#e6e9e8] p-2 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.8)]">
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-muted-strong shadow-[2px_2px_0_rgba(187,202,196,0.2)]" key={tag.id}>
                            {tag.nome}
                            <button className="grid h-4 w-4 place-items-center rounded-full hover:bg-surface-soft" onClick={() => removeTag(tag.id)} type="button" aria-label={`Remover tag ${tag.nome}`}>
                              <X size={10} strokeWidth={2.5} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="h-8 border-0 bg-transparent px-1 text-sm text-admin-text outline-none"
                        onChange={(event) => {
                          const value = event.target.value

                          if (value) {
                            setSelectedTagIds((current) => (current.includes(value) ? current : [...current, value]))
                            event.target.value = ''
                          }
                        }}
                        value=""
                      >
                        <option value="">Adicionar tag existente...</option>
                        {tags
                          .filter((tag) => !selectedTagIds.includes(tag.id))
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.nome}
                            </option>
                          ))}
                      </select>
                      <input
                        className="h-8 border-0 bg-transparent px-1 text-sm text-admin-text outline-none placeholder:text-muted"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            handleCreateTag(event.currentTarget.value)
                            event.currentTarget.value = ''
                          }
                        }}
                        placeholder="Criar nova tag..."
                      />
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 rounded-3xl bg-white p-3 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
                  <h2 className="px-3 pt-3 text-lg leading-7 text-admin-text">Observações</h2>
                  <button
                    className="inline-flex h-14 items-center gap-4 rounded-[28px] border-2 border-black/5 bg-brand-mint/10 px-5 text-lg font-bold text-brand-teal shadow-[6px_6px_0_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5"
                    onClick={() => setHelpModal('tip')}
                    type="button"
                  >
                    <Lightbulb size={24} strokeWidth={2.2} />
                    Dica
                  </button>
                  <button
                    className="inline-flex h-14 items-center gap-4 rounded-[28px] border-2 border-black/5 bg-[#fff4e1] px-5 text-sm font-bold text-[#754b00] shadow-[6px_6px_0_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5"
                    onClick={() => setHelpModal('ask')}
                    type="button"
                  >
                    <MessageSquareQuote size={24} strokeWidth={2.2} />
                    Pergunte ao seu médico
                  </button>
                </section>
              </aside>
            </div>
          )}
        </div>

        {helpModal ? <ArticleHelpModal modal={helpModal} onClose={() => setHelpModal(null)} /> : null}
      </main>
    </AppLayout>
  )
}

function FieldShell({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.6px] text-muted">{label}</span>
      <span className="relative flex h-11 items-center rounded-xl bg-[#e6e9e8] px-10 text-sm text-admin-text shadow-[inset_2px_2px_4px_rgba(215,219,218,0.8)]">
        <Icon className="absolute left-3.5 text-muted-strong" size={16} strokeWidth={2} />
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}

function ArticleHelpModal({ modal, onClose }: { modal: Exclude<HelpModal, null>; onClose: () => void }) {
  const isTip = modal === 'tip'

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-admin-text/40 px-6" role="dialog" aria-modal="true" aria-labelledby="article-help-title">
      <div className="grid w-full max-w-md gap-5 rounded-3xl bg-white p-6 shadow-[8px_8px_0_rgba(0,107,90,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold leading-8 text-admin-text" id="article-help-title">
            {isTip ? 'Para adicionar o bloco de Dica' : 'Para adicionar o bloco de Pergunta'}
          </h2>
          <button className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft" onClick={onClose} type="button" aria-label="Fechar modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className={cx('rounded-2xl p-4 text-sm leading-6', isTip ? 'bg-brand-mint/10 text-brand-teal' : 'bg-[#fff4e1] text-[#754b00]')}>
          <p className="font-bold">{isTip ? '## Dica ##' : '## Pergunta ##'}</p>
          <p>{isTip ? 'Use esse marcador no corpo do texto para destacar uma orientação curta.' : 'Use esse marcador para inserir perguntas que o paciente pode levar para a consulta.'}</p>
        </div>
        <button className="h-11 rounded-xl bg-brand-teal px-5 text-sm text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)]" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  )
}
