# OnCoopera — Backoffice Web

Este repositório contém a aplicação web administrativa do ecossistema OnCoopera. Sua responsabilidade é oferecer uma interface de backoffice para autenticação administrativa, visualização de indicadores, gerenciamento de artigos e configurações de administradores.

A aplicação é desenvolvida em React com TypeScript e consome uma REST API externa ao repositório. O frontend não acessa diretamente o banco de dados e concentra apenas responsabilidades de apresentação, navegação, interação com o usuário e adaptação de chamadas HTTP.

## Sobre o OnCoopera

O OnCoopera é uma solução desenvolvida como Trabalho de Conclusão de Curso voltada ao apoio de pacientes oncológicos.

No estado documentado neste repositório, o ecossistema contempla uma aplicação administrativa para operação de backoffice, consumo de API, gerenciamento de conteúdo informativo e administração de usuários administrativos.

## Responsabilidade deste repositório

Este repositório representa a aplicação web administrativa/backoffice do OnCoopera.

Ele se comunica com a API OnCoopera por meio de requisições HTTP, utilizando endpoints de autenticação, usuários administrativos e artigos. A API, o backend e o banco de dados não estão implementados neste repositório; eles são tratados como componentes externos do ecossistema.

## Tecnologias

| Tecnologia | Finalidade |
| ---------- | ---------- |
| TypeScript | Linguagem principal da aplicação |
| React | Construção da interface web |
| Vite | Servidor de desenvolvimento e build do frontend |
| React Router DOM | Roteamento das páginas da aplicação |
| Tailwind CSS | Estilização via CSS utilitário e integração com Vite |
| Axios | Cliente HTTP para consumo da API |
| TipTap | Editor rich text para criação e edição de artigos |
| React PDF / React PDF Renderer | Pré-visualização e geração de PDF de artigos |
| React Dropzone | Upload/seleção de imagem no editor de artigos |
| Lucide React | Ícones da interface |
| Playwright | Testes end-to-end |
| ESLint | Análise estática de código |
| Docker | Ambiente de desenvolvimento baseado em Node.js |

## Arquitetura

A aplicação segue uma organização frontend por áreas funcionais, com separação entre configuração global, componentes compartilhados, módulos de feature e camada compartilhada de acesso HTTP.

O diretório `src/features` concentra as funcionalidades da interface, como autenticação, dashboard, artigos, configurações e layout de backoffice. Cada feature pode possuir suas próprias páginas, componentes, modelos e adaptadores de API. A configuração de rotas fica em `src/app`, enquanto o cliente HTTP compartilhado fica em `src/shared/api`.

A arquitetura documentada em `specs/architecture/frontend.md` reforça que páginas coordenam composição e estados, componentes apresentam conteúdo, módulos `api` adaptam contratos HTTP e regras de negócio definitivas permanecem no backend.

## Estrutura do projeto

```text
.
├── public/
├── specs/
│   ├── architecture/
│   ├── design/
│   └── templates/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── features/
│   │   ├── articles/
│   │   ├── auth/
│   │   ├── backoffice/
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── system/
│   ├── lib/
│   ├── shared/
│   └── styles/
├── tests/
│   └── e2e/
├── Dockerfile.dev
├── eslint.config.js
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

Principais responsabilidades:

| Diretório | Responsabilidade |
| --------- | ---------------- |
| `public/` | Arquivos públicos servidos pela aplicação |
| `specs/` | Documentação de arquitetura, design e processo de especificação |
| `src/app/` | Composição global da aplicação e definição de rotas |
| `src/assets/` | Imagens e ícones utilizados pelas telas |
| `src/components/` | Componentes compartilhados de interface |
| `src/features/` | Módulos funcionais do backoffice |
| `src/lib/` | Utilitários técnicos compartilhados |
| `src/shared/api/` | Cliente HTTP e tratamento comum de erros de API |
| `src/styles/` | Estilos globais |
| `tests/e2e/` | Testes end-to-end com Playwright |

## Pré-requisitos

| Ferramenta | Observação |
| ---------- | ---------- |
| Node.js | O `Dockerfile.dev` utiliza `node:20-slim` |
| npm | Utilizado pelo `package-lock.json` e pelos scripts do projeto |
| Docker | Opcional, para ambiente de desenvolvimento em container |

Para executar fluxos integrados que consomem dados reais, a API OnCoopera deve estar disponível no endereço configurado para o frontend.

## Instalação

Instale as dependências com npm:

```bash
npm install
```

## Configuração do ambiente

Não há arquivo `.env.example` neste repositório.

O cliente HTTP utiliza a variável `VITE_API_BASE_URL` quando ela estiver definida. Caso contrário, utiliza `/api` como base padrão. Em desenvolvimento, o Vite também possui proxy configurado para encaminhar chamadas de `/api` para `http://localhost:3000`.

| Variável | Descrição |
| -------- | --------- |
| `VITE_API_BASE_URL` | URL base opcional da API consumida pelo backoffice |

Exemplo de arquivo `.env` local:

```bash
VITE_API_BASE_URL=/api
```

Não versionar credenciais, tokens ou secrets em arquivos de ambiente.

## Executando o projeto

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

O script executa o Vite com `--host`. A porta padrão do Vite será utilizada, salvo configuração adicional informada pela linha de comando.

Também existe o script de preview do build:

```bash
npm run preview
```

## Build

Gere a versão de produção com:

```bash
npm run build
```

Esse comando executa a validação TypeScript via `tsc -b` e, em seguida, gera o build com Vite.

## Testes

Os testes end-to-end existentes utilizam Playwright:

```bash
npm run test:e2e
```

A configuração em `playwright.config.ts` inicia o frontend em `http://localhost:5176` durante os testes. Alguns fluxos realizam chamadas para `/api`, portanto a API ou os mocks necessários devem estar disponíveis conforme o cenário testado.

Atualmente há testes E2E para:

| Arquivo | Cobertura |
| ------- | --------- |
| `tests/e2e/auth-login.spec.ts` | Login inválido e redirecionamento por sessão expirada |
| `tests/e2e/dashboard.spec.ts` | Renderização do dashboard e menu do usuário |
| `tests/e2e/settings.spec.ts` | Tela de configurações e criação visual de administrador |

## Qualidade de código

O projeto utiliza ESLint com regras para JavaScript, TypeScript, React Hooks e React Refresh.

Execute a análise estática com:

```bash
npm run lint
```

O TypeScript também é validado durante o build:

```bash
npm run build
```

Não há script de formatação configurado no `package.json`.

## Integração com o ecossistema OnCoopera

```text
Backoffice Web ───> API OnCoopera ───> Banco de dados
Aplicação Mobile ─┘
```

Neste repositório, a integração ocorre por meio do cliente HTTP configurado em `src/shared/api/httpClient.ts`. As chamadas identificadas no código incluem autenticação, sessão do usuário, usuários administrativos, artigos, categorias e tags.

## Principais funcionalidades

| Funcionalidade | Evidência no projeto |
| -------------- | -------------------- |
| Login administrativo | Tela `/login` e chamadas para `/auth/login` |
| Telas de recuperação e redefinição de senha | Rotas `/recuperar-senha`, `/redefinir-senha` e contrato atual sem endpoint habilitado |
| Controle de sessão | Armazenamento de token em `localStorage` e tratamento de erro `401` |
| Dashboard administrativo | Tela `/dashboard` com indicadores principais |
| Listagem e filtro de artigos | Tela `/artigos` com busca, status, paginação e seleção |
| Criação, edição e desativação de artigos | Rotas de novo/editar artigo e chamadas para endpoints de backoffice |
| Pré-visualização e download de artigo em PDF | Tela `/artigos/preview` com React PDF |
| Configurações e administradores | Tela `/configuracoes` e criação de conta administrativa |

## Status do projeto

O projeto está em desenvolvimento.

O repositório contém implementação funcional de telas do backoffice, documentação arquitetural em `specs/` e testes end-to-end iniciais. Algumas informações exibidas na interface ainda possuem valores fallback quando não há dados retornados pela API.

## Contribuição

Como se trata de um projeto acadêmico, o desenvolvimento é realizado pela equipe responsável pelo OnCoopera.

Alterações devem respeitar a organização existente do repositório, os documentos em `specs/` e os scripts de validação disponíveis.

## Projeto acadêmico

O OnCoopera está sendo desenvolvido como Trabalho de Conclusão de Curso.

Este repositório documenta e implementa a aplicação web administrativa do ecossistema, servindo tanto como base técnica para desenvolvimento quanto como apoio à documentação acadêmica do projeto.

## Licença

Este projeto possui finalidade acadêmica. Consulte os responsáveis pelo projeto sobre condições de utilização e distribuição.
