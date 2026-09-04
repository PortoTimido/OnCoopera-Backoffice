export const supportCategories = ['CLINICA', 'ONG', 'TRANSPORTE', 'PSICOLOGO', 'CASA_DE_SUPORTE'] as const

export type SupportCategory = (typeof supportCategories)[number]
export type SupportStatus = 'ATIVO' | 'RASCUNHO'

export type Coordinates = {
  latitude: number
  longitude: number
}

export type SupportSchedule = {
  day: string
  periods: string[]
  closed?: boolean
}

export type SupportResource = {
  id: string
  name: string
  category: SupportCategory
  description: string
  address: string
  city: string
  state: string
  phone: string
  status: SupportStatus
  coordinates: Coordinates
  schedule: SupportSchedule[]
}

export type SupportFormValues = Pick<SupportResource, 'name' | 'category' | 'description' | 'address' | 'city' | 'state' | 'coordinates'>

export const supportCategoryLabels: Record<SupportCategory, string> = {
  CLINICA: 'Clínica',
  ONG: 'ONG',
  TRANSPORTE: 'Transporte',
  PSICOLOGO: 'Psicólogo',
  CASA_DE_SUPORTE: 'Casa de suporte',
}

export const supportStatusLabels: Record<SupportStatus, string> = {
  ATIVO: 'Ação',
  RASCUNHO: 'Rascunho',
}
