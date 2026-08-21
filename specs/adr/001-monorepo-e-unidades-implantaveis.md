# ADR-001 — Monorepo e unidades implantáveis

**Estado:** Aceito
**Data:** 2026-08-20

## Contexto

Frontend, backend, schema e SDD evoluem juntos, mas web e API possuem ciclos e ambientes de execução diferentes.

## Decisão

Manter um monorepo com `frontend/`, `backend/`, `db/` e `specs/`. Frontend e backend são unidades implantáveis independentes e se comunicam somente pelo contrato REST. Código compartilhado futuro deve viver em pacote neutro e justificado.

## Consequências

Mudanças full-stack são atômicas no repositório e o CI pode validar o conjunto. Deploys permanecem independentes. Não é permitido importar módulos internos entre frontend e backend.
