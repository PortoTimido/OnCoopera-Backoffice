# Requirements — Radar de Apoio

## Objetivo

Permitir que administradores consultem e preparem o cadastro de locais e serviços de apoio oncológico no backoffice.

## Referências visuais

- Lista: Figma `327:306`.
- Cadastro/edição: Figma `327:503`.

## Requisitos funcionais

- Consultar, criar, editar e desativar apoios pela API do backoffice, com pesquisa, filtro por categoria e paginação.
- Permitir abrir o cadastro de um novo apoio e a edição de um apoio existente.
- Coletar nome, categoria, descrição, endereço, cidade, estado, imagem e localização geográfica.
- Validar os campos obrigatórios e arquivos JPG/PNG de até 5 MB antes do salvamento.
- Exibir o componente de mapa como placeholder até a integração com Google Maps ser aprovada e configurada.

## Fora do escopo

- Carregamento do SDK do Google Maps, geocodificação e upload de imagem; o Swagger atual não expõe endpoint para imagens.
