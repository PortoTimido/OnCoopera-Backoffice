import { expect, test, type Page } from '@playwright/test'

const support = {
  imagens: [{ id: 'foto-inca', url: 'https://cdn.example.com/inca.png', ordem: 0 }],
  id: 'inca', nome: 'INCA', tipoApoio: 'CLINICA', telefone: '(21) 93207-1000', descricao: 'Instituto Nacional de Câncer.', status: 'ATIVO', endereco: { cep: '20230-130', logradouro: 'Praça da Cruz Vermelha', numero: '23', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ', latitude: -22.909, longitude: -43.179 }, horarios: [{ diaSemana: 1, horarioInicio: '08:00', horarioFim: '18:00' }], imagensUrl: [], estaAbertoAgora: true, dataCriacao: '2026-01-01T00:00:00.000Z', dataAtualizacao: '2026-01-01T00:00:00.000Z',
}

const radarManager = {
  id: 'radar-1', nome: 'Radar manager', email: 'radar@example.com', login: 'radar', telefone: '11999998888', dataNascimento: '1990-01-01', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['GESTAO_RADAR_APOIO'], permissoesAdministrativas: ['GESTAO_RADAR_APOIO'], trocaSenhaObrigatoria: false, ultimoAcesso: null,
}

async function mockSupportApi(page: Page) {
  await page.addInitScript((user) => {
    window.localStorage.setItem('oncoopera.accessToken', 'radar-token')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(user))
  }, radarManager)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: radarManager }))
  await page.route(/\/api\/backoffice\/apoios\/[^/?]+\/imagens(?:\/[^/?]+)?(?:\?.*)?$/, async (route) => {
    if (route.request().method() === 'DELETE') { await route.fulfill({ status: 204 }); return }
    await route.fulfill({ json: support })
  })
  await page.route(/https:\/\/viacep\.com\.br\/ws\/01001000\/json\/$/, (route) => route.fulfill({ json: { cep: '01001-000', logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'São Paulo', uf: 'SP' } }))
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
  await page.getByLabel('Telefone *').fill('11999998888')
  await expect(page.getByLabel('Telefone *')).toHaveValue('(11) 99999-8888')
  await page.getByLabel('Telefone *').fill('1133334444')
  await expect(page.getByLabel('Telefone *')).toHaveValue('(11) 3333-4444')
  await page.getByLabel('CEP *').fill('01001000')
  await expect(page.getByLabel('CEP *')).toHaveValue('01001-000')
  await expect(page.getByLabel('Logradouro *')).toHaveValue('Praça da Sé')
  await expect(page.getByLabel('Logradouro *')).toHaveAttribute('readonly', '')
  await expect(page.getByLabel('Bairro *')).toHaveAttribute('readonly', '')
  await expect(page.getByLabel('Cidade *')).toHaveAttribute('readonly', '')
  await expect(page.getByLabel('Estado *')).toHaveAttribute('readonly', '')
  await page.getByLabel('Número *').fill('1')
  await page.getByRole('combobox', { name: 'Dia da semana' }).click()
  await page.getByRole('option', { name: 'Segunda-feira' }).click()
  await page.getByRole('combobox', { name: 'Início' }).click()
  await page.getByRole('option', { name: '08:00' }).click()
  await page.getByRole('combobox', { name: 'Fim' }).click()
  await page.getByRole('option', { name: '12:00' }).click()
  await page.getByRole('button', { name: 'Adicionar horário' }).click()
  await page.getByRole('combobox', { name: 'Início' }).click()
  await page.getByRole('option', { name: '13:00' }).click()
  await page.getByRole('combobox', { name: 'Fim' }).click()
  await page.getByRole('option', { name: '18:00' }).click()
  await page.getByRole('button', { name: 'Adicionar horário' }).click()
  const saveRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/backoffice/apoios'))
  const imageRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().includes('/api/backoffice/apoios/novo-apoio/imagens'))
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('imagem valida') })
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  const payload = (await saveRequest).postDataJSON()
  expect(payload).toMatchObject({ telefone: '(11) 3333-4444', horarios: [{ diaSemana: 1, horarioInicio: '08:00', horarioFim: '12:00' }, { diaSemana: 1, horarioInicio: '13:00', horarioFim: '18:00' }] })
  expect((await imageRequest).postData()).toContain('name="imagem"')
  await expect(page).toHaveURL(/\/radar-de-apoio$/)
})

test('valida intervalo de horário e permite removê-lo', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio/novo')
  await page.getByRole('combobox', { name: 'Início' }).click()
  await page.getByRole('option', { name: '18:00' }).click()
  await page.getByRole('combobox', { name: 'Fim' }).click()
  await page.getByRole('option', { name: '08:00' }).click()
  await page.getByRole('button', { name: 'Adicionar horário' }).click()
  await expect(page.getByText('O horário de início deve ser anterior ao fim.')).toBeVisible()
  await page.getByRole('combobox', { name: 'Início' }).click()
  await page.getByRole('option', { name: '08:00' }).click()
  await page.getByRole('combobox', { name: 'Fim' }).click()
  await page.getByRole('option', { name: '12:00' }).click()
  await page.getByRole('button', { name: 'Adicionar horário' }).click()
  await expect(page.getByText('08:00 – 12:00')).toBeVisible()
  await page.getByRole('button', { name: /Remover horário de Segunda-feira/ }).click()
  await expect(page.getByText('08:00 – 12:00')).not.toBeVisible()
})

test('duplica um horário para outros dias da semana', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio/novo')
  await page.getByRole('combobox', { name: 'Início' }).click()
  await page.getByRole('option', { name: '08:00' }).click()
  await page.getByRole('combobox', { name: 'Fim' }).click()
  await page.getByRole('option', { name: '18:00' }).click()
  await page.getByRole('button', { name: 'Adicionar horário' }).click()
  await page.getByRole('button', { name: /Duplicar horário de Segunda-feira/ }).click()
  await page.getByRole('button', { name: 'Ter', exact: true }).click()
  await page.getByRole('button', { name: 'Qua', exact: true }).click()
  await page.getByRole('button', { name: 'Qui', exact: true }).click()
  await page.getByRole('button', { name: 'Sex', exact: true }).click()
  await page.getByRole('button', { name: 'Duplicar para 4 dias' }).click()
  await expect(page.getByText('08:00 – 18:00')).toHaveCount(5)
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
