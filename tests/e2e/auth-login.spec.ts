import { expect, test } from '@playwright/test'

const newAdministrator = {
  id: 'admin-new', nome: 'Novo Admin', email: 'novo@oncoopera.com', login: 'novo.admin', telefone: '11999999999', dataNascimento: '1990-01-01', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['TOTAL'], permissoesAdministrativas: ['GERENCIAR_USUARIOS'], trocaSenhaObrigatoria: true, ultimoAcesso: null,
}

test('exibe erro real da API ao tentar login com credenciais inválidas', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('E-mail corporativo').fill('usuario.invalido@oncoopera.com')
  const passwordInput = page.locator('input[name="senha"]')

  await expect(passwordInput).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Mostrar senha' }).click()
  await expect(passwordInput).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Ocultar senha' }).click()
  await expect(passwordInput).toHaveAttribute('type', 'password')
  await passwordInput.fill('senha-invalida')

  const loginResponse = page.waitForResponse(
    (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST',
  )

  await page.getByRole('button', { name: /acessar painel/i }).click()

  const response = await loginResponse

  expect(response.status()).toBe(401)
  await expect(page.getByRole('alert')).toContainText('Credenciais inválidas.')
})

test('redireciona para login quando a sessão expira', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('oncoopera.accessToken', 'token-expirado')
  })

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 401,
      body: JSON.stringify({ message: 'Access token inválido.', statusCode: 401 }),
    })
  })

  await page.goto('/dashboard')

  await expect(page).toHaveURL(/\/login\?sessionExpired=1$/)
  await expect(page.getByRole('alert')).toContainText('Sua sessão expirou. Entre novamente para continuar.')
})

test('fecha a troca obrigatória e permanece no login ao clicar em fechar', async ({ page }) => {
  await page.route(/\/api\/auth\/login$/, (route) => route.fulfill({ status: 409, json: { code: 'TROCA_SENHA_OBRIGATORIA', message: 'Troca de senha obrigatória.' } }))
  await page.goto('/login')

  await page.getByLabel('E-mail corporativo').fill(newAdministrator.email)
  await page.locator('input[name="senha"]').fill('SenhaTemp!123')
  await page.getByRole('button', { name: /acessar painel/i }).click()
  await page.getByRole('button', { name: 'Fechar e voltar ao login' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('dialog', { name: 'Atualize sua senha' })).toHaveCount(0)
})

test('contorna a exceção de troca obrigatória e autentica após trocar a senha temporária', async ({ page }) => {
  const authenticatedAdministrator = { ...newAdministrator, trocaSenhaObrigatoria: false }
  let loginAttempts = 0
  await page.route(/\/api\/auth\/login$/, (route) => {
    loginAttempts += 1
    if (loginAttempts === 1) {
      return route.fulfill({ status: 409, json: { code: 'TROCA_SENHA_OBRIGATORIA', message: 'Troca de senha obrigatória.' } })
    }
    return route.fulfill({ json: { accessToken: 'token-novo', usuario: authenticatedAdministrator } })
  })
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: authenticatedAdministrator }))
  await page.route(/\/api\/backoffice\/(artigos|apoios|usuarios)(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 0, totalPages: 0 } }))
  await page.route(/\/api\/auth\/change-temporary-password$/, (route) => route.fulfill({ status: 204 }))
  await page.goto('/login')

  await page.getByLabel('E-mail corporativo').fill(newAdministrator.email)
  await page.locator('input[name="senha"]').fill('SenhaTemp!123')
  await page.getByRole('button', { name: /acessar painel/i }).click()

  await expect(page.getByRole('dialog', { name: 'Atualize sua senha' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fechar modal' })).toHaveCount(0)

  await page.getByLabel('Senha temporária', { exact: true }).fill('SenhaTemp!123')
  await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha!123')
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha!123')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('dialog', { name: 'Atualize sua senha' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('oncoopera.user') ?? '{}').trocaSenhaObrigatoria)).toBe(false)
})
