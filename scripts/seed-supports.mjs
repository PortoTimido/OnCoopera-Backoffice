import { api, listAll, logCreated } from './seed-utils.mjs'

const supportNames = ['Casa Acolher', 'Clínica Vida Plena', 'Instituto Esperança', 'Transporte Solidário', 'Espaço Escuta', 'Casa Caminhos', 'Clínica Horizonte', 'ONG Mãos Unidas', 'Rota do Cuidado', 'Núcleo Equilíbrio', 'Casa Recomeço', 'Clínica Bem Viver', 'Instituto Abraço', 'Mobilidade Amiga', 'Psicologia em Rede', 'Casa Serena', 'Clínica Florescer', 'ONG Viver Melhor', 'Transporte Conecta', 'Espaço Acolhimento']
const categories = ['CASA_APOIO', 'CLINICA', 'ONG', 'TRANSPORTE', 'PSICOLOGO']
const existingNames = new Set((await listAll('/backoffice/apoios')).map((support) => support.nome))
let created = 0

for (let index = 0; index < supportNames.length; index += 1) {
  const nome = supportNames[index]
  if (existingNames.has(nome)) continue
  await api('/backoffice/apoios', {
    method: 'POST',
    body: JSON.stringify({
      nome,
      tipoApoio: categories[index % categories.length],
      telefone: `113000${String(index + 1).padStart(4, '0')}`,
      descricao: `Local fictício de apoio nº ${index + 1}, criado somente para desenvolvimento e demonstração.`,
      endereco: { cep: `0100${String(index).padStart(3, '0')}`, logradouro: `Rua do Apoio ${index + 1}`, numero: String(100 + index), complemento: null, bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', latitude: -23.55 - index * 0.001, longitude: -46.63 - index * 0.001 },
      horarios: [{ diaSemana: 1, horarioInicio: '08:00', horarioFim: '17:00' }, { diaSemana: 3, horarioInicio: '08:00', horarioFim: '17:00' }, { diaSemana: 5, horarioInicio: '08:00', horarioFim: '17:00' }],
      imagensUrl: [],
      status: index % 5 === 0 ? 'DESATIVADO' : index % 5 === 1 ? 'RASCUNHO' : 'ATIVO',
    }),
  })
  created += 1
}

logCreated('Radares de apoio', created, supportNames.length - created)
