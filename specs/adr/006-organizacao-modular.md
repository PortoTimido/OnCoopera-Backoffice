# ADR-006 — Organização modular do backend

**Estado:** Aceito
**Data:** 2026-08-20

## Contexto

Uma estrutura apenas por camada tende a espalhar contextos diferentes; uma estrutura apenas por feature pode enfraquecer as fronteiras DDD já definidas.

## Decisão

Usar organização híbrida: as camadas superiores permanecem explícitas e, dentro delas, os arquivos são agrupados por módulo de negócio quando houver volume. Contratos pertencem à camada consumidora; implementações ficam na infraestrutura.

## Consequências

O fluxo de dependência continua `api → application → domain`, com infraestrutura implementando portas internas. Diretórios vazios e abstrações antecipadas não devem ser criados.
