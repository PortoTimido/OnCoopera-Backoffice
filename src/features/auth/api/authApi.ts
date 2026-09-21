import axios from 'axios'
import { httpClient } from '../../../shared/api/httpClient'
import type {
  AuthResponse,
  AuthenticatedUser,
  ChangePasswordPayload,
  ChangeTemporaryPasswordPayload,
  LoginPayload,
  PasswordRecoveryRequestPayload,
  PasswordRecoveryResetPayload,
  PasswordRecoveryVerifyPayload,
  PasswordRecoveryVerifyResponse,
} from '../model/authTypes'

export async function login(payload: LoginPayload) {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', payload)

  return data
}

export async function getCurrentUser() {
  const { data } = await httpClient.get<AuthResponse['usuario']>('/auth/me')

  return data
}

export async function updateOwnProfile(payload: Partial<Pick<AuthenticatedUser, 'nome' | 'email' | 'telefone' | 'dataNascimento'>>) {
  const { data } = await httpClient.patch<AuthenticatedUser>('/auth/me', payload)

  return data
}

export async function uploadOwnImage(file: File) {
  const formData = new FormData()
  formData.append('imagem', file)

  const { data } = await httpClient.post<AuthenticatedUser>('/auth/me/imagem', formData)

  return data
}

export async function deleteOwnImage() {
  await httpClient.delete('/auth/me/imagem')
}

export async function changePassword(payload: ChangePasswordPayload) {
  await httpClient.post('/auth/change-password', payload)
}

export async function changeTemporaryPassword(payload: ChangeTemporaryPasswordPayload) {
  await httpClient.post('/auth/change-temporary-password', payload)
}

export function isPasswordChangeRequiredError(error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return false
  }

  const data = error.response.data
  return typeof data === 'object' && data !== null && 'code' in data && data.code === 'TROCA_SENHA_OBRIGATORIA'
}

export async function logout() {
  await httpClient.post('/auth/logout')
}

export async function requestPasswordRecovery(payload: PasswordRecoveryRequestPayload) {
  await httpClient.post('/auth/password-recovery/request', payload)
}

export async function verifyPasswordRecoveryCode(payload: PasswordRecoveryVerifyPayload) {
  const { data } = await httpClient.post<PasswordRecoveryVerifyResponse>('/auth/password-recovery/verify', payload)

  return data
}

export async function resetPasswordWithRecoveryToken(payload: PasswordRecoveryResetPayload) {
  await httpClient.post('/auth/password-recovery/reset', payload)
}
