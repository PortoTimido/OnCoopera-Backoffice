import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getApiErrorMessage } from '../../../shared/api/httpClient'
import { useBackofficeScale } from '../../backoffice/hooks/useBackofficeScale'
import {
  getDashboardMonthlyGrowth,
  type DashboardPeriod,
  type MonthlyGrowthPoint,
} from '../api/dashboardApi'
import { DashboardChartCard } from './DashboardChartCard'

const series = [
  { dataKey: 'articlesPublished', label: 'Artigos', color: '#3ecfb2' },
  { dataKey: 'supportLocations', label: 'Locais de suporte', color: '#6eb5ff' },
  { dataKey: 'activeUsers', label: 'Usuários ativos', color: '#8c72d6' },
] as const

type TooltipPayload = {
  color?: string
  dataKey?: string
  value?: number | null
}

function formatMonth(month: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  })
    .format(new Date(`${month}-01T00:00:00.000Z`))
    .replace('.', '')
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function GrowthTooltip({
  active,
  label,
  payload,
  visibleSeries,
}: {
  active?: boolean
  label?: string
  payload?: TooltipPayload[]
  visibleSeries: (typeof series)[number][]
}) {
  if (!active || !label || !payload?.length) return null

  return (
    <div className="rounded-xl bg-admin-text px-3 py-2 text-xs text-white shadow-lg">
      <p className="mb-1 font-semibold capitalize">{formatMonth(label)}</p>
      <ul className="grid gap-1">
        {visibleSeries.map((item) => {
          const value = payload.find((entry) => entry.dataKey === item.dataKey)?.value
          return (
            <li className="flex items-center justify-between gap-4" key={item.dataKey}>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span>{value === null || value === undefined ? '—' : formatNumber(value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ChartLegend({ visibleSeries }: { visibleSeries: (typeof series)[number][] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {visibleSeries.map((item) => (
        <li className="flex items-center gap-1.5" key={item.dataKey}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export function MonthlyGrowthChart() {
  const scale = useBackofficeScale()
  const [period, setPeriod] = useState<DashboardPeriod>(6)
  const [points, setPoints] = useState<MonthlyGrowthPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const visibleSeries = series.filter((item) =>
    points.some((point) => point[item.dataKey] !== null),
  )

  useEffect(() => {
    let isActive = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getDashboardMonthlyGrowth(period)
        if (isActive) setPoints(result.points)
      } catch (loadError) {
        if (isActive) {
          setPoints([])
          setError(getApiErrorMessage(loadError))
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void load()
    return () => {
      isActive = false
    }
  }, [period, reloadKey])

  return (
    <DashboardChartCard
      title="Crescimento mensal"
      action={
        <label className="sr-only">
          Período do crescimento mensal
          <select
            aria-label="Período do crescimento mensal"
            className="h-9 rounded-lg border border-line bg-surface-mint px-3 text-xs text-muted-strong outline-none transition focus:border-brand-mint focus:ring-2 focus:ring-brand-mint/30"
            onChange={(event) => setPeriod(Number(event.target.value) as DashboardPeriod)}
            value={period}
          >
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
          </select>
        </label>
      }
    >
      {isLoading ? (
        <div
          aria-label="Carregando crescimento mensal"
          className="data-grid-skeleton-block h-[var(--dashboard-chart-height,230px)]"
        />
      ) : error ? (
        <div className="grid min-h-[var(--dashboard-chart-height,230px)] place-items-center text-center text-sm text-muted">
          <div>
            <p>Não foi possível carregar o crescimento mensal.</p>
            <button
              className="mt-2 font-semibold text-brand-teal underline"
              onClick={() => setReloadKey((current) => current + 1)}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      ) : points.length === 0 ? (
        <div className="grid min-h-[var(--dashboard-chart-height,230px)] place-items-center text-center text-sm text-muted">
          Ainda não há dados suficientes para este período.
        </div>
      ) : (
        <>
          <div
            className="h-[var(--dashboard-chart-height,230px)] min-w-[var(--dashboard-chart-min-width,360px)]"
            role="img"
            aria-label="Gráfico de crescimento mensal"
          >
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart
                data={points}
                margin={{ top: 8 * scale, right: 4 * scale, left: -20 * scale, bottom: 0 }}
              >
                <defs>
                  {visibleSeries.map((item) => (
                    <linearGradient
                      id={`${item.dataKey}-gradient`}
                      key={item.dataKey}
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={item.color} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  stroke="#dde4e0"
                  strokeDasharray={`${3 * scale} ${4 * scale}`}
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tick={{ fill: '#6c7a75', fontSize: 11 * scale }}
                  tickFormatter={formatMonth}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: '#6c7a75', fontSize: 11 * scale }}
                  tickLine={false}
                  width={34 * scale}
                />
                <Tooltip
                  content={<GrowthTooltip visibleSeries={visibleSeries} />}
                  cursor={{ stroke: '#bbcac4', strokeDasharray: `${3 * scale} ${3 * scale}` }}
                />
                {visibleSeries.map((item) => (
                  <Area
                    dataKey={item.dataKey}
                    fill={`url(#${item.dataKey}-gradient)`}
                    key={item.dataKey}
                    name={item.label}
                    stroke={item.color}
                    strokeWidth={2 * scale}
                    type="monotone"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend visibleSeries={visibleSeries} />
        </>
      )}
    </DashboardChartCard>
  )
}
