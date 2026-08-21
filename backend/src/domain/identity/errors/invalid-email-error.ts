export class InvalidEmailError extends Error {
  constructor() {
    super('E-mail inválido')
    this.name = 'InvalidEmailError'
  }
}
