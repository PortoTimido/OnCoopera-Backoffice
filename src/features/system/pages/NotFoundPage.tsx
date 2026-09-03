import { ArrowLeft, Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LinkButton } from '../../../components/ui/Button'

export function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-surface-mint px-6 py-10 text-ink">
      <section className="w-full max-w-[520px] rounded-[32px] border border-line bg-white p-8 text-center shadow-clay-teal sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-mint/20 text-brand-teal shadow-input-inset">
          <SearchX size={30} strokeWidth={1.8} />
        </div>

        <p className="mt-8 text-sm font-bold uppercase text-brand-teal">Erro 404</p>
        <h1 className="mt-2 font-serif text-[40px] font-semibold leading-tight text-ink">Página não encontrada</h1>
        <p className="mx-auto mt-3 max-w-[380px] text-base leading-7 text-muted-strong">
          A rota acessada não existe ou foi movida dentro do painel administrativo.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <LinkButton icon={<Home size={18} strokeWidth={2.1} />} iconPosition="left" to="/dashboard">
            Ir para início
          </LinkButton>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#bbcac4] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand-mint"
            to="/login"
          >
            <ArrowLeft size={18} strokeWidth={2.1} />
            Voltar ao login
          </Link>
        </div>
      </section>
    </main>
  )
}
