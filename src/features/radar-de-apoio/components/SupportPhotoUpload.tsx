import { ImageUp, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'

const maxFileSize = 5 * 1024 * 1024

export function SupportPhotoUpload({ onFileChange }: { onFileChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Envie uma imagem JPG ou PNG.'); onFileChange(null); return }
    if (file.size > maxFileSize) { setError('A imagem deve ter no máximo 5 MB.'); onFileChange(null); return }
    setError(''); setFileName(file.name); onFileChange(file)
  }

  return <div className="grid gap-3">
    <input accept="image/jpeg,image/png" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} ref={inputRef} type="file" />
    <button className="grid min-h-52 place-items-center rounded-2xl border-2 border-dashed border-[#bbcac4]/60 bg-surface-mint px-5 py-7 text-center transition hover:border-brand-mint focus-visible:outline-2 focus-visible:outline-brand-mint" onClick={() => inputRef.current?.click()} type="button">
      <span className="grid gap-3 justify-items-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-brand-mint/20 text-brand-teal"><UploadCloud size={29} /></span><span className="text-sm font-bold text-admin-text">Clique para fazer upload</span><span className="-mt-2 text-sm text-muted">ou arraste uma imagem aqui</span><span className="text-xs text-muted">JPG ou PNG (Máx 5MB)</span></span>
    </button>
    {fileName ? <p className="inline-flex items-center gap-2 text-sm text-brand-teal"><ImageUp size={16} />{fileName}</p> : null}
    {error ? <p className="text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
  </div>
}
