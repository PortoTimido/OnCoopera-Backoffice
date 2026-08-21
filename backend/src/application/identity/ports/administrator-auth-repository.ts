import { UserStatus } from '../../../domain/identity/entities/administrator-account.js'

export type AdministratorAuthRecord = {
  id: string
  name: string
  login: string
  email: string
  status: UserStatus
  passwordHash: string
}

export interface AdministratorAuthRepository {
  findByLoginOrEmail(identifier: string): Promise<AdministratorAuthRecord | null>
}
