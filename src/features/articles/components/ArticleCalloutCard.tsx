import { Lightbulb, NotebookTabs } from 'lucide-react'
import { ArticleHtml } from './ArticleHtml'
import type { ArticleContentBlock } from '../model/articleContent'

type ArticleCalloutCardProps = Extract<ArticleContentBlock, { type: 'callout' }>

const appearance = {
  dica: {
    Icon: Lightbulb,
    className: 'border-[#d1e6dc] bg-[#e8f8f2] text-[#005446]',
    title: 'Dica',
  },
  pergunta: {
    Icon: NotebookTabs,
    className: 'border-[#eee2cd] bg-[#fff3df] text-[#7a5c00]',
    title: 'Pergunte ao seu médico',
  },
} as const

export function ArticleCalloutCard({ html, variant }: ArticleCalloutCardProps) {
  const { Icon, className, title } = appearance[variant]

  return (
    <aside
      aria-label={title}
      className={`rounded-[40px] border-2 px-6 py-7 shadow-clay-sage-soft sm:px-8 sm:py-8 ${className}`}
    >
      <div className="flex items-center gap-4">
        <Icon aria-hidden="true" size={32} strokeWidth={2.5} />
        <h2 className="font-sans text-[25px] font-bold leading-[31px]">{title}</h2>
      </div>
      <ArticleHtml className="article-html mt-4 pl-0 sm:ml-14 sm:pl-0" html={html} />
    </aside>
  )
}
