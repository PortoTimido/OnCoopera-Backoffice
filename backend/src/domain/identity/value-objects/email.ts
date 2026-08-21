import { InvalidEmailError } from '../errors/invalid-email-error.js'

export class Email {
  private constructor(private readonly normalizedValue: string) {}

  static create(value: string): Email {
    const normalizedValue = value.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
      throw new InvalidEmailError()
    }

    return new Email(normalizedValue)
  }

  toString(): string {
    return this.normalizedValue
  }

  equals(other: Email): boolean {
    return this.normalizedValue === other.normalizedValue
  }
}
