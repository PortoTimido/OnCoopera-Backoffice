# Arquitetura do frontend

## 1. Objetivo

Este documento define a arquitetura da aplicação web administrativa. Ele complementa a Constitution e o ADR-002.

## 2. Stack

O frontend utiliza React, TypeScript, Vite e React Router. A escolha de biblioteca visual permanece separada e deve considerar o Figma e os requisitos de acessibilidade antes do primeiro conjunto de telas.

Dependências adicionais só devem ser introduzidas quando resolverem uma necessidade presente. Em especial, não se adota inicialmente uma store global: estado remoto e estado de interface são problemas distintos.

## 3. Organização

```text
frontend/src/
├── app/          # boot, providers, router e configuração
├── assets/
├── components/   # componentes realmente compartilhados
├── features/     # módulos funcionais
├── layouts/
├── lib/          # adaptadores técnicos sem regra de negócio
├── styles/
├── types/
└── test/
```

Cada feature pode conter `api`, `components`, `hooks`, `pages`, `schemas` e `types`, somente quando necessários. Arquivos privados de uma feature não devem ser importados por outra; contratos compartilhados sobem para uma fronteira pública explícita.

## 4. Responsabilidades

* páginas coordenam a composição da rota e estados de carregamento;
* componentes apresentam conteúdo e emitem eventos;
* hooks encapsulam comportamento reutilizável de UI;
* módulos `api` adaptam contratos HTTP para a feature;
* regras que protegem invariantes de negócio permanecem no backend;
* `app` concentra preocupações globais, não lógica funcional.

## 5. Estado e dados remotos

Dados da API devem ter uma única camada de acesso, responsável por URL base, credenciais, serialização, cancelamento e conversão de erros. Componentes não devem espalhar chamadas `fetch` diretamente.

Quando cache, revalidação e mutações assíncronas se tornarem necessários, a equipe deve escolher uma biblioteca de server state por ADR curto. Até lá, hooks da feature podem encapsular o acesso sem criar uma store global.

Estado local deve permanecer próximo ao componente. Context deve ser reservado a dados de amplo alcance e baixa frequência de mudança, como identidade autenticada e tema. Parâmetros compartilháveis de listagens devem ser refletidos na URL.

## 6. Rotas e acesso

Rotas públicas e autenticadas devem ser separadas no router. Guards no frontend melhoram a experiência, mas não concedem autorização; a API revalida toda operação.

Cada página deve tratar explicitamente:

* carregamento;
* ausência de dados;
* erro recuperável;
* acesso negado;
* conteúdo carregado.

## 7. Formulários

Formulários devem possuir labels associadas, indicação textual de obrigatoriedade, mensagens próximas ao campo e resumo de erro quando útil. Validação no cliente melhora feedback, mas não substitui validação na API.

O botão de submissão deve impedir duplicidade enquanto a operação estiver em andamento. Em falha, os dados preenchidos devem ser preservados sempre que seguro.

## 8. Componentes e estilos

Primitivos recorrentes — botão, campo, modal, tabela, feedback e paginação — devem ser centralizados apenas após a definição visual correspondente. Componentes de feature permanecem na feature.

Não se deve codificar cores, espaçamentos e z-index repetidos por toda a aplicação. Os primeiros padrões aprovados devem virar tokens CSS, documentados junto à escolha da biblioteca visual.

## 9. Acessibilidade

O alvo do MVP é WCAG 2.2 nível AA para os fluxos administrativos implementados. Como mínimo:

* navegação completa por teclado e foco visível;
* HTML semântico antes de ARIA;
* nome acessível para controles;
* contraste adequado e informação não dependente apenas de cor;
* foco gerenciado em modais, erros e mudanças de rota;
* tabelas com cabeçalhos e títulos apropriados;
* respeito a preferências de redução de movimento.

## 10. Desempenho e resiliência

Rotas podem ser carregadas sob demanda. Listagens potencialmente grandes devem usar paginação da API. Requisições obsoletas devem ser canceladas e ações destrutivas não devem usar atualização otimista sem estratégia de reversão.

## 11. Testes

* lógica pura: teste unitário;
* componentes com comportamento relevante: teste de componente após escolha da ferramenta;
* fluxos críticos: Playwright contra a aplicação integrada;
* bug reproduzível: teste de regressão no nível mais baixo capaz de detectá-lo.

O MVP deve cobrir por E2E, no mínimo, login, logout, bloqueio de rota, um fluxo principal de consulta e um fluxo principal de escrita.

## 12. Definition of Done do frontend

Uma alteração está pronta quando respeita o Figma/specification, cobre todos os estados da tela, funciona por teclado, não expõe dados sem permissão, possui testes proporcionais ao risco e passa por lint, tipos, testes e build.
