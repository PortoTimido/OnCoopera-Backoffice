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

test('gera o usuário de login a partir do nome do administrador', async ({ page }) => {
  await page.goto('/configuracoes/administradores/novo')

  const permissionCombo = page.getByRole('combobox', { name: 'Nível de permissão' })

  await expect(permissionCombo).toBeVisible()
  await permissionCombo.click()
  await page.getByRole('option', { name: 'Gestão de apoios' }).click()
  await expect(permissionCombo).toContainText('Gestão de apoios')

  await page.getByLabel('Nome completo').fill('Helena Maria Vasconcelos')
  await expect(page.getByLabel('Usuário de login')).toHaveValue('helena.vasconcelos')

  await page.getByLabel('Nome completo').fill('João')
  await expect(page.getByLabel('Usuário de login')).toHaveValue('joao')
})
