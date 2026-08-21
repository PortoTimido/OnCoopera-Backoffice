# Arquitetura de dados

## 1. Escopo e tecnologia

O banco oficial é PostgreSQL com PostGIS. Prisma ORM gerencia schema, client e migrations. O modelo atual está em `db/prisma/schema.prisma` e o histórico em `db/prisma/migrations/`.

## 2. Domínios persistidos

| Contexto | Tabelas principais |
|---|---|
| Identidade | `usuario`, `paciente`, `administrador` |
| Acesso administrativo | `perfil_administrativo`, `administrador_perfil` |
| Acompanhamento | `registro_diario`, `registro_sintoma`, `consulta` |
| Rede de apoio | `apoio`, `endereco`, `horario_funcionamento`, `apoio_imagem` |
| Conteúdo | `artigo`, `categoria`, `tag`, tabelas de associação |

O schema físico não define sozinho o domínio nem as permissões do produto.

## 3. Convenções

* tabelas e colunas usam `snake_case` em português;
* models e campos Prisma usam `PascalCase`/`camelCase` com `@@map`/`@map`;
* identificadores são UUID;
* instantes são persistidos em UTC e convertidos apenas nas bordas;
* datas civis usam `DATE` e horários locais sem data usam `TIME`;
* valores monetários futuros usam `Decimal`, nunca ponto flutuante;
* enums persistidos exigem análise de compatibilidade antes de alteração.

## 4. Integridade

Invariantes que o banco consegue garantir de forma inequívoca devem possuir `NOT NULL`, `UNIQUE`, foreign key ou `CHECK`. Regras contextuais permanecem no domínio, podendo ser reforçadas no banco.

Toda foreign key deve declarar conscientemente o comportamento de exclusão. `CASCADE` só é apropriado quando o registro filho não possui significado independente. O padrão seguro para relações não avaliadas é `RESTRICT`.

Campos usados em foreign keys, ordenações ou filtros frequentes devem ter índices orientados pelas queries reais. Índices novos precisam considerar custo de escrita e seletividade.

## 5. Pontos do schema que exigem specification antes de uso

O schema inicial contém campos livres cuja taxonomia ainda não está documentada: `humor`, `sintomaTipo`, `statusConsulta` e `statusAdministrativo`. A primeira feature que os manipular deve definir valores permitidos e decidir entre enum, tabela de domínio ou texto validado.

Também devem ser definidos pela respectiva feature:

* faixa válida de `intensidade`;
* faixa de `diaSemana` e regra para horários que cruzam meia-noite;
* normalização e unicidade de email, login, categoria e tag;
* obrigatoriedade e formato de telefone, CEP e UF;
* ciclo de publicação e coerência entre `status` e `dataPublicacao`;
* política de ciclo de vida de imagens e notas de voz.

Esses itens são bloqueantes para as features correspondentes, não para o scaffold do projeto.

## 6. Geolocalização

`endereco.localizacao_postgis` usa `geometry(Point, 4326)`. Longitude corresponde a X e latitude a Y. Operações de distância devem explicitar unidade e usar função/tipo adequado; uma feature de busca geográfica deve definir raio, precisão e índice espacial necessário.

Como o campo é `Unsupported` no Prisma, acesso geoespacial pode exigir SQL parametrizado isolado em um repositório de infraestrutura. Concatenação de SQL é proibida.

## 7. Migrations

1. alterar `schema.prisma`;
2. gerar migration com nome descritivo;
3. revisar o SQL, especialmente perda de dados, locks, defaults e extensões;
4. aplicar em banco limpo e em cópia representativa quando houver dados;
5. validar Prisma Client e testes de integração;
6. versionar schema e migration juntos.

Migrations aplicadas em ambiente compartilhado são imutáveis. Correções são feitas por nova migration. Em produção deve-se usar o comando de deploy de migrations, nunca comandos interativos de desenvolvimento.

Mudanças destrutivas devem usar estratégia expand/contract: adicionar estrutura compatível, migrar dados, trocar consumidores e só então remover o legado.

## 8. Transações e concorrência

O caso de uso define a necessidade de atomicidade; a infraestrutura controla a transação. Transações devem ser curtas e não envolver chamadas de rede externas.

Operações de escrita sujeitas a concorrência devem definir uma estratégia: constraint única, update condicional, nível de isolamento ou versionamento otimista. Ler e depois gravar sem proteção não garante unicidade.

## 9. Dados sensíveis

Senhas armazenam apenas hash produzido por algoritmo aprovado em `security.md`. Segredos e tokens não devem ser persistidos em texto puro. Queries e logs não devem registrar credenciais, conteúdo clínico ou dados pessoais completos.

Exclusão, anonimização e retenção precisam de política de produto/LGPD antes da produção. Até lá, não se implementa hard delete de paciente ou de registros clínicos sem specification e revisão de segurança.

## 10. Seed, testes e ambientes

Seed deve ser idempotente, conter somente dados fictícios e separar dados mínimos de desenvolvimento de fixtures de teste. Testes de integração utilizam banco isolado e migrations reais. Dados de produção não podem ser copiados para desenvolvimento sem anonimização aprovada.

## 11. Backup e recuperação

Antes da produção devem ser definidos RPO, RTO, retenção, criptografia e responsáveis. Restauração deve ser exercitada; a existência de backup sem teste de restore não atende ao requisito operacional.

## 12. Checklist de alteração

Toda alteração persistente deve avaliar migration, compatibilidade, backfill, índices, integridade, autorização, dados pessoais, rollback operacional e testes de integração.
