export type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO'

export type AdministratorAccountProps = {
  id: string
  name: string
  login: string
  email: string
  status: UserStatus
}

export class AdministratorAccount {
  constructor(private readonly props: AdministratorAccountProps) {}

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get login(): string {
    return this.props.login
  }

  get email(): string {
    return this.props.email
  }

  get status(): UserStatus {
    return this.props.status
  }

  canAuthenticate(): boolean {
    return this.props.status === 'ATIVO'
  }
}
