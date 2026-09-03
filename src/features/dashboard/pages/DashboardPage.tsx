import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../auth/api/authApi'
import { getStoredAccessToken, getStoredUser, storeAuthSession } from '../../auth/model/authSession'
import type { AuthenticatedUser } from '../../auth/model/authTypes'
import { listBackofficeUsuarios } from '../../backoffice/api/backofficeApi'
import { backofficeAssets } from '../../backoffice/assets'
import { AppLayout } from '../../backoffice/components/AppLayout'
import { MetricCard } from '../components/MetricCard'

const dashboardFallbacks = {
  articlesPublished: 24,
  supportLocations: 43,
  activeUsers: 1247,
}

function formatMetric(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function DashboardPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser())
  const [activeUsers, setActiveUsers] = useState(dashboardFallbacks.activeUsers)

  useEffect(() => {
    const token = getStoredAccessToken()

    if (!token) {
      return
    }

    const accessToken = token
    let isMounted = true

    async function loadDashboardData() {
      const [currentUserResult, activeUsersResult] = await Promise.allSettled([
        getCurrentUser(),
        listBackofficeUsuarios({ page: 1, pageSize: 1, status: 'ATIVO' }),
      ])

      if (!isMounted) {
        return
      }

      if (currentUserResult.status === 'fulfilled') {
        setUser(currentUserResult.value)
        storeAuthSession(accessToken, currentUserResult.value)
      }

      if (activeUsersResult.status === 'fulfilled') {
        setActiveUsers(activeUsersResult.value.total)
      }
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
          <p className="text-sm leading-5 text-muted">Última alteração: hoje as 14:32</p>
        </header>

        <section className="grid w-full gap-6 lg:grid-cols-3" aria-label="Indicadores principais">
          <MetricCard
            icon={backofficeAssets.metricArticles}
            iconClassName="h-[18px] w-[18px]"
            label="Artigos publicados"
            tone="mint"
            value={formatMetric(dashboardFallbacks.articlesPublished)}
          />
          <MetricCard
            icon={backofficeAssets.metricSupport}
            iconClassName="h-5 w-4"
            label="Locais de suporte"
            tone="blue"
            value={formatMetric(dashboardFallbacks.supportLocations)}
          />
          <MetricCard
            icon={backofficeAssets.metricUsers}
            iconClassName="h-4 w-[22px]"
            label="Usuários ativos"
            tone="neutral"
            value={formatMetric(activeUsers)}
          />
        </section>
      </main>
    </AppLayout>
  )
}
