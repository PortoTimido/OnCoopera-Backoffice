# ADR-003 — Stack de entrega do backend

**Estado:** Aceito
**Data:** 2026-08-20

## Contexto

O domínio deve ser independente, mas a API precisa de framework, validação e composição definidos.

## Decisão

Usar Fastify como adaptador HTTP, Zod para configuração e schemas de entrada/saída nas bordas, Japa para testes e composição manual de dependências no boot da aplicação. Prisma permanece restrito à infraestrutura.

## Consequências

Plugins e tipos do Fastify não atravessam controllers/adaptadores. Schemas Zod não substituem regras do domínio. Um container de DI só será considerado se a composição manual se tornar objetivamente difícil.
