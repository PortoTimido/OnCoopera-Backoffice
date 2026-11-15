import { Clock3 } from 'lucide-react'
import { ArticleCalloutCard } from './ArticleCalloutCard'
import { ArticleHtml } from './ArticleHtml'
import { formatArticlePublicationDate, getArticleContentBlocks } from '../model/articleContent'
import type { ArticlePreviewData } from '../model/articlePreview'

type ArticleHtmlPreviewProps = {
  article: ArticlePreviewData
}

export function ArticleHtmlPreview({ article }: ArticleHtmlPreviewProps) {
  const contentBlocks = getArticleContentBlocks(article.contentHtml)
  const publicationDate = formatArticlePublicationDate(article.publishedAt)

  return (
    <article
      className="mx-auto w-full max-w-[430px] rounded-[28px] bg-[#f8fbfa] px-6 py-5 text-admin-text sm:px-8"
      aria-label={`Pré-visualização: ${article.title}`}
    >
      {article.imageUrl ? (
        <div className="relative overflow-hidden rounded-[24px]">
          <img
            alt={`Capa do artigo ${article.title}`}
            className="h-[220px] w-full object-cover"
            src={article.imageUrl}
          />
          <ReadingTime minutes={article.readingTimeMinutes} />
        </div>
      ) : (
        <ReadingTime minutes={article.readingTimeMinutes} />
      )}

      <div className="mt-5 grid gap-5">
        <h2 className="font-display text-[28px] leading-[34px] text-admin-text">
          {article.title || 'Artigo sem título'}
        </h2>
        {article.summary ? (
          <p className="text-base font-bold leading-[26px] text-muted">{article.summary}</p>
        ) : null}

        {contentBlocks.map((block, index) =>
          block.type === 'callout' ? (
            <ArticleCalloutCard key={`callout-${index}`} {...block} />
          ) : (
            <ArticleHtml className="article-html" html={block.html} key={`html-${index}`} />
          ),
        )}

        {article.authorName || publicationDate ? (
          <footer className="border-t border-line pt-5">
            {article.authorName ? (
              <p className="text-sm font-bold leading-[22px] text-admin-text">
                Por {article.authorName}
              </p>
            ) : null}
            {publicationDate ? (
              <p className="text-[13px] leading-5 text-muted">Publicado em {publicationDate}</p>
            ) : null}
          </footer>
        ) : null}
      </div>
    </article>
  )
}

function ReadingTime({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6b7ff]/90 px-4 py-2 text-xs font-bold leading-4 text-[#3d2a5c]">
      <Clock3 aria-hidden="true" size={14} strokeWidth={2.4} />
      {minutes} min de leitura
    </span>
  )
}
