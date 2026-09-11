const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const blockSize = digits.length > 10 ? 5 : 4
  const firstBlock = rest.slice(0, blockSize)
  const secondBlock = rest.slice(blockSize)

  return secondBlock ? `(${ddd}) ${firstBlock}-${secondBlock}` : `(${ddd}) ${firstBlock}`
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}
