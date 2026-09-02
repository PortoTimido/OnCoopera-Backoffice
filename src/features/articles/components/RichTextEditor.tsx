import { useEffect } from 'react'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading1, Heading2, Image, Italic, Link, List, ListOrdered, Quote, Underline } from 'lucide-react'
import { cx } from '../../../lib/cx'

type RichTextEditorProps = {
  onChange: (html: string) => void
  value: string
}

const toolbarGroups = [
  [
    { icon: Bold, label: 'Negrito', action: 'bold' },
    { icon: Italic, label: 'Itálico', action: 'italic' },
    { icon: Underline, label: 'Sublinhado', action: 'underline' },
  ],
  [
    { icon: Heading1, label: 'Título 1', action: 'heading1' },
    { icon: Heading2, label: 'Título 2', action: 'heading2' },
  ],
  [
    { icon: List, label: 'Lista', action: 'bulletList' },
    { icon: ListOrdered, label: 'Lista numerada', action: 'orderedList' },
  ],
  [
    { icon: Link, label: 'Link', action: 'link' },
    { icon: Image, label: 'Imagem inline', action: 'image' },
    { icon: Quote, label: 'Citação', action: 'blockquote' },
  ],
] as const

export function RichTextEditor({ onChange, value }: RichTextEditorProps) {
  const editor = useEditor({
    content: value,
    editorProps: {
      attributes: {
        class: 'article-rich-text-editor min-h-[350px] px-6 py-5 text-base leading-[26px] text-admin-text outline-none',
      },
    },
    extensions: [
      StarterKit.configure({
        link: {
          autolink: true,
          openOnClick: false,
        },
      }),
      TiptapImage.configure({
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever o seu artigo aqui...',
      }),
    ],
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === value) {
      return
    }

    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  function runAction(action: (typeof toolbarGroups)[number][number]['action']) {
    if (!editor) {
      return
    }

    const chain = editor.chain().focus()

    if (action === 'bold') {
      chain.toggleBold().run()
      return
    }

    if (action === 'italic') {
      chain.toggleItalic().run()
      return
    }

    if (action === 'underline') {
      chain.toggleUnderline().run()
      return
    }

    if (action === 'heading1') {
      chain.toggleHeading({ level: 1 }).run()
      return
    }

    if (action === 'heading2') {
      chain.toggleHeading({ level: 2 }).run()
      return
    }

    if (action === 'bulletList') {
      chain.toggleBulletList().run()
      return
    }

    if (action === 'orderedList') {
      chain.toggleOrderedList().run()
      return
    }

    if (action === 'link') {
      const previousUrl = editor.getAttributes('link').href as string | undefined
      const url = window.prompt('URL do link', previousUrl ?? '')

      if (url === null) {
        return
      }

      if (url.trim() === '') {
        chain.unsetLink().run()
        return
      }

      chain.setLink({ href: url.trim() }).run()
      return
    }

    if (action === 'image') {
      const url = window.prompt('URL da imagem')

      if (url?.trim()) {
        chain.setImage({ src: url.trim() }).run()
      }

      return
    }

    chain.toggleBlockquote().run()
  }

  function isActive(action: (typeof toolbarGroups)[number][number]['action']) {
    if (!editor) {
      return false
    }

    if (action === 'heading1') {
      return editor.isActive('heading', { level: 1 })
    }

    if (action === 'heading2') {
      return editor.isActive('heading', { level: 2 })
    }

    if (action === 'link') {
      return editor.isActive('link')
    }

    if (action === 'image') {
      return editor.isActive('image')
    }

    return editor.isActive(action)
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#bbcac4]/15 bg-surface-soft px-3 py-3">
        {toolbarGroups.map((group, index) => (
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-[inset_1px_1px_2px_rgba(215,219,218,0.5)]" key={index}>
            {group.map((item) => {
              const Icon = item.icon
              const active = isActive(item.action)

              return (
                <button
                  className={cx(
                    'grid h-8 w-8 place-items-center rounded-lg text-muted-strong transition hover:bg-surface-soft hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-brand-mint',
                    active ? 'bg-brand-mint/20 text-brand-teal' : undefined,
                  )}
                  onClick={() => runAction(item.action)}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={active}
                  title={item.label}
                  key={item.action}
                >
                  <Icon size={15} strokeWidth={2.4} />
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
