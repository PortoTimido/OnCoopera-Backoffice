import { expect, test, type Page } from '@playwright/test'

const user = {
  id: 'content-1', nome: 'Content manager', email: 'content@example.com', login: 'content', telefone: '11999998888', dataNascimento: '1990-01-01', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['GESTAO_CONTEUDOS'], permissoesAdministrativas: ['GESTAO_CONTEUDOS'], trocaSenhaObrigatoria: false, ultimoAcesso: null,
}

const article = {
  id: 'article-1', autorId: 'content-1', titulo: 'Article title', conteudo: '<p>Article content</p>', tempoLeituraMinutos: 1, imagemUrl: 'https://cdn.example.com/article.png', status: 'RASCUNHO', categorias: [{ id: 'category-1', nome: 'Category' }], tags: [], dataCriacao: '2026-01-01T00:00:00.000Z', dataAtualizacao: '2026-01-01T00:00:00.000Z', dataPublicacao: null,
}

async function mockArticleApi(page: Page, shouldFailImageUpload = false) {
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem('oncoopera.accessToken', 'content-token')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(storedUser))
  }, user)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: user }))
  await page.route(/\/api\/backoffice\/artigo-categorias(?:\?.*)?$/, (route) => route.fulfill(route.request().method() === 'POST' ? { status: 201, json: { id: 'category-health', nome: 'Saude' } } : { json: { data: article.categorias } }))
  await page.route(/\/api\/backoffice\/artigo-tags(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [] } }))
  await page.route(/\/api\/backoffice\/artigos\/article-1\/imagem$/, async (route) => {
    if (route.request().method() === 'DELETE') { await route.fulfill({ status: 204 }); return }
    await route.fulfill(shouldFailImageUpload ? { status: 500, json: { message: 'Upload failed' } } : { json: article })
  })
  await page.route(/\/api\/backoffice\/artigos\/article-1(?:\?.*)?$/, async (route) => {
    if (route.request().method() === 'PATCH') { await route.fulfill({ json: article }); return }
    await route.fulfill({ json: article })
  })
  await page.route(/\/api\/backoffice\/artigos(?:\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') { await route.fulfill({ status: 201, json: article }); return }
    await route.fulfill({ json: { data: [article], page: 1, pageSize: 20, total: 1, totalPages: 1 } })
  })
}

async function fillArticle(page: Page) {
  await page.locator('input').first().fill('Article title')
  await page.locator('.article-rich-text-editor').fill('Article content')
}

test('uploads an article cover in multipart after creating the article', async ({ page }) => {
  await mockArticleApi(page)
  await page.goto('/artigos/novo')
  await fillArticle(page)
  await page.locator('input[type="file"]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from('cover') })

  const createRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/backoffice/artigos'))
  const imageRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/backoffice/artigos/article-1/imagem'))
  await page.getByRole('button', { name: 'Salve o rascunho' }).click()

  expect((await createRequest).postDataJSON()).not.toHaveProperty('imagemUrl')
  expect((await imageRequest).postData()).toContain('name="imagem"')
  await expect(page).toHaveURL(/\/artigos\/article-1\/editar$/)
})

test('deletes a persisted article cover when it is removed', async ({ page }) => {
  await mockArticleApi(page)
  await page.goto('/artigos/article-1/editar')
  await expect(page.locator('img[src="https://cdn.example.com/article.png"]')).toHaveAttribute('src', 'https://cdn.example.com/article.png')

  const deleteRequest = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().endsWith('/api/backoffice/artigos/article-1/imagem'))
  await page.getByRole('button', { name: 'Remover imagem' }).click()
  await page.getByRole('button', { name: 'Salve o rascunho' }).click()
  await deleteRequest
})

test('keeps a newly created article editable when its cover upload fails', async ({ page }) => {
  await mockArticleApi(page, true)
  await page.goto('/artigos/novo')
  await fillArticle(page)
  await page.locator('input[type="file"]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from('cover') })
  await page.getByRole('button', { name: 'Salve o rascunho' }).click()

  await expect(page).toHaveURL(/\/artigos\/article-1\/editar\?imageUploadFailed=1$/)
  await expect(page.locator('p.bg-red-50')).toBeVisible()
})
