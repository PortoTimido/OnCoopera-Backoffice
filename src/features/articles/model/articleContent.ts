export type ArticleContentBlock =
  { html: string; type: 'html' } | { html: string; type: 'callout'; variant: 'dica' | 'pergunta' }

const contentBlockPattern =
  /<(p|div|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1\s*>|(?:^|\r?\n)([^\r\n]*)(?=\r?\n|$)/gi

const htmlEntities: Record<string, string> = {
  '&amp;': '&',
  '&apos;': "'",
  '&gt;': '>',
  '&lt;': '<',
  '&nbsp;': ' ',
  '&quot;': '"',
}

function hasRenderableContent(html: string) {
  return (
    /<\s*(img|hr|br)\b/i.test(html) ||
    html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim().length > 0
  )
}

function getVisibleText(html: string) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|apos|gt|lt|nbsp|quot);|&#(?:x[0-9a-f]+|\d+);/gi, (entity) => {
      const namedEntity = htmlEntities[entity.toLocaleLowerCase('en-US')]

      if (namedEntity) {
        return namedEntity
      }

      const codePoint = entity.slice(2, -1)
      const isHexadecimal = codePoint.startsWith('x') || codePoint.startsWith('X')
      const value = Number.parseInt(
        isHexadecimal ? codePoint.slice(1) : codePoint,
        isHexadecimal ? 16 : 10,
      )

      return Number.isNaN(value) || value < 0 || value > 0x10ffff
        ? entity
        : String.fromCodePoint(value)
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function getCalloutVariant(content: string) {
  const match = getVisibleText(content).match(/^##\s*(dica|pergunta)\s*##$/i)

  return match ? (match[1].toLocaleLowerCase('pt-BR') as 'dica' | 'pergunta') : undefined
}

function isCalloutEnd(content: string) {
  return /^##\s*$/.test(getVisibleText(content))
}

function pushHtmlBlock(blocks: ArticleContentBlock[], html: string) {
  if (hasRenderableContent(html)) {
    blocks.push({ html, type: 'html' })
  }
}

/**
 * Matches the mobile parser: authored HTML is retained, while standalone
 * Dica/Pergunta markers delimit native callout cards.
 */
export function getArticleContentBlocks(content: unknown): ArticleContentBlock[] {
  if (typeof content !== 'string' || !content.trim()) {
    return []
  }

  const blocks: ArticleContentBlock[] = []
  let cursor = 0
  let calloutMarkerIndex: number | undefined
  let calloutStart: number | undefined
  let calloutVariant: 'dica' | 'pergunta' | undefined
  let markerMatch: RegExpExecArray | null

  contentBlockPattern.lastIndex = 0

  while ((markerMatch = contentBlockPattern.exec(content))) {
    const markerContent = markerMatch[2] ?? markerMatch[3]
    const variant = getCalloutVariant(markerContent)

    if (variant && !calloutVariant) {
      pushHtmlBlock(blocks, content.slice(cursor, markerMatch.index))
      calloutMarkerIndex = markerMatch.index
      calloutStart = contentBlockPattern.lastIndex
      calloutVariant = variant
      continue
    }

    if (!variant && calloutVariant && calloutStart !== undefined && isCalloutEnd(markerContent)) {
      blocks.push({
        html: content.slice(calloutStart, markerMatch.index),
        type: 'callout',
        variant: calloutVariant,
      })
      cursor = contentBlockPattern.lastIndex
      calloutMarkerIndex = undefined
      calloutStart = undefined
      calloutVariant = undefined
    }
  }

  if (calloutVariant && calloutStart !== undefined) {
    pushHtmlBlock(blocks, content.slice(calloutMarkerIndex))
  } else {
    pushHtmlBlock(blocks, content.slice(cursor))
  }

  return blocks
}

export function formatArticlePublicationDate(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? undefined
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date)
}
