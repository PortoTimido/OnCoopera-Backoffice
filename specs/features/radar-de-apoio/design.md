# Design — Radar de Apoio

## Frontend

A feature é isolada em `src/features/radar-de-apoio`, com páginas, componentes, modelos e adaptador HTTP próprio. As páginas reutilizam `AppLayout`; a lista mantém `search`, `categoria` e `page` na URL e consome `GET /api/backoffice/apoios`.

O formulário mapeia os campos para `POST /api/backoffice/apoios` e `PATCH /api/backoffice/apoios/:id`; a edição carrega `GET /api/backoffice/apoios/:id` e a listagem desativa por `DELETE /api/backoffice/apoios/:id`. O endereço segue o contrato obrigatório da API: CEP, logradouro, número, bairro, cidade, estado e coordenadas. O mapa recebe coordenadas locais e atualiza o marcador ao selecionar uma posição simulada. A variável `VITE_GOOGLE_MAPS_API_KEY` ficará documentada em `.env.example`, mas não será lida nem acionará uma integração nesta fase.

## Acessibilidade

Filtros serão botões com estado selecionado, campos terão `label` associado, a tabela terá cabeçalhos semânticos e os controles terão nomes acessíveis. Erros de validação serão exibidos junto aos respectivos campos e em um resumo de formulário.

## Integração futura

Um futuro adaptador de mapa substituirá apenas o placeholder, consumindo as coordenadas do formulário e a variável de ambiente. O upload permanece local porque o Swagger não expõe endpoint para armazenar imagem ou gerar `imagensUrl`.
