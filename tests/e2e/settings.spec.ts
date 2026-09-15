import { expect, test } from '@playwright/test'

test('renderiza configurações da conta administrativa', async ({ page }) => {
  const administrator = { id: 'admin-1', nome: 'Admin', email: 'admin@oncoopera.com', login: 'admin', telefone: '11999998888', dataNascimento: '1990-01-01', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['GERENCIAR_USUARIOS'], permissoesAdministrativas: ['GERENCIAR_USUARIOS'], trocaSenhaObrigatoria: false, ultimoAcesso: null }
  await page.addInitScript((user) => {
    window.localStorage.setItem('oncoopera.accessToken', 'token-test')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(user))
  }, administrator)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: administrator }))
  await page.goto('/configuracoes')

  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Minha conta' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Administradores' })).not.toBeVisible()
})
