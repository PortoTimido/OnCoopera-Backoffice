# ADR-005 — Autenticação e autorização

**Estado:** Aceito
**Data:** 2026-08-20

## Contexto

O backoffice manipula dados pessoais e sensíveis. Sessão temporária e JWT final estavam descritos sem protocolo ou autorização concretos.

## Decisão

Usar access JWT curto e refresh token opaco/rotativo, ambos em cookies HttpOnly seguros. Manter sessões revogáveis no servidor. Aplicar proteção CSRF. Autorizar por permissões agrupadas em perfis (RBAC), com negação por padrão e checagem nos casos de uso.

## Consequências

O banco precisa representar sessões, refresh tokens e permissões antes da autenticação real. A matriz de permissões é requisito da feature de acesso. Tokens não ficam em armazenamento acessível a JavaScript.
