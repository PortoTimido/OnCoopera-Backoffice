import { expect, test, type Page } from '@playwright/test'

const admin = {
  id: 'admin-1',
  nome: 'Admin',
  email: 'admin@oncoopera.com',
  login: 'admin',
  telefone: '11999998888',
  dataNascimento: '1990-01-01',
  status: 'ATIVO',
  tipo: 'ADMINISTRADOR',
  perfisAdministrativos: ['TOTAL'],
  permissoesAdministrativas: ['GERENCIAR_USUARIOS'],
  ultimoAcesso: '2026-09-01T12:00:00.000Z',
}

async function mockDashboardApi(page: Page) {
  await page.addInitScript((user) => {
    window.localStorage.setItem('oncoopera.accessToken', 'token-test')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(user))
  }, admin)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: admin }))
  await page.route(/\/api\/backoffice\/artigos(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 12, totalPages: 12 } }),
  )
  await page.route(/\/api\/backoffice\/apoios(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 34, totalPages: 34 } }),
  )
  await page.route(/\/api\/backoffice\/usuarios(?:\?.*)?$/, (route) => {
    const status = new URL(route.request().url()).searchParams.get('status')
    const totals = { ATIVO: 56, INATIVO: 8, BLOQUEADO: 3 }
    return route.fulfill({
      json: {
        data: [],
        page: 1,
        pageSize: 1,
        total: totals[status as keyof typeof totals] ?? 0,
        totalPages: 1,
      },
    })
  })
  await page.route(/\/api\/v1\/backoffice\/dashboard\/crescimento-mensal(?:\?.*)?$/, (route) => {
    const period = Number(new URL(route.request().url()).searchParams.get('periodMonths'))
    const points = [
      { month: '2026-04', articlesPublished: 5, supportLocations: 13, activeUsers: 38 },
      { month: '2026-05', articlesPublished: 7, supportLocations: 17, activeUsers: 42 },
      { month: '2026-06', articlesPublished: 8, supportLocations: 20, activeUsers: 47 },
      { month: '2026-07', articlesPublished: 10, supportLocations: 24, activeUsers: 50 },
      { month: '2026-08', articlesPublished: 11, supportLocations: 28, activeUsers: 53 },
      { month: '2026-09', articlesPublished: 12, supportLocations: 34, activeUsers: 56 },
    ]
    return route.fulfill({ json: { points: period === 12 ? [...points, ...points] : points } })
  })
}

test('renderiza a tela inicial do backoffice', async ({ page }) => {
  await mockDashboardApi(page)
  await page.goto('/dashboard')

  const metrics = page.getByLabel('Indicadores principais')
  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible()
  await expect(page.getByText('Acompanhe os principais indicadores da plataforma.')).toBeVisible()
  await expect(metrics.getByText('Artigos publicados')).toBeVisible()
  await expect(metrics.getByText('12', { exact: true })).toBeVisible()
  await expect(metrics.getByText('Locais de suporte')).toBeVisible()
  await expect(metrics.getByText('34', { exact: true })).toBeVisible()
  await expect(metrics.getByText('Usuários ativos')).toBeVisible()
  await expect(metrics.getByText('56', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Crescimento mensal' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Distribuição de usuários' })).toBeVisible()
  await expect(page.getByText('Ativos', { exact: true })).toBeVisible()
  await expect(page.getByText('Inativos', { exact: true })).toBeVisible()
  await expect(page.getByText('Bloqueados', { exact: true })).toBeVisible()
  await expect(page.getByText('67', { exact: true })).toBeVisible()
  await expect(page.getByText('Painel Administrativo')).toBeVisible()
})

test('altera o período do gráfico de crescimento', async ({ page }) => {
  const growthRequests: string[] = []
  await mockDashboardApi(page)
  await page.route(/\/api\/v1\/backoffice\/dashboard\/crescimento-mensal(?:\?.*)?$/, (route) => {
    growthRequests.push(route.request().url())
    return route.fulfill({ json: { points: [] } })
  })
  await page.goto('/dashboard')

  await expect.poll(() => growthRequests.some((url) => url.includes('periodMonths=6'))).toBe(true)
  await page.getByLabel('Período do crescimento mensal').selectOption('12')
  await expect.poll(() => growthRequests.some((url) => url.includes('periodMonths=12'))).toBe(true)
})

test('exibe erro e permite tentar novamente ao carregar o crescimento', async ({ page }) => {
  let attempts = 0
  await page.addInitScript((user) => {
    window.localStorage.setItem('oncoopera.accessToken', 'token-test')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(user))
  }, admin)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: admin }))
  await page.route(/\/api\/backoffice\/artigos(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 12, totalPages: 1 } }),
  )
  await page.route(/\/api\/backoffice\/apoios(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 34, totalPages: 1 } }),
  )
  await page.route(/\/api\/backoffice\/usuarios(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 0, totalPages: 1 } }),
  )
  await page.route(/\/api\/v1\/backoffice\/dashboard\/crescimento-mensal(?:\?.*)?$/, (route) => {
    attempts += 1
    return attempts <= 2
      ? route.fulfill({ status: 500, json: { message: 'Falha temporária' } })
      : route.fulfill({ json: { points: [] } })
  })
  await page.goto('/dashboard')

  await expect(page.getByText('Não foi possível carregar o crescimento mensal.')).toBeVisible()
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByText('Ainda não há dados suficientes para este período.')).toBeVisible()
})

test('abre menu do usuário na sidebar com opção de sair', async ({ page }) => {
  await mockDashboardApi(page)
  await page.goto('/dashboard')

  await page.getByRole('button', { name: /admin admin@oncoopera\.com/i }).click()

  await expect(page.getByRole('button', { name: 'Sair do sistema' })).toBeVisible()
})
