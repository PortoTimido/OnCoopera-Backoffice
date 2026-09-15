import axios from 'axios'
import { clearAuthSession, getStoredAccessToken } from '../../features/auth/model/authSession'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isUnauthenticatedRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/password-recovery')
      const isAlreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login'

      if (!isUnauthenticatedRequest) {
        clearAuthSession()
      }

      if (!isUnauthenticatedRequest && !isAlreadyOnLogin && typeof window !== 'undefined') {
        window.location.assign('/login?sessionExpired=1')
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message

    if (typeof message === 'string') {
      return message
    }

    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(' ')
    }

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique se a API está disponível.'
    }
  }

  return 'Não foi possível concluir a solicitação. Tente novamente.'
}
