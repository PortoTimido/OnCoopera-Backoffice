import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ArticlePreviewData } from '../model/articlePreview'

type ArticlePdfDocumentProps = {
  article: ArticlePreviewData
}

type PdfBlock = {
  text: string
  type: 'heading' | 'list' | 'paragraph' | 'quote'
}

const styles = StyleSheet.create({
  body: {
    color: '#181c1c',
    fontFamily: 'Helvetica',
    padding: 42,
  },
  category: {
    backgroundColor: '#dff6f0',
    borderRadius: 999,
    color: '#006b5a',
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  content: {
    marginTop: 24,
  },
  coverImage: {
    borderRadius: 12,
    height: 180,
    marginTop: 20,
    objectFit: 'cover',
    width: '100%',
  },
  heading: {
    color: '#181c1c',
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: 8,
    marginTop: 10,
  },
  meta: {
    color: '#6c7a75',
    fontSize: 10,
    marginTop: 10,
  },
  paragraph: {
    color: '#3c4a45',
    fontSize: 12,
    lineHeight: 1.65,
    marginBottom: 10,
  },
  quote: {
    backgroundColor: '#eef5f1',
    borderLeftColor: '#3ecfb2',
    borderLeftWidth: 4,
    color: '#3c4a45',
    fontSize: 12,
    lineHeight: 1.55,
    marginBottom: 10,
    padding: 10,
  },
  tag: {
    backgroundColor: '#e6e9e8',
    borderRadius: 999,
    color: '#3c4a45',
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
  },
  title: {
    color: '#181c1c',
    fontFamily: 'Times-Bold',
    fontSize: 30,
    lineHeight: 1.15,
    marginTop: 14,
  },
})

function parseHtmlBlocks(html: string): PdfBlock[] {
  if (typeof document === 'undefined') {
    return [{ text: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), type: 'paragraph' }]
  }

  const template = document.createElement('template')
  template.innerHTML = html
  const elements = Array.from(template.content.children)

  if (elements.length === 0) {
    const text = template.content.textContent?.replace(/\s+/g, ' ').trim()
    return text ? [{ text, type: 'paragraph' }] : []
  }

  return elements
    .flatMap((element): PdfBlock[] => {
      const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? ''

      if (!text) {
        return []
      }

      if (element.tagName === 'H1' || element.tagName === 'H2') {
        return [{ text, type: 'heading' }]
      }

      if (element.tagName === 'BLOCKQUOTE') {
        return [{ text, type: 'quote' }]
      }

      if (element.tagName === 'UL' || element.tagName === 'OL') {
        return Array.from(element.children)
          .map((item) => item.textContent?.replace(/\s+/g, ' ').trim())
          .filter((item): item is string => Boolean(item))
          .map((item) => ({ text: `• ${item}`, type: 'list' }))
      }

      return [{ text, type: 'paragraph' }]
    })
    .filter((block) => block.text)
}

export function ArticlePdfDocument({ article }: ArticlePdfDocumentProps) {
  const blocks = parseHtmlBlocks(article.contentHtml)
  const categories = article.categories.length > 0 ? article.categories : ['Sem categoria']

  return (
    <Document title={article.title}>
      <Page size="A4" style={styles.body}>
        <View>
          <View style={styles.tagRow}>
            {categories.map((category) => (
              <Text key={category} style={styles.category}>
                {category}
              </Text>
            ))}
          </View>
          <Text style={styles.title}>{article.title || 'Artigo sem título'}</Text>
          <Text style={styles.meta}>
            {article.readingTimeMinutes} min de leitura · {article.status}
          </Text>
          {article.summary ? <Text style={[styles.paragraph, { marginTop: 18 }]}>{article.summary}</Text> : null}
          {article.imageUrl ? <Image src={article.imageUrl} style={styles.coverImage} /> : null}
        </View>

        <View style={styles.content}>
          {blocks.map((block, index) => {
            if (block.type === 'heading') {
              return (
                <Text key={`${block.type}-${index}`} style={styles.heading}>
                  {block.text}
                </Text>
              )
            }

            if (block.type === 'quote') {
              return (
                <Text key={`${block.type}-${index}`} style={styles.quote}>
                  {block.text}
                </Text>
              )
            }

            return (
              <Text key={`${block.type}-${index}`} style={styles.paragraph}>
                {block.text}
              </Text>
            )
          })}
        </View>

        {article.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {article.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
