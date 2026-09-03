import { useEffect, useRef, useState } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import { Document, Page, pdfjs } from 'react-pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { ArticlePdfDocument } from './ArticlePdfDocument'
import type { ArticlePreviewData } from '../model/articlePreview'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

type ArticlePdfPreviewProps = {
  article: ArticlePreviewData
}

export function ArticlePdfPreview({ article }: ArticlePdfPreviewProps) {
  const [pageCount, setPageCount] = useState(0)
  const [pageWidth, setPageWidth] = useState(760)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const maxPageWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--admin-pdf-page-width'), 10) || 760
      setPageWidth(Math.min(maxPageWidth, Math.max(280, entry.contentRect.width - 16)))
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef}>
      <BlobProvider document={<ArticlePdfDocument article={article} />}>
        {({ loading, url }) => {
          if (loading || !url) {
            return <div className="grid min-h-[var(--admin-pdf-preview-min-height)] place-items-center rounded-2xl bg-white text-sm text-muted">Gerando PDF...</div>
          }

          return (
            <Document
              className="grid justify-items-center gap-6"
              file={url}
              loading={<div className="grid min-h-[var(--admin-pdf-preview-min-height)] place-items-center rounded-2xl bg-white text-sm text-muted">Carregando PDF...</div>}
              onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            >
              {Array.from({ length: pageCount }, (_, index) => (
                <Page
                  className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(24,28,28,0.12)]"
                  key={`pdf-page-${index + 1}`}
                  pageNumber={index + 1}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  width={pageWidth}
                />
              ))}
            </Document>
          )
        }}
      </BlobProvider>
    </div>
  )
}
