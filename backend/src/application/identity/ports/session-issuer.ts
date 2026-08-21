export type IssuedSession = {
  accessToken: string
  refreshToken: string
}

export interface SessionIssuer {
  issueForAdministrator(administratorId: string): Promise<IssuedSession>
}
