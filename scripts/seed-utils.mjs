const apiBaseUrl = process.env.SEED_API_BASE_URL?.replace(/\/$/, '')
const accessToken = process.env.SEED_ACCESS_TOKEN

if (!apiBaseUrl || !accessToken) {
  throw new Error('Defina SEED_API_BASE_URL e SEED_ACCESS_TOKEN antes de executar um seeder.')
}

export async function api(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path}: ${response.status} ${await response.text()}`)
  }

  if (response.status === 204) return undefined
  return response.json()
}

export async function listAll(path) {
  const response = await api(`${path}${path.includes('?') ? '&' : '?'}page=1&pageSize=100`)
  return response.data ?? []
}

export function logCreated(kind, created, skipped) {
  console.log(`${kind}: ${created} criados, ${skipped} já existentes.`)
}
