# OnCoopera BackOffice - Documentação das Telas Web

Fonte: https://www.figma.com/design/kGtVspQSArTDxtgA9AFF9I/OnCoopera?node-id=0-1

Chave do arquivo Figma: `kGtVspQSArTDxtgA9AFF9I`
Página fonte da verdade: `OnCoopera - Sem Remédio` (`325:34`)
Data de inspeção: 2026-08-25

## Escopo

Este documento mapeia as telas web/backoffice presentes na página fonte da verdade do Figma. As telas mobile que existem na mesma página estão fora do escopo deste documento.

A página inspecionada contém 15 frames web. Diferentemente da página anterior `OnCoopera - Com Remédio`, esta página fonte não inclui telas web de gestão de interações medicamentosas. Trate essas telas como fora da fonte da verdade atual, a menos que o Figma seja atualizado novamente.

## Layout Global do Backoffice

As telas web autenticadas compartilham um shell desktop fixo:

- Viewport base: `1280px` de largura.
- Sidebar: `240px` de largura, alinhada à esquerda.
- Região principal de conteúdo: aproximadamente `1040px` de largura.
- Itens principais de navegação: Início, Artigos, Radar de Apoio, Usuários, Configurações.
- Identidade exibida na sidebar: `Admin`, `admin@oncoopera.com`.
- A maioria das telas autenticadas inclui uma top app bar na área principal.

As telas de autenticação usam layout dividido:

- Coluna esquerda: área visual de marca e proposta de valor.
- Coluna direita: card ou área de formulário centralizada.

## Telas Públicas de Autenticação

### Login - Administrador

- Nó Figma: `327:3049`
- Tamanho: `1304x983`
- Rota sugerida: `/login`
- Objetivo: autenticar um administrador antes da entrada no painel.

Conteúdo e controles:

- Marca: OnCoopera.
- Título: `Bem-vindo`.
- Campos: e-mail corporativo, senha.
- Checkbox: manter conectado.
- Link: esqueci minha senha.
- Ação primária: acessar painel.

Notas de desenvolvimento:

- O envio deve validar e-mail e senha obrigatórios.
- Falha de autenticação deve preservar o e-mail; a senha deve ser limpa ou preservada conforme decisão de segurança.
- Login bem-sucedido deve redirecionar para o dashboard.
- O link de esqueci minha senha deve navegar para a tela de recuperação.

### Recuperar Senha

- Nó Figma: `327:3115`
- Tamanho: `1280x983`
- Rota sugerida: `/recuperar-senha`
- Objetivo: solicitar link de redefinição de senha para uma conta administrativa.

Conteúdo e controles:

- Título: `Recuperar acesso`.
- Campo: e-mail corporativo.
- Estado de sucesso inline: `E-mail enviado`.
- Ação primária: enviar link de recuperação.
- Ação secundária: voltar para login.

Notas de desenvolvimento:

- O estado de sucesso não deve revelar se o e-mail existe no sistema.
- A cópia de expiração do link no Figma é `30 minutos`.
- Após solicitação bem-sucedida, mantenha o usuário na tela e exiba a confirmação.

### Redefinir Senha

- Nó Figma: `327:3170`
- Tamanho: `1383x981`
- Rota sugerida: `/redefinir-senha`
- Objetivo: criar uma nova senha a partir de um token de redefinição.

Conteúdo e controles:

- Título: `Redefinir Senha`.
- Campos: nova senha, confirmar nova senha.
- Rótulo de força da senha: `FORÇA DA SENHA`.
- Exemplo de força: `Média`.
- Checklist: mínimo de 8 caracteres, letra maiúscula, número, caractere especial.
- Ação primária: salvar nova senha.

Notas de desenvolvimento:

- A tela deve validar o token antes de aceitar o envio.
- Exiba o estado de cada requisito da senha individualmente.
- O envio deve bloquear requisições duplicadas e navegar para o estado de sucesso ao concluir.

### Senha Atualizada

- Nó Figma: `327:3255`
- Tamanho: `1383x981`
- Rota/estado sugerido: `/redefinir-senha/sucesso` ou estado modal após redefinição.
- Objetivo: confirmar a conclusão da redefinição de senha.

Conteúdo e controles:

- Título do modal: `Senha atualizada`.
- Mensagem: a credencial administrativa foi redefinida com sucesso e já está ativa.
- Ação primária: ir para login.

Notas de desenvolvimento:

- Trate o card de sucesso como estado de confirmação bloqueante.
- O botão deve limpar o estado do fluxo de redefinição e navegar para `/login`.

## Telas Autenticadas

### Dashboard

- Nó Figma: `327:36`
- Tamanho: `1280x1024`
- Rota sugerida: `/`
- Objetivo: visão geral administrativa.

Conteúdo:

- Título da página: `Início`.
- Metadado: `Última alteração: hoje as 14:32`.
- Cards de resumo: artigos publicados (`24`), locais de suporte (`43`), usuários ativos (`1,247`).

Notas de desenvolvimento:

- Os cards de resumo devem ser alimentados por dados.
- Estados de carregamento, vazio e erro são obrigatórios para a área de métricas.
- Use o shell autenticado compartilhado com sidebar e top app bar.

### Artigos - Lista

- Nó Figma: `327:119`
- Tamanho: `1280x1024`
- Rota sugerida: `/artigos`
- Objetivo: gerenciar registros de artigos.

Conteúdo e controles:

- Título da página: `Artigos`.
- Ação primária: novo artigo.
- Campo de busca: `Pesquisar...`.
- Filtros/abas: todos, publicados, rascunho, em revisão.
- Colunas da tabela: título, categoria, status, autor, data de publicação, ações.
- Estado de ação em lote: `1 Item selecionado`, ação `Apagar`.

Notas de desenvolvimento:

- A tabela deve suportar busca, filtro por status, ações por linha e seleção de linhas.
- Exclusão deve exigir confirmação.
- A ação `Novo artigo` deve navegar para a tela de criação/edição.
- Parâmetros de URL devem preservar busca e filtros.

### Criar/Editar Artigo - Editor

- Nó Figma: `327:1136`
- Tamanho: `1280x1278`
- Rotas sugeridas: `/artigos/novo`, `/artigos/:articleId/editar`
- Objetivo: criar, editar, pré-visualizar e publicar um artigo.

Estrutura:

- Cabeçalho da página: Artigos / Criar novo / Artigo de rascunho / Salvo a 2 mins atrás.
- Coluna esquerda: editor de conteúdo.
- Coluna direita: painel fixo de configurações e publicação.
- Blocos auxiliares de inserção: dica, pergunte ao seu médico.

Campos e controles principais:

- Título: `Título do artigo...`.
- Resumo: `Escreva um breve resumo ou introdução...`.
- Upload de imagem: SVG, PNG, JPG or GIF, máximo `800x400px`.
- Editor de corpo: `Comece a escrever o seu artigo aqui...`.
- Status: rascunho.
- Tempo médio de leitura.
- Categoria.
- Data de publicação.
- Tags.
- Ações: pré-visualização, edição, publicar artigo, salve o rascunho.

Notas de desenvolvimento:

- Trate esta tela como formulário de feature com autosave de rascunho e feedback de status.
- A coluna direita deve permanecer visível em conteúdos altos quando viável.
- Publicação deve validar metadados obrigatórios e conteúdo do artigo.
- Restrições de upload de imagem devem ser validadas antes do envio.

### Criar/Editar Artigo - Dica Modal

- Nó Figma: `327:1357`
- Nó do modal: `327:1579`
- Tamanho: `1280x1278`
- Estado sugerido: estado modal do editor de artigo.
- Objetivo: explicar como inserir um bloco `Dica`.

Conteúdo do modal:

- Título: `Para adicionar o bloco de Dica`.
- Marcador de exemplo: `## Dica ##`.
- Ação de confirmação: OK.

Notas de desenvolvimento:

- Pode ser implementado como modal de ajuda contextual a partir da toolbar ou inseridor de blocos do editor.
- O foco deve ficar preso no modal enquanto ele estiver aberto.

### Criar/Editar Artigo - Pergunta Modal

- Nó Figma: `327:1593`
- Nó do modal: `327:1815`
- Tamanho: `1280x1278`
- Estado sugerido: estado modal do editor de artigo.
- Objetivo: explicar como inserir um bloco `Pergunta`.

Conteúdo do modal:

- Título: `Para adicionar o bloco de Pergunta`.
- Marcador de exemplo: `## Pergunta ##`.
- Ação de confirmação: OK.

Notas de desenvolvimento:

- Reutilize o mesmo componente de modal e padrão de ajuda de bloco do modal de Dica.
- O texto de exemplo contém duas perguntas citadas; suporte exemplos com múltiplas linhas.

### Radar de Apoio - Lista

- Nó Figma: `327:306`
- Tamanho: `1280x1024`
- Rota sugerida: `/radar-de-apoio`
- Objetivo: gerenciar locais e recursos de apoio.

Conteúdo e controles:

- Título da página: `Radar de Apoio`.
- Ação primária: novo apoio.
- Filtros/abas: todos, clínicas, ONGs, transporte, psicólogo.
- Campo de busca: `Pesquisar...`.
- Colunas da tabela/lista: detalhes do local, tipo, região, contatos, status, ações.
- Registros de exemplo: INCA, AVON Support House.

Notas de desenvolvimento:

- Busca e filtro por categoria devem ser refletidos na URL.
- A lista deve suportar status ativo/inativo, ações por linha e paginação quando os dados crescerem.
- A ação `Novo apoio` deve navegar para a tela de criação/edição de recurso de apoio.

### Radar de Apoio - Novo Cadastro

- Nó Figma: `327:503`
- Tamanho: `1280x1278`
- Rotas sugeridas: `/radar-de-apoio/novo`, `/radar-de-apoio/:supportId/editar`
- Objetivo: criar ou editar um local/recurso de apoio.

Seções e campos:

- Informações gerais: nome do local, categoria, descrição.
- Endereço/geolocalização: cidade, estado, endereço completo, seletor de localização exata no mapa.
- Horários: horários.
- Upload de foto do local: JPG ou PNG, máximo `5MB`.
- Ações: cancelar, salvar cadastro.

Notas de desenvolvimento:

- Campos obrigatórios são marcados com `*` no design.
- Seleção de mapa/geolocalização deve ser tratada como campo próprio, não apenas texto.
- O formulário deve preservar dados preenchidos após falha de validação.
- Validação de upload deve cobrir tipo e tamanho antes do envio do arquivo.

### Usuários - Diretório

- Nó Figma: `327:658`
- Tamanho: `1280x1024`
- Rota sugerida: `/usuarios`
- Objetivo: consultar e gerenciar contas de usuários.

Conteúdo e controles:

- Título da página: `Usuários`.
- Aviso de privacidade: `Protocolo de Privacidade de Dados de Saúde`.
- Cards de métricas: total de usuários, crescimento, engajamento.
- Seção: diretório de usuário.
- Ação: exportar dados.
- Colunas da tabela: usuário, contato, registro, último acesso, status, ação.
- Registros de exemplo: Maria Silva, João Pereira.

Notas de desenvolvimento:

- O acesso a dados deve respeitar regras de LGPD e privacidade.
- Exportação deve exigir permissão explícita e ser auditável.
- A página precisa de estados vazio, carregando, erro e acesso negado.

### Usuários - Cadastro/Admin Form

- Nó Figma: `327:822`
- Tamanho: `1280x1024`
- Rota sugerida: `/usuarios/novo` ou `/usuarios/:userId/editar`
- Objetivo: criar ou editar perfil de usuário/admin do backoffice.

Seções e campos:

- Dados pessoais: nome completo, e-mail profissional, telefone, cargo/especialidade.
- Tipo de perfil: administrador, profissional de saúde, moderador, suporte.
- Permissões detalhadas: gerenciar usuários, medicamentos, gestão de conteúdos, relatórios gerenciais.
- Ações: cancelar, salvar cadastro.

Notas de desenvolvimento:

- A seleção de perfil deve definir permissões padrão.
- Toggles individuais de permissão devem permanecer explícitos e auditáveis.
- Alterações de e-mail e perfil podem exigir confirmação mais forte conforme política do backend.

### Configurações - Conta

- Nó Figma: `327:1021`
- Tamanho: `1280x1050`
- Rota sugerida: `/configuracoes`
- Objetivo: gerenciar a conta do admin atual e a lista de administradores.

Conteúdo e controles:

- Título da página: `Configurações`.
- Subtítulo: `Administre sua conta de acesso`.
- Seção: minha conta.
- Upload de avatar: JPG ou PNG, máximo `200 mb` conforme cópia do design.
- Campos: nome completo, endereço e-mail.
- Ação: salvar.
- Seção: administradores.
- Ação: Add Admin.
- Admins de exemplo: Dr. James Wilson, Elena Rodriguez, Marcus Thorne.

Notas de desenvolvimento:

- O limite de avatar `200 mb` parece incomum e deve ser validado com produto/design antes da implementação.
- `Add Admin` deve navegar para o fluxo de criação de conta administrativa.
- Alterações em campos de identidade da conta devem exibir feedback de sucesso/erro inline.

### Criar Conta Administrativa

- Nó Figma: `327:3355`
- Tamanho: `1280x981`
- Rota sugerida: `/configuracoes/administradores/novo`
- Objetivo: criar uma nova conta administrativa a partir de configurações.

Campos e controles:

- Nome completo.
- E-mail corporativo.
- Senha.
- Texto auxiliar da senha: mínimo de 8 caracteres.
- Força da senha: `Força: Razoável`.
- Confirmar senha.
- Checkbox de aceite de termos/privacidade.

Notas de desenvolvimento:

- O formulário não pode ser enviado até o aceite de termos/privacidade.
- A validação de senha deve reutilizar as regras de redefinição de senha quando possível.
- Criação bem-sucedida deve retornar para configurações ou exibir estado de confirmação.

## Inventário de Telas

| Área | Tela | Node ID | Rota candidata |
| --- | --- | --- | --- |
| Autenticação | Login - Administrador | `327:3049` | `/login` |
| Autenticação | Recuperar senha | `327:3115` | `/recuperar-senha` |
| Autenticação | Redefinir senha | `327:3170` | `/redefinir-senha` |
| Autenticação | Senha atualizada | `327:3255` | `/redefinir-senha/sucesso` |
| Dashboard | Dashboard | `327:36` | `/` |
| Artigos | Lista | `327:119` | `/artigos` |
| Artigos | Criar/Editar | `327:1136` | `/artigos/novo`, `/artigos/:articleId/editar` |
| Artigos | Ajuda Dica | `327:1357` / `327:1579` | estado do editor |
| Artigos | Ajuda Pergunta | `327:1593` / `327:1815` | estado do editor |
| Radar de Apoio | Lista | `327:306` | `/radar-de-apoio` |
| Radar de Apoio | Novo/Editar | `327:503` | `/radar-de-apoio/novo`, `/radar-de-apoio/:supportId/editar` |
| Usuários | Diretório | `327:658` | `/usuarios` |
| Usuários | Cadastro/form admin | `327:822` | `/usuarios/novo`, `/usuarios/:userId/editar` |
| Configurações | Conta | `327:1021` | `/configuracoes` |
| Configurações | Criar conta administrativa | `327:3355` | `/configuracoes/administradores/novo` |

## Componentes Compartilhados Sugeridos Pelo Design

- Layout dividido de autenticação.
- Card de formulário de autenticação.
- Modal bloqueante/de sucesso de autenticação.
- Shell do backoffice com sidebar e top app bar.
- Cabeçalho de página com título, breadcrumbs/status e ação primária.
- Card de métrica.
- Campo de busca.
- Filtro segmentado de status/categoria.
- Tabela com ações por linha e seleção.
- Barra de ações em lote.
- Seção/card de formulário.
- Painel fixo de publicação/configurações.
- Dropzone de upload de arquivo.
- Dialog/modal.
- Checklist de força de senha.
- Seletor de perfil/permissões.

## Checklist de Implementação

- Preservar o node ID do Figma nas tasks de implementação de cada tela.
- Implementar grupos de rotas públicas e autenticadas separadamente.
- Adicionar guards para todas as rotas autenticadas.
- Refletir filtros e buscas de listagens na URL.
- Cobrir estados de carregamento, vazio, erro, acesso negado e carregado em todas as telas com dados.
- Confirmar ações destrutivas, como apagar artigos.
- Validar tipo/tamanho de upload antes da transmissão.
- Gerenciar foco por teclado em estados modais.
- Garantir tabelas com cabeçalhos semânticos e nomes acessíveis para ações de linha.
- Manter acesso e exportação de dados sensíveis à LGPD auditáveis.
