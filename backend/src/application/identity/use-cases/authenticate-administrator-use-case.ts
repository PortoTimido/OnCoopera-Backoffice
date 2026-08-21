import { AdministratorAccount } from '../../../domain/identity/entities/administrator-account.js'
import { AccountNotActiveError } from '../errors/account-not-active-error.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.js'
import { AdministratorAuthRepository } from '../ports/administrator-auth-repository.js'
import { PasswordHasher } from '../ports/password-hasher.js'
import { IssuedSession, SessionIssuer } from '../ports/session-issuer.js'

export type AuthenticateAdministratorInput = {
  identifier: string
  password: string
}

export type AuthenticateAdministratorOutput = {
  administrator: {
    id: string
    name: string
    login: string
    email: string
  }
  session: IssuedSession
}

type AuthenticateAdministratorDependencies = {
  administrators: AdministratorAuthRepository
  passwordHasher: PasswordHasher
  sessionIssuer: SessionIssuer
}

export class AuthenticateAdministratorUseCase {
  constructor(private readonly dependencies: AuthenticateAdministratorDependencies) {}

  async execute(input: AuthenticateAdministratorInput): Promise<AuthenticateAdministratorOutput> {
    const identifier = input.identifier.trim().toLowerCase()
    const administratorRecord = await this.dependencies.administrators.findByLoginOrEmail(identifier)

    if (!administratorRecord) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await this.dependencies.passwordHasher.verify({
      password: input.password,
      passwordHash: administratorRecord.passwordHash,
    })

    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const administrator = new AdministratorAccount(administratorRecord)

    if (!administrator.canAuthenticate()) {
      throw new AccountNotActiveError()
    }

    const session = await this.dependencies.sessionIssuer.issueForAdministrator(administrator.id)

    return {
      administrator: {
        id: administrator.id,
        name: administrator.name,
        login: administrator.login,
        email: administrator.email,
      },
      session,
    }
  }
}
