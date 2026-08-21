# ADR-004 — Convenções do contrato REST

**Estado:** Aceito
**Data:** 2026-08-20

## Contexto

Sem convenções, cada feature poderia criar rotas, erros e paginação incompatíveis.

## Decisão

Versionar a API sob `/api/v1`, usar JSON em `camelCase`, recursos plurais em `kebab-case`, paginação por página e erros compatíveis com RFC 9457 (`application/problem+json`). Os formatos completos estão em `architecture/conventions.md`.

## Consequências

Toda feature documenta seu contrato dentro desse padrão. Mudanças incompatíveis exigem plano de transição ou nova versão da API.
