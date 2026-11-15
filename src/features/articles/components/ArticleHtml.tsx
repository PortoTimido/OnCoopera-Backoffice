import { sanitizeArticleHtml } from '../model/sanitizeArticleHtml'

type ArticleHtmlProps = {
  className?: string
  html: string
}

export function ArticleHtml({ className, html }: ArticleHtmlProps) {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(html) }} />
  )
}
