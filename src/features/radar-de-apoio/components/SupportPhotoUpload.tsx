import { ImageUp, UploadCloud, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { SupportImage } from '../model/supportTypes'

const maxFileSize = 5 * 1024 * 1024

type SupportPhotoUploadProps = {
  existingImage: SupportImage | null
  file: File | null
  onFileChange: (file: File | null) => void
  onRemoveImage: () => void
}

export function SupportPhotoUpload({ existingImage, file, onFileChange, onRemoveImage }: SupportPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const localPreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  const previewUrl = localPreviewUrl || existingImage?.url || ''

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  function handleFile(fileToValidate: File | undefined) {
    if (!fileToValidate) return
    if (!['image/jpeg', 'image/png'].includes(fileToValidate.type)) {
      setError('Envie uma imagem JPG ou PNG.')
      onFileChange(null)
      return
    }
    if (fileToValidate.size > maxFileSize) {
      setError('A imagem deve ter no máximo 5 MB.')
      onFileChange(null)
      return
    }

    setError('')
    onFileChange(fileToValidate)
  }

  function handleRemove() {
    setError('')
    if (file) {
      onFileChange(null)
      return
    }

    onRemoveImage()
  }

  return (
    <div className="grid gap-3">
      <input accept="image/jpeg,image/png" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} ref={inputRef} type="file" />
      {previewUrl ? (
        <div className="grid gap-3 rounded-2xl border border-[#bbcac4]/35 bg-surface-mint p-3">
          <img alt="Foto do local" className="h-52 w-full rounded-xl object-cover" src={previewUrl} />
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-sm text-admin-text">{file?.name ?? 'Foto atual do local'}</span>
            <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white hover:text-admin-text" onClick={handleRemove} type="button" aria-label="Remover foto">
              <X size={16} strokeWidth={2} />
            </button>
          </div>
          <button className="text-left text-sm font-bold text-brand-teal" onClick={() => inputRef.current?.click()} type="button">Trocar foto</button>
        </div>
      ) : (
        <button className="grid min-h-52 place-items-center rounded-2xl border-2 border-dashed border-[#bbcac4]/60 bg-surface-mint px-5 py-7 text-center transition hover:border-brand-mint focus-visible:outline-2 focus-visible:outline-brand-mint" onClick={() => inputRef.current?.click()} type="button">
          <span className="grid gap-3 justify-items-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-brand-mint/20 text-brand-teal"><UploadCloud size={29} /></span><span className="text-sm font-bold text-admin-text">Clique para fazer upload</span><span className="-mt-2 text-sm text-muted">ou arraste uma imagem aqui</span><span className="text-xs text-muted">JPG ou PNG (Máx 5MB)</span></span>
        </button>
      )}
      {file ? <p className="inline-flex items-center gap-2 text-sm text-brand-teal"><ImageUp size={16} />{file.name}</p> : null}
      {error ? <p className="text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
    </div>
  )
}
