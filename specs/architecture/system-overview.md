# OnCoopera Backoffice — Visão geral do sistema

## 1. Objetivo e escopo

O OnCoopera Backoffice é a aplicação administrativa usada para manter os dados consumidos pelo ecossistema OnCoopera. Este repositório contém a aplicação web, a API e os artefatos de banco necessários ao backoffice.

O MVP administrativo cobre os seguintes contextos, identificados a partir do modelo de dados atual:

* acesso e administração de usuários;
* perfis e permissões administrativas;
* pacientes, consultas e registros diários;
* pontos de apoio, endereços, horários e imagens;
* artigos, categorias e tags.

Este documento não cria regras funcionais para esses contextos. Cada fluxo deve possuir uma specification própria antes da implementação.

## 2. Contexto

```text
Administrador
      │ HTTPS
      ▼
Backoffice React
      │ REST / JSON
      ▼
API Node.js
      │ Prisma
      ▼
PostgreSQL + PostGIS

API ──► armazenamento de arquivos/serviços externos (quando especificado)
```

O navegador nunca acessa o banco diretamente. Toda leitura ou alteração passa pela API, que aplica autenticação, autorização, validação e regras de negócio.

## 3. Unidades implantáveis

O sistema possui duas unidades implantáveis:

* `frontend`: aplicação React estática, configurada por ambiente com a URL pública da API;
* `backend`: processo Node.js stateless que expõe `/api/v1` e acessa PostgreSQL.

O PostgreSQL é um serviço gerenciado fora do processo da API. Uploads não devem ser persistidos no filesystem efêmero da aplicação; uma feature de upload deve definir um storage externo e guardar apenas sua referência no banco.

## 4. Decisões de fundação

As decisões aceitas estão registradas em `specs/adr/`:

| Decisão | Escolha |
|---|---|
| ADR-001 | Monorepo com aplicações separadas e contratos HTTP explícitos |
| ADR-002 | React, Vite e React Router no frontend |
| ADR-003 | Fastify, Zod e composição manual no backend |
| ADR-004 | REST versionada, JSON e formato Problem Details para erros |
| ADR-005 | JWT em cookies HttpOnly e autorização por permissões |
| ADR-006 | Organização modular dentro das camadas DDD |

Versões exatas devem ser fixadas pelos manifests e lockfiles no momento do scaffold. Não se deve documentar `latest` como requisito reproduzível.

## 5. Fluxo de uma requisição

```text
Route → schema de entrada → controller → use case → domínio
                                           │
                                           ▼
                                  contrato de repositório
                                           ▲
                                           │
                              implementação Prisma → PostgreSQL
```

Na resposta, o controller converte o resultado da aplicação para o contrato HTTP. Tipos gerados pelo Prisma não atravessam a fronteira da infraestrutura.

## 6. Ambientes

Devem existir, no mínimo, `development`, `test` e `production`, com bancos e segredos isolados. Configurações entram por variáveis de ambiente, são validadas no boot e nunca são commitadas.

O ambiente de teste pode usar PostgreSQL local/efêmero, mas deve executar as migrations oficiais. SQLite não é substituto válido porque o schema utiliza tipos e PostGIS específicos do PostgreSQL.

## 7. Requisitos operacionais mínimos

Antes do primeiro deploy, o projeto deve possuir:

* endpoint de liveness e readiness;
* logs estruturados com identificador de requisição, sem dados sensíveis;
* encerramento gracioso e limite de tempo por requisição;
* migrations executadas como etapa controlada de release;
* backup e restauração testados para o banco de produção;
* HTTPS obrigatório fora do ambiente local;
* CI com lint, verificação de tipos, testes e validação do Prisma Schema.

Métricas, tracing, provedor de hospedagem, storage e política final de backup devem ser definidos antes da entrada em produção, mas não bloqueiam o início do desenvolvimento local.

## 8. Fontes de verdade

Em caso de divergência, aplica-se a hierarquia definida na Constitution. Para o banco, o Prisma Schema e as migrations versionadas devem permanecer coerentes; migrations registram o histórico e o schema representa o estado desejado atual.

## 9. Critério de prontidão para desenvolver uma feature

Uma feature pode entrar em implementação quando possuir:

1. requirements com atores, regras e critérios de aceite identificados;
2. design com impactos em UI, API, domínio, banco e segurança;
3. contratos HTTP e permissões definidos quando aplicáveis;
4. review concluído sem pendências bloqueantes;
5. tasks rastreáveis aos requisitos;
6. estratégia de validação e testes.

As definições arquiteturais deste conjunto de documentos tornam possível iniciar o scaffold e a primeira specification. Elas não substituem a definição funcional de cada módulo.
