import { expect, test, type Page } from '@playwright/test'

const administrator = { id: 'admin-1', nome: 'Ana Silva', email: 'ana@oncoopera.com', login: 'ana.silva', telefone: '11999998888', dataNascimento: '1990-05-20', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['TOTAL'], permissoesAdministrativas: ['GERENCIAR_USUARIOS'], ultimoAcesso: '2026-09-01T12:00:00.000Z' }

async function mockUsersApi(page: Page) {
  await page.route(/\/api\/backoffice\/usuarios(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [administrator], page: 1, pageSize: 10, total: 1, totalPages: 1 } }))
  await page.route(/\/api\/backoffice\/usuarios\/[^/?]+(?:\?.*)?$/, (route) => route.fulfill({ json: { usuario: administrator, endereco: null } }))
  await page.route(/\/api\/backoffice\/administradores$/, (route) => route.request().method() === 'POST' ? route.fulfill({ status: 201, json: { usuario: administrator, endereco: null, senhaTemporaria: 'SenhaTemp!123' } }) : route.fallback())
  await page.route(/\/api\/backoffice\/administradores\/[^/?]+$/, (route) => route.request().method() === 'DELETE' ? route.fulfill({ status: 204 }) : route.fulfill({ json: { usuario: administrator, endereco: null } }))
}

test('lista administradores e aplica busca e filtro', async ({ page }) => {
  await mockUsersApi(page)
  await page.goto('/usuarios')
  await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible()
  await expect(page.getByText('Ana Silva')).toBeVisible()
  await page.getByLabel('Pesquisar administradores').fill('Ana')
  await expect(page).toHaveURL(/search=Ana/)
  await page.getByLabel('Filtrar por status').selectOption('ATIVO')
  await expect(page).toHaveURL(/status=ATIVO/)
})

test('cria administrador e exibe a senha temporária uma única vez', async ({ page }) => {
  await mockUsersApi(page)
  await page.goto('/usuarios/novo')
  await page.getByLabel('Nome completo').fill('Helena Maria Vasconcelos')
  await expect(page.getByText('helena.vasconcelos')).toBeVisible()
  await page.getByLabel('E-mail profissional').fill('helena@oncoopera.com')
  await page.getByLabel('Telefone').fill('(11) 99999-8888')
  await page.getByLabel('Data de nascimento').fill('1990-05-20')
  await page.getByLabel('Gestão de conteúdos').check()
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await expect(page.getByText('SenhaTemp!123')).toBeVisible()
  await expect(page.getByText('Ela não será exibida novamente.')).toBeVisible()
})

test('carrega e atualiza administrador existente', async ({ page }) => {
  await mockUsersApi(page)
  await page.goto('/usuarios/admin-1/editar')
  await expect(page.getByLabel('Nome completo')).toHaveValue('Ana Silva')
  await page.getByLabel('Nome completo').fill('Ana Atualizada')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page).toHaveURL(/\/usuarios$/)
})
