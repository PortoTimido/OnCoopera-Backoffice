# ADR-002 — Stack e arquitetura do frontend

**Estado:** Aceito
**Data:** 2026-08-20

## Contexto

React e TypeScript já são requisitos, mas faltavam ferramenta de build, roteamento e organização.

## Decisão

Usar Vite e React Router. Organizar por features, com `app` para composição global e `components` somente para elementos compartilhados. Não adotar store global nem biblioteca visual antes de necessidade e avaliação específicas.

## Consequências

O scaffold é simples e a divisão acompanha o produto. A biblioteca visual, ferramenta de server state e testes de componente continuam decisões incrementais, sem bloquear o início.
