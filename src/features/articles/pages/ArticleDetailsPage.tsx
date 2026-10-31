import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { BackofficeDirectoryHeader } from '../../backoffice/components/BackofficeDirectoryHeader'
import {
  ReadOnlyField,
  ReadOnlyFields,
  ReadOnlySection,
} from '../../backoffice/components/ReadOnlyDetails'
import { getBackofficeArticle, type Article } from '../api/articlesApi'

const statusLabels = { RASCUNHO: 'Rascunho', PUBLICADO: 'Publicado', DESATIVADO: 'Desativado' }

type ContentBlock = { text: string; type: 'heading' | 'list' | 'paragraph' | 'quote' }

function parseContent(html: string): ContentBlock[] {
  const template = document.createElement('template')
  template.innerHTML = html
  const elements = Array.from(template.content.children)

  return elements.flatMap((element): ContentBlock[] => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    if (!text) return []
    if (element.tagName === 'H1' || element.tagName === 'H2') return [{ text, type: 'heading' }]
    if (element.tagName === 'BLOCKQUOTE') return [{ text, type: 'quote' }]
    if (element.tagName === 'UL' || element.tagName === 'OL') {
      return Array.from(element.children)
        .map((item) => item.textContent?.replace(/\s+/g, ' ').trim())
        .filter((item): item is string => Boolean(item))
        .map((item) => ({ text: item, type: 'list' as const }))
    }
    return [{ text, type: 'paragraph' }]
  })
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
    : 'Não publicado'
}

export function ArticleDetailsPage() {
  const { articleId } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const blocks = useMemo(() => (article ? parseContent(article.conteudo) : []), [article])

  useEffect(() => {
    if (!articleId) return
    let active = true
    void getBackofficeArticle(articleId)
      .then((result) => active && setArticle(result))
      .catch((loadError) => active && setError(getApiErrorMessage(loadError)))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [articleId])

  return (
    <AppLayout activeItem="Artigos" user={getStoredUser()}>
      <main className="min-h-0 flex-1 overflow-auto bg-admin-canvas p-6 sm:p-10 lg:p-12">
        <div className="mx-auto grid w-full max-w-5xl gap-6">
          <BackofficeDirectoryHeader
            backTo="/artigos"
            currentPage="Consultar artigo"
            directory="Artigos"
          />
          {isLoading ? (
            <p className="rounded-3xl bg-white p-8 text-sm text-muted">Carregando artigo...</p>
          ) : null}
          {error ? <p className="rounded-3xl bg-white p-8 text-sm text-red-700">{error}</p> : null}
          {article ? (
            <>
              <ReadOnlySection title={article.titulo}>
                <ReadOnlyFields>
                  <ReadOnlyField label="Status" value={statusLabels[article.status]} />
                  <ReadOnlyField
                    label="Tempo de leitura"
                    value={`${article.tempoLeituraMinutos} min`}
                  />
                  <ReadOnlyField
                    label="Categoria"
                    value={article.categorias.map(({ nome }) => nome).join(', ')}
                  />
                  <ReadOnlyField
                    label="Data de publicação"
                    value={formatDate(article.dataPublicacao)}
                  />
                </ReadOnlyFields>
                <ReadOnlyField label="Resumo" value={article.resumo} />
                <ReadOnlyField
                  label="Tags"
                  value={article.tags.map(({ nome }) => nome).join(', ')}
                />
                {article.imagemUrl ? (
                  <img
                    alt={`Capa do artigo ${article.titulo}`}
                    className="max-h-80 w-full rounded-2xl object-cover"
                    src={article.imagemUrl}
                  />
                ) : null}
              </ReadOnlySection>
              <ReadOnlySection title="Conteúdo">
                <div className="grid gap-4 text-sm leading-7 text-admin-text">
                  {blocks.length ? (
                    blocks.map((block, index) =>
                      block.type === 'heading' ? (
                        <h3 className="font-serif text-2xl" key={`${block.type}-${index}`}>
                          {block.text}
                        </h3>
                      ) : block.type === 'quote' ? (
                        <blockquote
                          className="border-l-4 border-brand-mint bg-surface-mint px-4 py-3"
                          key={`${block.type}-${index}`}
                        >
                          {block.text}
                        </blockquote>
                      ) : block.type === 'list' ? (
                        <p className="pl-4" key={`${block.type}-${index}`}>
                          • {block.text}
                        </p>
                      ) : (
                        <p key={`${block.type}-${index}`}>{block.text}</p>
                      ),
                    )
                  ) : (
                    <p className="text-muted">Nenhum conteúdo informado.</p>
                  )}
                </div>
              </ReadOnlySection>
            </>
          ) : null}
        </div>
      </main>
    </AppLayout>
  )
}
