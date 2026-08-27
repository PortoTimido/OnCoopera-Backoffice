import { expect, test } from '@playwright/test'

test('renderiza a tela inicial do backoffice', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible()
  await expect(page.getByText('Última alteração: hoje as 14:32')).toBeVisible()
  await expect(page.getByText('Artigos publicados')).toBeVisible()
  await expect(page.getByText('Locais de suporte')).toBeVisible()
  await expect(page.getByText('Usuários ativos')).toBeVisible()
  await expect(page.getByText('Painel Administrativo')).toBeVisible()
})

test('abre menu do usuário na sidebar com opção de sair', async ({ page }) => {
  await page.goto('/dashboard')

  await page.getByRole('button', { name: /admin admin@oncoopera\.com/i }).click()

  await expect(page.getByRole('button', { name: 'Sair do sistema' })).toBeVisible()
})
