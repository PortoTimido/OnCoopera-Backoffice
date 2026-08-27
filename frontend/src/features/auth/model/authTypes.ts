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
  ultimoAcesso: string | null
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
