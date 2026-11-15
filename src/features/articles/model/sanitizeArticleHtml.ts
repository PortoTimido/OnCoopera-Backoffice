import DOMPurify from 'dompurify'

const sanitizeOptions = {
  ALLOWED_ATTR: ['alt', 'height', 'href', 'rel', 'src', 'start', 'target', 'title', 'width'],
  ALLOWED_TAGS: [
    'a',
    'b',
    'blockquote',
    'br',
    'del',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    's',
    'span',
    'strong',
    'u',
    'ul',
  ],
  ALLOW_DATA_ATTR: false,
}

export function sanitizeArticleHtml(html: string) {
  return DOMPurify.sanitize(html, sanitizeOptions)
}
