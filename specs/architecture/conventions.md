# Convenções de desenvolvimento

## 1. Abrangência

Estas convenções valem para código, testes e specifications. Ferramentas automáticas configuradas no repositório prevalecem em detalhes de formatação.

## 2. Idioma e nomes

* documentação e linguagem de negócio: português do Brasil;
* código técnico: inglês;
* termos de domínio podem permanecer em português quando uma tradução perder precisão, mas devem ser consistentes;
* arquivos e diretórios: `kebab-case`;
* componentes, classes e tipos: `PascalCase`;
* funções, variáveis e campos: `camelCase`;
* constantes globais: `UPPER_SNAKE_CASE`;
* booleanos começam, quando natural, com `is`, `has`, `can` ou `should`.

Não usar abreviações obscuras. Um mesmo conceito deve ter o mesmo nome na UI, specification, API e domínio.

## 3. TypeScript

O modo `strict` é obrigatório. Evitar `any`; entradas desconhecidas usam `unknown` e narrowing. Tipos derivados não devem ser duplicados manualmente sem necessidade.

Exports nomeados são o padrão. Side effects devem ficar no composition root. Funções devem ser pequenas o suficiente para expressar uma responsabilidade, sem limites artificiais de linhas.

Erros esperados são representados de forma explícita; exceções ficam para falhas inesperadas ou para o mecanismo padronizado da camada. Promises devem ser aguardadas ou deliberadamente tratadas.

## 4. Imports e fronteiras

Cada aplicação pode usar alias para sua raiz, mas imports dentro de uma feature devem preferir caminhos relativos curtos. Deep imports em internals de outro módulo são proibidos. Ciclos de dependência devem falhar no CI quando a ferramenta correspondente for configurada.

Frontend não importa código do backend. Contratos compartilhados, se introduzidos, ficam em pacote independente, sem Prisma, Fastify ou React, e não substituem validação em runtime.

## 5. API

* base path: `/api/v1`;
* recursos: substantivos plurais em `kebab-case`;
* path parameters: identificadores de recurso;
* ações que não se encaixam em CRUD podem usar sub-recurso verbal documentado;
* datas/instantes JSON: ISO 8601; instantes sempre com offset;
* propriedades JSON: `camelCase`;
* conteúdo: `application/json; charset=utf-8`;
* request ID deve ser propagado na resposta e nos logs.

Listagens usam `page` (iniciando em 1) e `pageSize` (padrão 20, máximo 100), salvo justificativa de cursor no design. Resposta:

```json
{
  "data": [],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 0, "totalPages": 0 }
}
```

Recursos individuais e mutações bem-sucedidas retornam o recurso diretamente, sem envelope obrigatório. `DELETE` sem corpo retorna `204`.

Erros seguem `application/problem+json`:

```json
{
  "type": "https://oncoopera.example/problems/validation-error",
  "title": "Dados inválidos",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "Revise os campos informados.",
  "instance": "/api/v1/artigos",
  "requestId": "...",
  "errors": [{ "field": "titulo", "code": "required", "message": "Informe o título." }]
}
```

`errors` aparece somente para erros de campo. Códigos são estáveis e próprios para automação; mensagens são voltadas a pessoas e podem mudar.

## 6. Status HTTP

Usar semanticamente: `200` leitura/alteração, `201` criação com `Location`, `204` sucesso sem corpo, `400` requisição malformada, `401` não autenticado, `403` não autorizado, `404` inexistente, `409` conflito de estado/unicidade, `422` campos semanticamente inválidos, `429` limite excedido e `500` falha inesperada.

## 7. Git e mudanças

Commits devem ser pequenos, coerentes e escritos no imperativo. Uma mudança de schema inclui sua migration. Código gerado não deve ser editado manualmente. Alterações de contrato quebradoras exigem novo versionamento ou plano de migração documentado.

## 8. Testes

Arquivos de teste usam `.spec.ts`; E2E pode usar `.e2e.spec.ts`. Testes descrevem comportamento observável, seguem Arrange/Act/Assert quando isso melhora leitura e não dependem de ordem ou relógio/rede reais sem controle.

Não testar detalhes internos quando uma interface pública oferece evidência suficiente. Mocks devem se limitar a fronteiras externas; repositórios fake são aceitáveis para casos de uso.

## 9. Documentação SDD

Features ficam em `specs/features/<feature>/` com:

```text
requirements.md
design.md
review.md
tasks.md
validation.md
```

Requisitos usam `REQ-###`, critérios `AC-###`, decisões `DEC-###` e tasks `T###`. Cada task referencia os requisitos/critérios atendidos. Pendências usam `OPEN-###`, responsável e condição de resolução; não ficam escondidas em texto corrido.

## 10. Definition of Done

Uma task só é concluída quando código, migrations e documentação estão coerentes; lint, tipos e testes relevantes passam; critérios de aceite foram validados; segurança, privacidade e acessibilidade aplicáveis foram verificadas; e não há segredo, log sensível ou alteração gerada manualmente.
