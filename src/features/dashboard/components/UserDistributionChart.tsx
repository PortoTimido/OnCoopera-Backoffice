import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { DashboardChartCard } from './DashboardChartCard'

export type UserDistribution = {
  active: number | null
  inactive: number | null
  blocked: number | null
}

const statuses = [
  { key: 'active', label: 'Ativos', color: '#3ecfb2' },
  { key: 'inactive', label: 'Inativos', color: '#6eb5ff' },
  { key: 'blocked', label: 'Bloqueados', color: '#e77d94' },
] as const

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function UserDistributionChart({ distribution }: { distribution: UserDistribution }) {
  const valuesAvailable = Object.values(distribution).every((value) => value !== null)
  const data = statuses.map((status) => ({
    ...status,
    value: distribution[status.key] ?? 0,
  }))
  const total = data.reduce((sum, status) => sum + status.value, 0)

  return (
    <DashboardChartCard title="Distribuição de usuários">
      {!valuesAvailable ? (
        <div className="grid min-h-[230px] place-items-center text-center text-sm text-muted">
          Não foi possível carregar a distribuição de usuários.
        </div>
      ) : total === 0 ? (
        <div className="grid min-h-[230px] place-items-center text-center text-sm text-muted">
          Ainda não há usuários cadastrados.
        </div>
      ) : (
        <div className="flex min-h-[230px] flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div
            className="relative h-[190px] w-[190px] shrink-0"
            role="img"
            aria-label={`Distribuição de ${total} usuários`}
          >
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Pie
                  cx="50%"
                  cy="50%"
                  data={data}
                  dataKey="value"
                  endAngle={-270}
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  startAngle={90}
                  stroke="none"
                >
                  {data.map((status) => (
                    <Cell fill={status.color} key={status.key} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-2xl leading-7 text-admin-text">
                  {formatNumber(total)}
                </p>
                <p className="text-xs text-muted">Usuários</p>
              </div>
            </div>
          </div>
          <ul className="grid w-full gap-3 sm:w-auto">
            {data.map((status) => (
              <li
                className="flex min-w-[130px] items-center justify-between gap-6 text-sm"
                key={status.key}
              >
                <span className="flex items-center gap-2 text-muted-strong">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                </span>
                <span className="font-semibold text-admin-text">{formatNumber(status.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardChartCard>
  )
}
