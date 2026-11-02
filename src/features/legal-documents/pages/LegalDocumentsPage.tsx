import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Save } from 'lucide-react'
import { useToast } from '../../../components/ui/useToast'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { RichTextEditor } from '../../articles/components/RichTextEditor'
import {
  createLegalDocument,
  getLegalDocument,
  updateLegalDocument,
  type LegalDocument,
  type LegalDocumentType,
} from '../api/legalDocumentsApi'

type DocumentTab = {
  label: string
  placeholder: string
  type: LegalDocumentType
}

type DocumentState = {
  content: string
  document: LegalDocument | null
  error: boolean
  hasLoaded: boolean
  isLoading: boolean
}

const tabs: DocumentTab[] = [
  {
    label: 'Termos de uso',
    placeholder: 'Escreva os termos de uso...',
    type: 'TERMOS_USO',
  },
  {
    label: 'Política de privacidade',
    placeholder: 'Escreva a política de privacidade...',
    type: 'POLITICA_PRIVACIDADE',
  },
]

const emptyDocumentState: DocumentState = {
  content: '<p></p>',
  document: null,
  error: false,
  hasLoaded: false,
  isLoading: false,
}

function getInitialStates() {
  return Object.fromEntries(
    tabs.map((tab) => [tab.type, { ...emptyDocumentState }]),
  ) as Record<LegalDocumentType, DocumentState>
}

function hasTextContent(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length > 0
}

function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404
}

function getSaveSuccessMessage(tab: DocumentTab) {
  return tab.type === 'TERMOS_USO'
    ? 'Termos de uso salvos com sucesso.'
    : 'Política de privacidade salva com sucesso.'
}

export function LegalDocumentsPage() {
  const toast = useToast()
  const user = getStoredUser()
  const [activeType, setActiveType] = useState<LegalDocumentType>('TERMOS_USO')
  const [documents, setDocuments] = useState<Record<LegalDocumentType, DocumentState>>(getInitialStates)
  const documentsRef = useRef(documents)
  const [isSaving, setIsSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const activeTab = tabs.find((tab) => tab.type === activeType)!
  const activeDocument = documents[activeType]

  useEffect(() => {
    documentsRef.current = documents
  }, [documents])

  useEffect(() => {
    const documentState = documentsRef.current[activeType]

    if (documentState.hasLoaded || documentState.isLoading) {
      return
    }

    let isMounted = true

    async function loadDocument() {
      setDocuments((current) => ({
        ...current,
        [activeType]: { ...current[activeType], error: false, isLoading: true },
      }))

      try {
        const document = await getLegalDocument(activeType)

        if (!isMounted) return

        setDocuments((current) => ({
          ...current,
          [activeType]: {
            content: document.conteudo || '<p></p>',
            document,
            error: false,
            hasLoaded: true,
            isLoading: false,
          },
        }))
      } catch (error) {
        if (!isMounted) return

        if (isNotFoundError(error)) {
          setDocuments((current) => ({
            ...current,
            [activeType]: { ...current[activeType], hasLoaded: true, isLoading: false },
          }))
          return
        }

        setDocuments((current) => ({
          ...current,
          [activeType]: { ...current[activeType], error: true, isLoading: false },
        }))
        toast.error(getApiErrorMessage(error))
      }
    }

    loadDocument()

    return () => {
      isMounted = false
    }
  }, [activeType, reloadToken, toast])

  function handleContentChange(content: string) {
    setDocuments((current) => ({
      ...current,
      [activeType]: { ...current[activeType], content },
    }))
  }

  async function handleSave() {
    if (!hasTextContent(activeDocument.content)) {
      toast.alert(`Escreva o conteúdo de ${activeTab.label.toLowerCase()} antes de salvar.`)
      return
    }

    setIsSaving(true)

    try {
      const savedDocument = activeDocument.document
        ? await updateLegalDocument(activeType, { conteudo: activeDocument.content })
        : await createLegalDocument({ tipo: activeType, conteudo: activeDocument.content })

      setDocuments((current) => ({
        ...current,
        [activeType]: {
          ...current[activeType],
          content: savedDocument.conteudo,
          document: savedDocument,
        },
      }))
      toast.success(getSaveSuccessMessage(activeTab))
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout activeItem="Documentos legais" user={user}>
      <main className="min-h-0 flex-1 overflow-auto bg-admin-canvas p-6 sm:p-10 lg:p-12">
        <div className="mx-auto grid w-full max-w-[1080px] gap-6">
          <header className="grid gap-2">
            <h1 className="font-serif text-[length:var(--admin-page-title-size)] font-semibold leading-[var(--admin-page-title-line-height)] text-admin-text">
              Documentos legais
            </h1>
            <p className="text-sm leading-5 text-muted-strong">
              Gerencie os termos de uso e a política de privacidade exibidos no aplicativo.
            </p>
          </header>

          <section className="overflow-hidden rounded-3xl bg-white shadow-[inset_2px_2px_4px_rgba(215,219,218,0.5)]">
            <div className="flex gap-1 border-b border-[#bbcac4]/15 px-4 pt-4" role="tablist" aria-label="Documentos legais">
              {tabs.map((tab) => {
                const isActive = tab.type === activeType

                return (
                  <button
                    aria-selected={isActive}
                    className={`rounded-t-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-mint ${
                      isActive
                        ? 'bg-surface-soft text-brand-teal'
                        : 'text-muted-strong hover:bg-surface-soft/70 hover:text-brand-teal'
                    }`}
                    key={tab.type}
                    onClick={() => setActiveType(tab.type)}
                    role="tab"
                    type="button"
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="grid gap-5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-admin-text">{activeTab.label}</h2>
                  <p className="text-sm text-muted">Altere o conteúdo e salve para publicá-lo.</p>
                </div>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-teal px-5 text-sm font-semibold text-white shadow-[4px_4px_0_rgba(187,202,196,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving || activeDocument.isLoading || !activeDocument.hasLoaded}
                  onClick={handleSave}
                  type="button"
                >
                  <Save size={16} strokeWidth={2.2} />
                  {isSaving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>

              {activeDocument.isLoading ? (
                <div className="min-h-[350px] rounded-3xl bg-surface-soft p-6 text-sm text-muted">
                  Carregando {activeTab.label.toLowerCase()}...
                </div>
              ) : activeDocument.error ? (
                <div className="grid min-h-40 place-items-center gap-3 rounded-3xl bg-red-50 p-6 text-center text-sm text-red-700">
                  <p>Não foi possível carregar este documento.</p>
                  <button
                    className="rounded-xl bg-white px-4 py-2 font-semibold text-red-700 shadow-[2px_2px_0_rgba(220,38,38,0.12)]"
                    onClick={() =>
                      setReloadToken((current) => current + 1)
                    }
                    type="button"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <div role="tabpanel">
                  <RichTextEditor
                    key={activeType}
                    onChange={handleContentChange}
                    placeholder={activeTab.placeholder}
                    value={activeDocument.content}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  )
}
