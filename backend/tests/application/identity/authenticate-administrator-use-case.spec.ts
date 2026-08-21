import { test } from '@japa/runner'

import { AccountNotActiveError } from '../../../src/application/identity/errors/account-not-active-error.js'
import { InvalidCredentialsError } from '../../../src/application/identity/errors/invalid-credentials-error.js'
import {
  AdministratorAuthRecord,
  AdministratorAuthRepository,
} from '../../../src/application/identity/ports/administrator-auth-repository.js'
import { PasswordHasher } from '../../../src/application/identity/ports/password-hasher.js'
import { SessionIssuer } from '../../../src/application/identity/ports/session-issuer.js'
import { AuthenticateAdministratorUseCase } from '../../../src/application/identity/use-cases/authenticate-administrator-use-case.js'

class InMemoryAdministratorAuthRepository implements AdministratorAuthRepository {
  constructor(private readonly administrators: AdministratorAuthRecord[]) {}

  async findByLoginOrEmail(identifier: string): Promise<AdministratorAuthRecord | null> {
    return (
      this.administrators.find((administrator) => {
        return administrator.login === identifier || administrator.email === identifier
      }) ?? null
    )
  }
}

class FakePasswordHasher implements PasswordHasher {
  public calls: Array<{ password: string; passwordHash: string }> = []

  async verify(params: { password: string; passwordHash: string }): Promise<boolean> {
    this.calls.push(params)

    return params.passwordHash === `hashed:${params.password}`
  }
}

class FakeSessionIssuer implements SessionIssuer {
  public issuedForAdministratorIds: string[] = []

  async issueForAdministrator(administratorId: string) {
    this.issuedForAdministratorIds.push(administratorId)

    return {
      accessToken: `access-token:${administratorId}`,
      refreshToken: `refresh-token:${administratorId}`,
    }
  }
}

const activeAdministrator: AdministratorAuthRecord = {
  id: 'admin-1',
  name: 'Administrador',
  login: 'admin',
  email: 'admin@oncoopera.com.br',
  status: 'ATIVO',
  passwordHash: 'hashed:senha-correta',
}

function makeUseCase(administrators: AdministratorAuthRecord[] = [activeAdministrator]) {
  const passwordHasher = new FakePasswordHasher()
  const sessionIssuer = new FakeSessionIssuer()

  const useCase = new AuthenticateAdministratorUseCase({
    administrators: new InMemoryAdministratorAuthRepository(administrators),
    passwordHasher,
    sessionIssuer,
  })

  return {
    useCase,
    passwordHasher,
    sessionIssuer,
  }
}

test.group('AuthenticateAdministratorUseCase', () => {
  test('autentica administrador ativo com senha válida', async ({ assert }) => {
    const { useCase, sessionIssuer } = makeUseCase()

    const output = await useCase.execute({
      identifier: ' ADMIN@ONCOOPERA.COM.BR ',
      password: 'senha-correta',
    })

    assert.deepEqual(output, {
      administrator: {
        id: 'admin-1',
        name: 'Administrador',
        login: 'admin',
        email: 'admin@oncoopera.com.br',
      },
      session: {
        accessToken: 'access-token:admin-1',
        refreshToken: 'refresh-token:admin-1',
      },
    })
    assert.deepEqual(sessionIssuer.issuedForAdministratorIds, ['admin-1'])
  })

  test('rejeita credenciais quando o identificador não existe', async ({ assert }) => {
    const { useCase, passwordHasher, sessionIssuer } = makeUseCase([])

    await assert.rejects(
      () =>
        useCase.execute({
          identifier: 'desconhecido@oncoopera.com.br',
          password: 'senha-correta',
        }),
      InvalidCredentialsError
    )

    assert.lengthOf(passwordHasher.calls, 0)
    assert.lengthOf(sessionIssuer.issuedForAdministratorIds, 0)
  })

  test('rejeita credenciais quando a senha é inválida', async ({ assert }) => {
    const { useCase, sessionIssuer } = makeUseCase()

    await assert.rejects(
      () =>
        useCase.execute({
          identifier: 'admin',
          password: 'senha-incorreta',
        }),
      InvalidCredentialsError
    )

    assert.lengthOf(sessionIssuer.issuedForAdministratorIds, 0)
  })

  test('não emite sessão para administrador inativo', async ({ assert }) => {
    const { useCase, sessionIssuer } = makeUseCase([
      {
        ...activeAdministrator,
        status: 'INATIVO',
      },
    ])

    await assert.rejects(
      () =>
        useCase.execute({
          identifier: 'admin',
          password: 'senha-correta',
        }),
      AccountNotActiveError
    )

    assert.lengthOf(sessionIssuer.issuedForAdministratorIds, 0)
  })
})
