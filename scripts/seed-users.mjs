import { api, listAll, logCreated } from './seed-utils.mjs'

const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karen', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Paulo', 'Queila', 'Rafael', 'Sofia', 'Thiago']
const profiles = ['TOTAL', 'MODERADOR_DE_CONTEUDO', 'GERENTE_DE_APOIOS', 'ANALISTA_DE_INTERACOES']
const existingEmails = new Set((await listAll('/backoffice/usuarios')).map((user) => user.email))
let created = 0

for (let index = 0; index < firstNames.length; index += 1) {
  const number = String(index + 1).padStart(2, '0')
  const email = `seed.admin.${number}@example.test`
  if (existingEmails.has(email)) continue
  await api('/backoffice/administradores', {
    method: 'POST',
    body: JSON.stringify({
      nome: `${firstNames[index]} Administrador(a)`,
      email,
      login: `seed.admin${number}`,
      telefone: `1199000${number.padStart(4, '0')}`,
      dataNascimento: `198${index % 10}-0${(index % 9) + 1}-15`,
      perfisAdministrativos: [profiles[index % profiles.length]],
      permissoesAdministrativas: ['GERENCIAR_USUARIOS', 'GESTAO_CONTEUDOS', 'GESTAO_RADAR_APOIO'],
    }),
  })
  created += 1
}

logCreated('Usuários administrativos', created, firstNames.length - created)
