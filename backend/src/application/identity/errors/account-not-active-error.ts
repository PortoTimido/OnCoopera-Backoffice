export class AccountNotActiveError extends Error {
  constructor() {
    super('Conta não está ativa')
    this.name = 'AccountNotActiveError'
  }
}
