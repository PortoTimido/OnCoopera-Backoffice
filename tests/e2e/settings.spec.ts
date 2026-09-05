import { expect, test } from '@playwright/test'

test('renderiza configurações da conta administrativa', async ({ page }) => {
  await page.goto('/configuracoes')

  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Minha conta' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Administradores' })).not.toBeVisible()
})
