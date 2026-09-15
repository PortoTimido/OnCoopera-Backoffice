import { expect, test } from '@playwright/test'

const contentManager = {
  id: 'content-1', nome: 'Conteúdo', email: 'conteudo@oncoopera.com', login: 'conteudo', telefone: '11999998888', dataNascimento: '1990-01-01', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['GESTAO_CONTEUDOS'], permissoesAdministrativas: ['GESTAO_CONTEUDOS'], trocaSenhaObrigatoria: false, ultimoAcesso: null,
}

async function authenticateContentManager(page: import('@playwright/test').Page) {
  await page.addInitScript((user) => {
    window.localStorage.setItem('oncoopera.accessToken', 'token-content')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(user))
  }, contentManager)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: contentManager }))
  await page.route(/\/api\/backoffice\/(artigos|apoios|usuarios)(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 0, totalPages: 1 } }))
}

test('exibe apenas as telas permitidas na sidebar', async ({ page }) => {
  await authenticateContentManager(page)
  await page.goto('/artigos')

  await expect(page.getByRole('link', { name: 'Início', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Artigos' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Radar de Apoio' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Usuários' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Configurações' })).toBeVisible()
})

test('bloqueia URL direta de tela sem a permissão necessária', async ({ page }) => {
  await authenticateContentManager(page)
  await page.goto('/usuarios')

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible()
})
