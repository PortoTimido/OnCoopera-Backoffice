import type { SupportResource, SupportSchedule } from './supportTypes'

export const defaultSupportSchedule: SupportSchedule[] = [
  { day: 'Segunda-feira', periods: ['08:00 – 12:00', '13:00 – 18:00'] },
  { day: 'Terça-feira', periods: ['08:00 – 12:00', '13:00 – 18:00'] },
  { day: 'Quarta-feira', periods: ['08:00 – 12:00', '13:00 – 18:00'] },
  { day: 'Quinta-feira', periods: ['08:00 – 12:00', '13:00 – 18:00'] },
  { day: 'Sexta-feira', periods: ['08:00 – 12:00', '13:00 – 17:00'] },
  { day: 'Sábado', periods: ['08:00 – 12:00'] },
  { day: 'Domingo', periods: [], closed: true },
]

export const demoSupportResources: SupportResource[] = [
  {
    id: 'inca', name: 'INCA', category: 'CLINICA', description: 'Instituto Nacional de Câncer.', address: 'Praça da Cruz Vermelha, 23 - Centro', city: 'Rio de Janeiro', state: 'RJ', phone: '(21) 3207-1000', status: 'ATIVO', coordinates: { latitude: -22.909, longitude: -43.179 }, schedule: defaultSupportSchedule,
  },
  {
    id: 'avon-support-house', name: 'AVON Support House', category: 'CASA_DE_SUPORTE', description: 'Apoio e acolhimento para pacientes.', address: 'Rua João Adolfo, 118 - Centro Histórico', city: 'São Paulo', state: 'SP', phone: '(11) 3113-1000', status: 'ATIVO', coordinates: { latitude: -23.548, longitude: -46.633 }, schedule: defaultSupportSchedule,
  },
  {
    id: 'instituto-oncoguia', name: 'Instituto Oncoguia', category: 'PSICOLOGO', description: 'Orientação, informação e apoio psicológico.', address: 'Av. Paulista, 2073 - Bela Vista', city: 'São Paulo', state: 'SP', phone: '0800 773 1666', status: 'RASCUNHO', coordinates: { latitude: -23.556, longitude: -46.662 }, schedule: defaultSupportSchedule,
  },
]
