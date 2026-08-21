import { test } from '@japa/runner'

import { AdministratorAccount } from '../../../../../src/domain/identity/entities/administrator-account.js'

test.group('AdministratorAccount', () => {
  test('permite autenticação quando o usuário está ativo', ({ assert }) => {
    const administrator = new AdministratorAccount({
      id: 'admin-1',
      name: 'Administrador',
      login: 'admin',
      email: 'admin@oncoopera.com.br',
      status: 'ATIVO',
    })

    assert.isTrue(administrator.canAuthenticate())
  })

  test('bloqueia autenticação de usuários inativos ou bloqueados', ({ assert }) => {
    const inactiveAdministrator = new AdministratorAccount({
      id: 'admin-1',
      name: 'Administrador',
      login: 'admin',
      email: 'admin@oncoopera.com.br',
      status: 'INATIVO',
    })

    const blockedAdministrator = new AdministratorAccount({
      id: 'admin-2',
      name: 'Administrador bloqueado',
      login: 'blocked-admin',
      email: 'blocked@oncoopera.com.br',
      status: 'BLOQUEADO',
    })

    assert.isFalse(inactiveAdministrator.canAuthenticate())
    assert.isFalse(blockedAdministrator.canAuthenticate())
  })
})
