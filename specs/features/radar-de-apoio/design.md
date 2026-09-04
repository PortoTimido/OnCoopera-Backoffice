# Design — Radar de Apoio

## Frontend

A feature será isolada em `src/features/radar-de-apoio`, com páginas, componentes e modelos locais. As páginas reutilizam `AppLayout`; a lista mantém `search`, `categoria` e `page` na URL. Dados demonstrativos vivem na feature e não usam `fetch`.

O formulário mantém seu estado local. O mapa recebe coordenadas locais e atualiza o marcador ao selecionar uma posição simulada. A variável `VITE_GOOGLE_MAPS_API_KEY` ficará documentada em `.env.example`, mas não será lida nem acionará uma integração nesta fase.

## Acessibilidade

Filtros serão botões com estado selecionado, campos terão `label` associado, a tabela terá cabeçalhos semânticos e os controles terão nomes acessíveis. Erros de validação serão exibidos junto aos respectivos campos e em um resumo de formulário.

## Integração futura

Um futuro adaptador de mapa substituirá apenas o placeholder, consumindo as coordenadas do formulário e a variável de ambiente. Um futuro módulo `api` adaptará os tipos locais ao contrato REST aprovado.
