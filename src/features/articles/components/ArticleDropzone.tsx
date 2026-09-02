import { useCallback, useEffect, useMemo } from 'react'
import { ImageUp, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cx } from '../../../lib/cx'

type ArticleDropzoneProps = {
  file: File | null
  onFileChange: (file: File | null) => void
}

export function ArticleDropzone({ file, onFileChange }: ArticleDropzoneProps) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileChange(acceptedFiles[0] ?? null)
    },
    [onFileChange],
  )

  const { getInputProps, getRootProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/gif': ['.gif'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
    multiple: false,
    onDrop,
  })

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div
      {...getRootProps({
        className: cx(
          'group relative grid min-h-[var(--admin-dropzone-min-height)] cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#bbcac4]/50 bg-admin-canvas p-8 text-center transition',
          'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint',
          isDragActive ? 'border-brand-mint bg-brand-mint/10' : undefined,
          isDragReject ? 'border-red-300 bg-red-50' : undefined,
        ),
      })}
    >
      <input {...getInputProps()} aria-label="Imagem do artigo" />

      {previewUrl ? (
        <div className="grid w-full gap-3">
          <img className="max-h-[180px] w-full rounded-xl object-cover" src={previewUrl} alt="" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2 text-left shadow-[2px_2px_0_rgba(187,202,196,0.2)]">
            <span className="min-w-0 truncate text-sm text-admin-text">{file?.name}</span>
            <button
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-soft hover:text-admin-text"
              onClick={(event) => {
                event.stopPropagation()
                onFileChange(null)
              }}
              type="button"
              aria-label="Remover imagem"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid justify-items-center gap-1">
          <span className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#e0e3e2] text-muted-strong shadow-[4px_4px_0_rgba(187,202,196,0.2)] transition group-hover:-translate-y-0.5">
            <ImageUp size={18} strokeWidth={2} />
          </span>
          <p className="text-sm leading-5 text-admin-text">{isDragActive ? 'Solte a imagem aqui' : 'Clique para carregar ou arraste e solte'}</p>
          <p className="text-xs leading-4 text-muted">SVG, PNG, JPG or GIF (max. 800x400px)</p>
        </div>
      )}
    </div>
  )
}
