import { expect, test, type Page } from '@playwright/test'

const user = {
  id: 'radar-1', nome: 'Radar manager', email: 'radar@example.com', login: 'radar', telefone: '11999998888', dataNascimento: '1990-01-01', status: 'ATIVO', tipo: 'ADMINISTRADOR', perfisAdministrativos: ['GESTAO_RADAR_APOIO'], permissoesAdministrativas: ['GESTAO_RADAR_APOIO'], trocaSenhaObrigatoria: false, ultimoAcesso: null,
}

const support = {
  id: 'support-1', nome: 'Support place', tipoApoio: 'CLINICA', telefone: '(11) 3333-4444', descricao: null, status: 'ATIVO', endereco: { cep: '01001-000', logradouro: 'Main street', numero: '1', complemento: null, bairro: 'Center', cidade: 'Sao Paulo', estado: 'SP', latitude: -23.5, longitude: -46.6 }, horarios: [], imagensUrl: ['https://cdn.example.com/support.png'], imagens: [{ id: 'support-image-1', url: 'https://cdn.example.com/support.png', ordem: 0 }], estaAbertoAgora: true, dataCriacao: '2026-01-01T00:00:00.000Z', dataAtualizacao: '2026-01-01T00:00:00.000Z',
}

async function mockSupportApi(page: Page) {
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem('oncoopera.accessToken', 'radar-token')
    window.localStorage.setItem('oncoopera.user', JSON.stringify(storedUser))
  }, user)
  await page.route(/\/api\/auth\/me$/, (route) => route.fulfill({ json: user }))
  await page.route(/\/api\/backoffice\/apoios\/support-1\/imagens\/support-image-1$/, async (route) => {
    if (route.request().method() === 'DELETE') { await route.fulfill({ status: 204 }); return }
    await route.fulfill({ json: support })
  })
  await page.route(/\/api\/backoffice\/apoios\/support-1(?:\?.*)?$/, async (route) => {
    if (route.request().method() === 'PATCH') { await route.fulfill({ json: support }); return }
    await route.fulfill({ json: support })
  })
  await page.route(/\/api\/backoffice\/apoios(?:\?.*)?$/, (route) => route.fulfill({ json: { data: [support], page: 1, pageSize: 20, total: 1, totalPages: 1 } }))
}

test('replaces and removes the primary support photo', async ({ page }) => {
  await mockSupportApi(page)
  await page.goto('/radar-de-apoio/support-1/editar')
  await expect(page.getByAltText('Foto do local')).toHaveAttribute('src', 'https://cdn.example.com/support.png')

  const replaceRequest = page.waitForRequest((request) => request.method() === 'PATCH' && request.url().endsWith('/api/backoffice/apoios/support-1/imagens/support-image-1'))
  await page.locator('input[type="file"]').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: Buffer.from('replacement') })
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  expect((await replaceRequest).postData()).toContain('name="imagem"')

  await page.goto('/radar-de-apoio/support-1/editar')
  const deleteRequest = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().endsWith('/api/backoffice/apoios/support-1/imagens/support-image-1'))
  await page.getByRole('button', { name: 'Remover foto' }).click()
  await page.getByRole('button', { name: 'Salvar cadastro' }).click()
  await deleteRequest
})
