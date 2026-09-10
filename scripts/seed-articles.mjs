import { api, listAll, logCreated } from './seed-utils.mjs'

const titles = [
  'Como organizar a rotina de cuidados', 'Alimentação durante o tratamento', 'A importância da rede de apoio', 'Como preparar perguntas para a consulta', 'Movimento e bem-estar no dia a dia',
  'Entendendo os efeitos colaterais', 'Direitos da pessoa em tratamento', 'Sono: estratégias para noites melhores', 'Saúde emocional e autocuidado', 'Como conversar com familiares',
  'Planejamento financeiro do tratamento', 'Atividade física com orientação', 'O papel da enfermagem oncológica', 'Exames e acompanhamento: um guia', 'Como lidar com a ansiedade',
  'Nutrição prática para dias difíceis', 'Retomando atividades com segurança', 'Informação confiável sobre câncer', 'Apoio psicológico: quando procurar', 'Celebrando pequenas conquistas',
]

const categories = await listAll('/backoffice/artigo-categorias')
const category = categories[0] ?? await api('/backoffice/artigo-categorias', { method: 'POST', body: JSON.stringify({ nome: 'Bem-estar' }) })
const existingTitles = new Set((await listAll('/backoffice/artigos')).map((article) => article.titulo))
let created = 0

for (let index = 0; index < titles.length; index += 1) {
  const titulo = titles[index]
  if (existingTitles.has(titulo)) continue
  await api('/backoffice/artigos', {
    method: 'POST',
    body: JSON.stringify({
      titulo,
      conteudo: `<p>${titulo}. Este é um conteúdo fictício criado exclusivamente para demonstração do ambiente de desenvolvimento.</p><p>Converse sempre com a equipe de saúde para orientações personalizadas.</p>`,
      categoriaIds: [category.id],
      tagIds: [],
      tempoLeituraMinutos: (index % 5) + 2,
      status: index % 5 === 0 ? 'RASCUNHO' : index % 5 === 1 ? 'DESATIVADO' : 'PUBLICADO',
    }),
  })
  created += 1
}

logCreated('Artigos', created, titles.length - created)
