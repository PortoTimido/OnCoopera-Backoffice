import { httpClient } from '../../../shared/api/httpClient'
import type { AuthResponse, ChangePasswordPayload, LoginPayload } from '../model/authTypes'

export async function login(payload: LoginPayload) {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', payload)

  return data
}

export async function getCurrentUser() {
  const { data } = await httpClient.get<AuthResponse['usuario']>('/auth/me')

  return data
}

export async function changePassword(payload: ChangePasswordPayload) {
  await httpClient.post('/auth/change-password', payload)
}

export async function logout() {
  await httpClient.post('/auth/logout')
}
