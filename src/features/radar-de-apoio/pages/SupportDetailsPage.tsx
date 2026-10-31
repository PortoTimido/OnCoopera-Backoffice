import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { getStoredUser } from '../../auth/model/authSession'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { BackofficeDirectoryHeader } from '../../backoffice/components/BackofficeDirectoryHeader'
import {
  ReadOnlyField,
  ReadOnlyFields,
  ReadOnlySection,
} from '../../backoffice/components/ReadOnlyDetails'
import { getBackofficeSupport } from '../api/supportApi'
import { SupportMap } from '../components/SupportMap'
import {
  supportCategoryLabels,
  supportStatusLabels,
  type SupportResource,
} from '../model/supportTypes'

const days = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export function SupportDetailsPage() {
  const { supportId } = useParams()
  const [support, setSupport] = useState<SupportResource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const image = useMemo(
    () =>
      support?.imagens.slice().sort((a, b) => a.ordem - b.ordem)[0]?.url ?? support?.imagensUrl[0],
    [support],
  )

  useEffect(() => {
    if (!supportId) return
    let active = true
    void getBackofficeSupport(supportId)
      .then((result) => active && setSupport(result))
      .catch((loadError) => active && setError(getApiErrorMessage(loadError)))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [supportId])

  return (
    <AppLayout activeItem="Radar de Apoio" user={getStoredUser()}>
      <main className="min-h-0 flex-1 overflow-auto bg-admin-canvas p-6 sm:p-10 lg:p-12">
        <div className="mx-auto grid w-full max-w-5xl gap-6">
          <BackofficeDirectoryHeader
            backTo="/radar-de-apoio"
            currentPage="Consultar apoio"
            directory="Radar de Apoio"
          />
          {isLoading ? (
            <p className="rounded-3xl bg-white p-8 text-sm text-muted">Carregando apoio...</p>
          ) : null}
          {error ? <p className="rounded-3xl bg-white p-8 text-sm text-red-700">{error}</p> : null}
          {support ? (
            <>
              <ReadOnlySection title="Informações gerais">
                <ReadOnlyFields>
                  <ReadOnlyField label="Nome do local" value={support.nome} />
                  <ReadOnlyField
                    label="Categoria"
                    value={supportCategoryLabels[support.tipoApoio]}
                  />
                  <ReadOnlyField label="Telefone" value={support.telefone} />
                  <ReadOnlyField label="Status" value={supportStatusLabels[support.status]} />
                </ReadOnlyFields>
                <ReadOnlyField label="Descrição" value={support.descricao} />
                {image ? (
                  <img
                    alt={`Foto de ${support.nome}`}
                    className="max-h-80 w-full rounded-2xl object-cover"
                    src={image}
                  />
                ) : null}
              </ReadOnlySection>
              <ReadOnlySection title="Endereço e localização">
                <ReadOnlyFields>
                  <ReadOnlyField label="CEP" value={support.endereco.cep} />
                  <ReadOnlyField
                    label="Logradouro"
                    value={`${support.endereco.logradouro}, ${support.endereco.numero}`}
                  />
                  <ReadOnlyField label="Bairro" value={support.endereco.bairro} />
                  <ReadOnlyField
                    label="Cidade / Estado"
                    value={`${support.endereco.cidade} / ${support.endereco.estado}`}
                  />
                </ReadOnlyFields>
                <SupportMap
                  coordinates={support.endereco}
                  geocodingMessage=""
                  isGeocoding={false}
                  readOnly
                />
              </ReadOnlySection>
              <ReadOnlySection title="Horários">
                <dl className="grid gap-2">
                  {days.map((day, index) => {
                    const entries = support.horarios.filter((entry) => entry.diaSemana === index)
                    return (
                      <div
                        className="flex justify-between gap-4 border-b border-line py-2 text-sm last:border-0"
                        key={day}
                      >
                        <dt className="font-bold text-admin-text">{day}</dt>
                        <dd className="text-muted-strong">
                          {entries.length
                            ? entries
                                .map((entry) => `${entry.horarioInicio} – ${entry.horarioFim}`)
                                .join(', ')
                            : 'Fechado'}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </ReadOnlySection>
            </>
          ) : null}
        </div>
      </main>
    </AppLayout>
  )
}
