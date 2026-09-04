import { expect, test } from '@playwright/test'

test('lista apoios e reflete busca e filtro na URL', async ({ page }) => {
  await page.goto('/radar-de-apoio')
  await expect(page.getByRole('heading', { name: 'Radar de Apoio' })).toBeVisible()
  await expect(page.getByText('INCA')).toBeVisible()
  await page.getByRole('tab', { name: 'Clínicas' }).click()
  await expect(page).toHaveURL(/categoria=CLINICA/)
  await page.getByLabel('Pesquisar apoios').fill('INCA')
  await expect(page).toHaveURL(/search=INCA/)
})

test('abre cadastro, valida campos e permite selecionar imagem', async ({ page }) => {
  await page.goto('/radar-de-apoio')
  await page.getByRole('link', { name: 'Novo apoio' }).click()
  await expect(page).toHaveURL(/\/radar-de-apoio\/novo$/)
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await expect(page.getByText('Informe o nome do local.')).toBeVisible()
  await page.getByLabel('Nome do Local *').fill('Casa de apoio')
  await page.getByLabel('Endereço Completo *').fill('Rua da Saúde, 1')
  await page.getByLabel('Cidade *').fill('São Paulo')
  await page.getByLabel('Estado *').fill('SP')
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await expect(page.getByText('Cadastro preparado com sucesso.')).toBeVisible()
})

test('abre a edição de um apoio de demonstração', async ({ page }) => {
  await page.goto('/radar-de-apoio')
  await page.getByRole('link', { name: 'Editar INCA' }).click()
  await expect(page).toHaveURL(/\/radar-de-apoio\/inca\/editar$/)
  await expect(page.getByLabel('Nome do Local *')).toHaveValue('INCA')
})

test('rejeita imagem em formato inválido ou acima de 5 MB', async ({ page }) => {
  await page.goto('/radar-de-apoio/novo')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'foto.gif',
    mimeType: 'image/gif',
    buffer: Buffer.from('imagem inválida'),
  })
  await expect(page.getByText('Envie uma imagem JPG ou PNG.')).toBeVisible()

  await fileInput.setInputFiles({
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  })
  await expect(page.getByText('A imagem deve ter no máximo 5 MB.')).toBeVisible()
})
