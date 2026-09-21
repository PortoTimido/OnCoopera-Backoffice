export type AuthenticatedUser = {
  id: string
  nome: string
  email: string
  login: string
  telefone: string
  dataNascimento: string
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO'
  tipo: 'USUARIO' | 'PACIENTE' | 'ADMINISTRADOR'
  perfisAdministrativos: string[]
  permissoesAdministrativas?: string[]
  trocaSenhaObrigatoria?: boolean
  ultimoAcesso: string | null
  imagemUrl?: string | null
}

export type AuthResponse = {
  accessToken: string
  usuario: AuthenticatedUser
}

export type LoginPayload = {
  identificador: string
  senha: string
}

export type ChangePasswordPayload = {
  senhaAtual: string
  novaSenha: string
}

export type ChangeTemporaryPasswordPayload = {
  identificador: string
  senhaTemporaria: string
  novaSenha: string
}

export type PasswordRecoveryRequestPayload = {
  email: string
}

export type PasswordRecoveryVerifyPayload = {
  email: string
  code: string
}

export type PasswordRecoveryVerifyResponse = {
  resetToken: string
}

export type PasswordRecoveryResetPayload = {
  resetToken: string
  newPassword: string
  passwordConfirmation: string
}
