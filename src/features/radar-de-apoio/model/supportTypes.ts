export const supportCategories = ['ONG', 'CLINICA', 'TRANSPORTE', 'CASA_APOIO', 'PSICOLOGO'] as const

export type SupportCategory = (typeof supportCategories)[number]
export type SupportStatus = 'RASCUNHO' | 'ATIVO' | 'DESATIVADO'
export type Coordinates = { latitude: number; longitude: number }
export type SupportAddress = Coordinates & { cep: string; logradouro: string; numero: string; complemento?: string | null; bairro: string; cidade: string; estado: string }
export type SupportSchedule = { diaSemana: number; horarioInicio: string; horarioFim: string }
export type SupportResource = { id: string; nome: string; tipoApoio: SupportCategory; telefone: string; descricao: string | null; status: SupportStatus; endereco: SupportAddress; horarios: SupportSchedule[]; imagensUrl: string[]; estaAbertoAgora: boolean; distanciaKm?: number; dataCriacao: string; dataAtualizacao: string }
export type SupportFormValues = { name: string; category: SupportCategory; phone: string; description: string; cep: string; street: string; number: string; neighborhood: string; city: string; state: string; coordinates: Coordinates }
export type PaginatedSupports = { data: SupportResource[]; page: number; pageSize: number; total: number; totalPages: number }
export type SaveSupportPayload = Pick<SupportResource, 'nome' | 'tipoApoio' | 'telefone' | 'descricao' | 'endereco' | 'horarios' | 'imagensUrl'> & { status?: SupportStatus }
export const supportCategoryLabels: Record<SupportCategory, string> = { CLINICA: 'Clínica', ONG: 'ONG', TRANSPORTE: 'Transporte', PSICOLOGO: 'Psicólogo', CASA_APOIO: 'Casa de suporte' }
export const supportStatusLabels: Record<SupportStatus, string> = { ATIVO: 'Ativo', RASCUNHO: 'Rascunho', DESATIVADO: 'Desativado' }
