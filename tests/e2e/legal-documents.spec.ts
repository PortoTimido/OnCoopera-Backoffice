import { expect, test, type Page } from '@playwright/test'

const totalAdministrator = {
  id: 'admin-total-1',
  nome: 'Administrador total',
  email: 'total@oncoopera.com',
  login: 'total',
  telefone: '11999998888',
  dataNascimento: '1990-01-01',
  status: 'ATIVO',
  tipo: 'ADMINISTRADOR',
  perfisAdministrativos: ['TOTAL'],
  permissoesAdministrativas: ['TOTAL'],
  trocaSenhaObrigatoria: false,
  ultimoAcesso: null,
}

const contentAdministrator = {
  ...totalAdministrator,
  id: 'admin-content-1',
  email: 'content@oncoopera.com',
  login: 'content',
  perfisAdministrativos: ['GESTAO_CONTEUDOS'],
  permissoesAdministrativas: ['GESTAO_CONTEUDOS'],
}

const termsDocument = {
  id: 'legal-terms-1',
  tipo: 'TERMOS_USO',
  versao: '1.0',
  conteudo: '<p>Termos existentes</p>',
  atualizadoEm: '2026-01-01T00:00:00.000Z',
}

async function authenticate(page: Page, user = totalAdministrator) {
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem('oncoopera.accessToken', 'legal-documents-token')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(storedUser))
  }, user)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: user }))
  await page.route(/\/api\/backoffice\/(artigos|apoios|usuarios)(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { data: [], page: 1, pageSize: 1, total: 0, totalPages: 1 } }),
  )
  await page.route(/\/api\/v1\/backoffice\/dashboard\/crescimento-mensal(?:\?.*)?$/, (route) =>
    route.fulfill({ json: { points: [] } }),
  )
}

test('restringe documentos legais a administradores TOTAL', async ({ page }) => {
  await authenticate(page, contentAdministrator)
  await page.goto('/dashboard')

  await expect(page.getByRole('link', { name: 'Documentos legais' })).toHaveCount(0)

  await page.goto('/documentos-legais')
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('carrega documentos por aba sob demanda', async ({ page }) => {
  await authenticate(page)
  const requests: string[] = []

  await page.route(/\/api\/backoffice\/documentos-legais\/(TERMOS_USO|POLITICA_PRIVACIDADE)$/, (route) => {
    const type = route.request().url().endsWith('TERMOS_USO') ? 'TERMOS_USO' : 'POLITICA_PRIVACIDADE'
    requests.push(type)
    return route.fulfill({
      json: {
        ...termsDocument,
        id: `legal-${type}`,
        tipo: type,
        conteudo: `<p>${type}</p>`,
      },
    })
  })

  await page.goto('/documentos-legais')
  await expect(page.locator('.article-rich-text-editor')).toBeVisible()
  expect(requests).toContain('TERMOS_USO')
  expect(requests).not.toContain('POLITICA_PRIVACIDADE')

  await page.getByRole('tab', { name: 'Política de privacidade' }).click()
  await expect(page.locator('.article-rich-text-editor')).toContainText('POLITICA_PRIVACIDADE')
  expect(requests).toContain('POLITICA_PRIVACIDADE')
})

test('cria documento inexistente e atualiza-o nos salvamentos seguintes', async ({ page }) => {
  await authenticate(page)
  let created = false

  await page.route(/\/api\/backoffice\/documentos-legais\/TERMOS_USO$/, (route) =>
    route.fulfill(created ? { json: termsDocument } : { status: 404, json: { message: 'Não encontrado' } }),
  )
  await page.route(/\/api\/backoffice\/documentos-legais$/, (route) =>
    route.fulfill({ status: 201, json: termsDocument }),
  )

  await page.goto('/documentos-legais')
  const editor = page.locator('.article-rich-text-editor')
  await expect(editor).toBeVisible()
  await editor.fill('Conteúdo inicial dos termos')

  const createRequest = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().endsWith('/api/backoffice/documentos-legais'),
  )
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  const createdRequest = await createRequest
  expect(createdRequest.postDataJSON()).toEqual({
    tipo: 'TERMOS_USO',
    conteudo: '<p>Conteúdo inicial dos termos</p>',
  })
  created = true

  await editor.fill('Conteúdo atualizado dos termos')
  const updateRequest = page.waitForRequest(
    (request) =>
      request.method() === 'PUT' &&
      request.url().endsWith('/api/backoffice/documentos-legais/TERMOS_USO'),
  )
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  expect((await updateRequest).postDataJSON()).toEqual({
    conteudo: '<p>Conteúdo atualizado dos termos</p>',
  })
})

test('não salva um documento sem conteúdo textual', async ({ page }) => {
  await authenticate(page)
  let saveRequests = 0

  await page.route(/\/api\/backoffice\/documentos-legais\/TERMOS_USO$/, (route) =>
    route.fulfill({ status: 404, json: { message: 'Não encontrado' } }),
  )
  await page.route(/\/api\/backoffice\/documentos-legais$/, (route) => {
    saveRequests += 1
    return route.fulfill({ status: 201, json: termsDocument })
  })

  await page.goto('/documentos-legais')
  await expect(page.locator('.article-rich-text-editor')).toBeVisible()
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(page.getByRole('status')).toContainText('Escreva o conteúdo')
  expect(saveRequests).toBe(0)
})
