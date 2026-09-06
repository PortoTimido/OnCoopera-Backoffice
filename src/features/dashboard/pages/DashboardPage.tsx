import { useEffect, useState } from 'react'
import { listBackofficeSupports } from '../../radar-de-apoio/api/supportApi'
import { listBackofficeArticles } from '../../articles/api/articlesApi'
import { getCurrentUser } from '../../auth/api/authApi'
import { getStoredAccessToken, getStoredUser, storeAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { listBackofficeUsuarios } from '../../backoffice/api/backofficeApi'
import { backofficeAssets } from '../../backoffice/assets'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { MetricCard } from '../components/MetricCard'

type DashboardMetrics = {
  activeUsers: number | null
  articlesPublished: number | null
  supportLocations: number | null
}

const emptyMetrics: DashboardMetrics = {
  activeUsers: null,
  articlesPublished: null,
  supportLocations: null,
}

function formatMetric(value: number | null) {
  if (value === null) {
    return '—'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

export function DashboardPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser())
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics)

  useEffect(() => {
    const token = getStoredAccessToken()

    if (!token) {
      return
    }

    const accessToken = token
    let isMounted = true

    async function loadDashboardData() {
      const [currentUserResult, articlesResult, supportsResult, activeUsersResult] = await Promise.allSettled([
        getCurrentUser(),
        listBackofficeArticles({ page: 1, pageSize: 1, status: 'PUBLICADO' }),
        listBackofficeSupports({ page: 1, pageSize: 1, status: 'ATIVO' }),
        listBackofficeUsuarios({ page: 1, pageSize: 1, status: 'ATIVO' }),
      ])

      if (!isMounted) {
        return
      }

      if (currentUserResult.status === 'fulfilled') {
        setUser(currentUserResult.value)
        storeAuthSession(accessToken, currentUserResult.value)
      }

      setMetrics({
        activeUsers: activeUsersResult.status === 'fulfilled' ? activeUsersResult.value.total : null,
        articlesPublished: articlesResult.status === 'fulfilled' ? articlesResult.value.total : null,
        supportLocations: supportsResult.status === 'fulfilled' ? supportsResult.value.total : null,
      })
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AppLayout activeItem="Início" user={user}>
      <main className="flex min-h-0 flex-1 flex-col gap-12 overflow-auto p-6 sm:p-10 lg:p-12" data-figma-node-id="327:36">
        <header className="grid gap-2">
          <h1 className="font-display text-4xl leading-10 text-admin-text">Início</h1>
          <p className="text-sm leading-5 text-muted">Indicadores atualizados com dados das APIs.</p>
        </header>

        <section className="grid w-full gap-6 lg:grid-cols-3" aria-label="Indicadores principais">
          <MetricCard
            icon={backofficeAssets.metricArticles}
            iconClassName="h-[18px] w-[18px]"
            label="Artigos publicados"
            tone="mint"
            value={formatMetric(metrics.articlesPublished)}
          />
          <MetricCard
            icon={backofficeAssets.metricSupport}
            iconClassName="h-5 w-4"
            label="Locais de suporte"
            tone="blue"
            value={formatMetric(metrics.supportLocations)}
          />
          <MetricCard
            icon={backofficeAssets.metricUsers}
            iconClassName="h-4 w-[22px]"
            label="Usuários ativos"
            tone="neutral"
            value={formatMetric(metrics.activeUsers)}
          />
        </section>
      </main>
    </AppLayout>
  )
}
