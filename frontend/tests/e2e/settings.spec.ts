import { expect, test } from '@playwright/test'

test('renderiza configurações e navega para criação de administrador', async ({ page }) => {
  await page.goto('/configuracoes')

  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Minha conta' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Administradores' })).toBeVisible()

  await page.getByRole('link', { name: /add admin/i }).click()

  await expect(page).toHaveURL(/\/configuracoes\/administradores\/novo$/)
  await expect(page.getByRole('heading', { name: 'Criar conta administrativa' })).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toBeVisible()
  await expect(page.getByLabel('E-mail corporativo')).toBeVisible()
})
