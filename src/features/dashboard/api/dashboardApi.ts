import { httpClient } from '../../../shared/api/httpClient'

export type DashboardPeriod = 6 | 12

export type MonthlyGrowthPoint = {
  month: string
  articlesPublished: number | null
  supportLocations: number | null
  activeUsers: number | null
}

export type MonthlyGrowthResponse = {
  points: MonthlyGrowthPoint[]
}

export async function getDashboardMonthlyGrowth(periodMonths: DashboardPeriod) {
  const { data } = await httpClient.get<MonthlyGrowthResponse>(
    '/v1/backoffice/dashboard/crescimento-mensal',
    { params: { periodMonths } },
  )

  return data
}
