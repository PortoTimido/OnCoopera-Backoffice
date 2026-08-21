export interface PasswordHasher {
  verify(params: { password: string; passwordHash: string }): Promise<boolean>
}
