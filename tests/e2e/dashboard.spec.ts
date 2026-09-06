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
  await page.route(/\/api\/backoffice\/artigos(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 12, totalPages: 12 } }))
  await page.route(/\/api\/backoffice\/apoios(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 34, totalPages: 34 } }))
  await page.route(/\/api\/backoffice\/usuarios(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 56, totalPages: 56 } }))
}

test('renderiza a tela inicial do backoffice', async ({ page }) => {
  await mockDashboardApi(page)
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible()
  await expect(page.getByText('Indicadores atualizados com dados das APIs.')).toBeVisible()
  await expect(page.getByText('Artigos publicados')).toBeVisible()
  await expect(page.getByText('12')).toBeVisible()
  await expect(page.getByText('Locais de suporte')).toBeVisible()
  await expect(page.getByText('34')).toBeVisible()
  await expect(page.getByText('Usuários ativos')).toBeVisible()
  await expect(page.getByText('56')).toBeVisible()
  await expect(page.getByText('Painel Administrativo')).toBeVisible()
})

test('abre menu do usuário na sidebar com opção de sair', async ({ page }) => {
  await mockDashboardApi(page)
  await page.goto('/dashboard')

  await page.getByRole('button', { name: /admin admin@oncoopera\.com/i }).click()

  await expect(page.getByRole('button', { name: 'Sair do sistema' })).toBeVisible()
})
