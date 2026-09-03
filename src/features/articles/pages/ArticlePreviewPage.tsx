import { PDFDownloadLink } from '@react-pdf/renderer'
import { ArrowLeft, Download } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { ArticlePdfDocument } from '../components/ArticlePdfDocument'
import { ArticlePdfPreview } from '../components/ArticlePdfPreview'
import { getStoredArticlePreview, type ArticlePreviewData } from '../model/articlePreview'

type PreviewLocationState = {
  preview?: ArticlePreviewData
}

export function ArticlePreviewPage() {
  const location = useLocation()
  const user = getStoredUser()
  const article = (location.state as PreviewLocationState | null)?.preview ?? getStoredArticlePreview()

  return (
    <AppLayout activeItem="Artigos" user={user}>
      <main className="min-h-0 flex-1 overflow-auto bg-surface-soft p-6 sm:p-10 lg:p-12">
        <div className="mx-auto grid h-full min-h-[var(--admin-preview-min-height)] w-full max-w-[var(--admin-preview-content-max)] grid-rows-[auto_1fr] gap-6">
          <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)] sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-2">
              <Link className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand-teal hover:underline" to="/artigos">
                <ArrowLeft size={16} strokeWidth={2.2} />
                Voltar para artigos
              </Link>
              <div>
                <h1 className="font-serif text-[length:var(--admin-page-title-size)] font-semibold leading-[var(--admin-page-title-line-height)] text-admin-text">Pré-visualização do artigo</h1>
                <p className="mt-1 text-sm leading-5 text-muted">PDF gerado para conferência antes da publicação.</p>
              </div>
            </div>

            {article ? (
              <PDFDownloadLink
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-teal px-5 text-sm text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5"
                document={<ArticlePdfDocument article={article} />}
                fileName={`${article.title || 'artigo'}.pdf`}
              >
                <Download size={16} strokeWidth={2.2} />
                Baixar PDF
              </PDFDownloadLink>
            ) : null}
          </header>

          {article ? (
            <section className="overflow-auto rounded-3xl bg-white/70 p-6 shadow-[4px_4px_0_rgba(187,202,196,0.2),inset_2px_2px_4px_rgba(215,219,218,0.5)]">
              <ArticlePdfPreview article={article} />
            </section>
          ) : (
            <section className="grid place-items-center rounded-3xl bg-white p-8 text-center shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
              <div className="max-w-md">
                <h2 className="font-serif text-2xl font-semibold text-admin-text">Nenhum preview disponível</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Abra a pré-visualização a partir do cadastro ou publique um artigo para gerar o PDF.</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
