# Requirements — Radar de Apoio

## Objetivo

Permitir que administradores consultem e preparem o cadastro de locais e serviços de apoio oncológico no backoffice.

## Referências visuais

- Lista: Figma `327:306`.
- Cadastro/edição: Figma `327:503`.

## Requisitos funcionais

- Exibir uma lista local demonstrativa de apoios, com pesquisa, filtro por categoria e paginação visual.
- Permitir abrir o cadastro de um novo apoio e a edição de um apoio de demonstração.
- Coletar nome, categoria, descrição, endereço, cidade, estado, imagem e localização geográfica.
- Validar os campos obrigatórios e arquivos JPG/PNG de até 5 MB antes do salvamento.
- Exibir o componente de mapa como placeholder até a integração com Google Maps ser aprovada e configurada.

## Fora do escopo

- Persistência, autenticação/autorização específica e consumo de API.
- Carregamento do SDK do Google Maps e geocodificação.
