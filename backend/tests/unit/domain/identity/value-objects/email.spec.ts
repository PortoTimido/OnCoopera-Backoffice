import { test } from '@japa/runner'

import { InvalidEmailError } from '../../../../../src/domain/identity/errors/invalid-email-error.js'
import { Email } from '../../../../../src/domain/identity/value-objects/email.js'

test.group('Email', () => {
  test('normaliza e-mails válidos', ({ assert }) => {
    const email = Email.create('  ADMIN@ONCOOPERA.COM.BR  ')

    assert.equal(email.toString(), 'admin@oncoopera.com.br')
  })

  test('rejeita e-mails sem formato válido', ({ assert }) => {
    assert.throws(() => Email.create('admin-oncoopera'), InvalidEmailError)
  })

  test('compara e-mails pelo valor normalizado', ({ assert }) => {
    const email = Email.create('admin@oncoopera.com.br')
    const sameEmail = Email.create(' ADMIN@ONCOOPERA.COM.BR ')

    assert.isTrue(email.equals(sameEmail))
  })
})
