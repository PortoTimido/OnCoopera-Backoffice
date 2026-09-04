import { expect, test, type Page } from '@playwright/test'

const support = {
  id: 'inca', nome: 'INCA', tipoApoio: 'CLINICA', telefone: '(21) 3207-1000', descricao: 'Instituto Nacional de Câncer.', status: 'ATIVO', endereco: { cep: '20230-130', logradouro: 'Praça da Cruz Vermelha', numero: '23', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ', latitude: -22.909, longitude: -43.179 }, horarios: [{ diaSemana: 1, horarioInicio: '08:00', horarioFim: '18:00' }], imagensUrl: [], estaAbertoAgora: true, dataCriacao: '2026-01-01T00:00:00.000Z', dataAtualizacao: '2026-01-01T00:00:00.000Z',
}

async function mockSupportApi(page: Page) {
  await page.route(/\/api\/backoffice\/apoios(?:\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') { await route.fulfill({ json: { data: [support], page: 1, pageSize: 10, total: 1, totalPages: 1 } }); return }
    if (route.request().method() === 'POST') { await route.fulfill({ status: 201, json: { ...support, ...route.request().postDataJSON(), id: 'novo-apoio' } }); return }
    await route.fallback()
  })
  await page.route(/\/api\/backoffice\/apoios\/[^/?]+(?:\?.*)?$/, async (route) => {
    if (route.request().method() === 'DELETE') { await route.fulfill({ status: 204 }); return }
    if (route.request().method() === 'PATCH') { await route.fulfill({ json: { ...support, ...route.request().postDataJSON() } }); return }
    await route.fulfill({ json: support })
  })
}

test('lista apoios e envia busca e filtro para a API', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio')
  await expect(page.getByRole('heading', { name: 'Radar de Apoio' })).toBeVisible()
  await expect(page.getByText('INCA')).toBeVisible()
  await page.getByRole('tab', { name: 'Clínicas' }).click()
  await expect(page).toHaveURL(/categoria=CLINICA/)
  await page.getByLabel('Pesquisar apoios').fill('INCA')
  await expect(page).toHaveURL(/search=INCA/)
})

test('cria apoio usando o payload estruturado do backend', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio/novo')
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await expect(page.getByText('Informe o nome do local.')).toBeVisible()
  await page.getByLabel('Nome do Local *').fill('Casa de apoio')
  await page.getByLabel('Telefone *').fill('(11) 3333-4444')
  await page.getByLabel('CEP *').fill('01001-000')
  await page.getByLabel('Logradouro *').fill('Rua da Saúde')
  await page.getByLabel('Número *').fill('1')
  await page.getByLabel('Bairro *').fill('Centro')
  await page.getByLabel('Cidade *').fill('São Paulo')
  await page.getByLabel('Estado *').fill('SP')
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await expect(page).toHaveURL(/\/radar-de-apoio$/)
})

test('carrega e atualiza um apoio existente', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio/inca/editar')
  await expect(page.getByLabel('Nome do Local *')).toHaveValue('INCA')
  await page.getByLabel('Nome do Local *').fill('INCA atualizado')
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await expect(page).toHaveURL(/\/radar-de-apoio$/)
})

test('rejeita imagem em formato inválido ou acima de 5 MB', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio/novo')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({ name: 'foto.gif', mimeType: 'image/gif', buffer: Buffer.from('imagem inválida') })
  await expect(page.getByText('Envie uma imagem JPG ou PNG.')).toBeVisible()
  await fileInput.setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) })
  await expect(page.getByText('A imagem deve ter no máximo 5 MB.')).toBeVisible()
})
