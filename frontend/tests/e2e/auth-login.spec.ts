import { expect, test } from '@playwright/test'

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
