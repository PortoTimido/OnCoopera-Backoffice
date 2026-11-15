import { expect, test } from '@playwright/test'

const user = {
  dataNascimento: '1990-01-01',
  email: 'content@example.com',
  id: 'content-1',
  login: 'content',
  nome: 'Dra. Maria da Silva',
  permissoesAdministrativas: ['GESTAO_CONTEUDOS'],
  perfisAdministrativos: ['GESTAO_CONTEUDOS'],
  status: 'ATIVO',
  telefone: '11999998888',
  tipo: 'ADMINISTRADOR',
  trocaSenhaObrigatoria: false,
  ultimoAcesso: null,
}

const preview = {
  authorName: 'Dra. Maria da Silva',
  categories: ['Saúde'],
  contentHtml: [
    '<h2>Cuidados importantes</h2>',
    '<p>Texto <strong>importante</strong>, <em>em destaque</em> e <u>sublinhado</u>.</p>',
    '<ol><li>Primeiro item</li><li>Segundo item</li></ol>',
    '<img alt="Ilustração do tratamento" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" />',
    '<p>## Dica ##</p>',
    '<p><strong>Prefira alimentos leves.</strong></p>',
    '<p>##</p>',
    '<p>## Pergunta ##</p>',
    '<p>Esta opção é segura?</p>',
    '<p>##</p>',
    '<p><a href="javascript:alert(1)" onclick="window.previewXss = true">Link inseguro</a><script>window.previewXss = true</script></p>',
  ].join(''),
  imageUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  publishedAt: '2026-10-10T12:00:00.000Z',
  readingTimeMinutes: 4,
  status: 'PUBLICADO',
  summary: 'Resumo retornado pela API.',
  tags: [],
  title: 'Título do artigo',
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ authenticatedUser, articlePreview }) => {
      window.localStorage.setItem('oncoopera.accessToken', 'content-token')
      window.localStorage.setItem('oncoopera.user', JSON.stringify(authenticatedUser))
      window.sessionStorage.setItem('oncoopera.articlePreview', JSON.stringify(articlePreview))
    },
    { articlePreview: preview, authenticatedUser: user },
  )
})

test('renders the mobile article experience as sanitized HTML', async ({ page }) => {
  await page.goto('/artigos/preview')

  await expect(page.getByRole('heading', { name: 'Título do artigo' })).toBeVisible()
  await expect(page.getByText('Resumo retornado pela API.')).toBeVisible()
  await expect(page.getByAltText('Capa do artigo Título do artigo')).toBeVisible()
  await expect(page.getByAltText('Ilustração do tratamento')).toBeVisible()
  await expect(page.getByText('Primeiro item')).toBeVisible()
  await expect(page.getByLabel('Dica')).toContainText('Prefira alimentos leves.')
  await expect(page.getByLabel('Pergunte ao seu médico')).toContainText('Esta opção é segura?')
  await expect(page.getByText('Por Dra. Maria da Silva')).toBeVisible()
  await expect(page.getByText('Publicado em 10 de outubro de 2026')).toBeVisible()
  await expect(page.getByText('## Dica ##')).toHaveCount(0)
  await expect(page.getByText('## Pergunta ##')).toHaveCount(0)
  const previewArticle = page.getByLabel('Pré-visualização: Título do artigo')
  await expect(previewArticle.locator('script')).toHaveCount(0)
  await expect(previewArticle.locator('[onclick]')).toHaveCount(0)
  await expect(previewArticle.locator('a[href^="javascript:"]')).toHaveCount(0)
  await expect(previewArticle.locator('[style]')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('window.previewXss')
})

test('keeps the article preview within the mobile reading width', async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto('/artigos/preview')

  const previewArticle = page.getByLabel('Pré-visualização: Título do artigo')
  await expect(previewArticle).toBeVisible()
  expect(
    await previewArticle.evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
})
