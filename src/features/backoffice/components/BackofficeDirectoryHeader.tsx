import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

type BackofficeDirectoryHeaderProps = {
  backTo: string
  directory: string
  currentPage: string
}

/** Shared directory navigation for backoffice record screens. */
export function BackofficeDirectoryHeader({
  backTo,
  currentPage,
  directory,
}: BackofficeDirectoryHeaderProps) {
  return (
    <nav
      aria-label="Navegação da página"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 text-muted"
    >
      <Link
        className="inline-flex items-center gap-2 transition hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mint"
        to={backTo}
      >
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
        Voltar
      </Link>
      <span aria-hidden="true" className="h-5 w-px bg-line" />
      <span>{directory}</span>
      <span aria-hidden="true">›</span>
      <span aria-current="page" className="font-bold text-brand-teal">
        {currentPage}
      </span>
    </nav>
  )
}
