# Arquitetura de segurança e privacidade

## 1. Princípios

O sistema aplica menor privilégio, negação por padrão, defesa em profundidade e minimização de dados. Segurança é responsabilidade da API mesmo quando o frontend oculta uma ação.

## 2. Autenticação

O MVP utiliza access token JWT de curta duração e refresh token rotativo, transportados em cookies `HttpOnly`, `Secure` em produção e `SameSite=Lax` por padrão. Tokens não devem ser armazenados em `localStorage` ou expostos ao JavaScript.

O access token deve conter somente identificador do sujeito, identificador da sessão, emissão, expiração, emissor e audiência. Dados pessoais e a lista definitiva de permissões não devem ser usados como fonte duradoura de verdade dentro do token.

Refresh tokens devem ser revogáveis por sessão e persistidos apenas como hash. Rotação bem-sucedida invalida o token anterior; reutilização detectada revoga a família da sessão. Logout revoga a sessão e expira cookies.

As chaves, duração dos tokens e atributos de cookie são configuração validada por ambiente. Algoritmo e biblioteca criptográfica devem usar opções atuais e mantidas, sem implementação própria.

## 3. Senhas

Senhas devem ser processadas com Argon2id e parâmetros calibrados para o ambiente de produção. Nunca são logadas, retornadas ou recuperáveis. O login deve usar mensagem genérica para credencial inválida e limitação de tentativas por conta e origem.

Política de senha, recuperação de acesso, MFA e bloqueio administrativo precisam de requisitos funcionais antes da produção. Não se criam perguntas secretas.

## 4. Autorização

O modelo é RBAC baseado em permissões. Perfis agrupam permissões; casos de uso exigem permissões sem depender do nome textual do perfil. A matriz inicial deve ser definida na specification de acesso antes de liberar funcionalidades reais.

Cada operação protegida verifica:

1. identidade válida;
2. sessão ativa e usuário não bloqueado;
3. permissão exigida;
4. restrições sobre o recurso, quando existirem.

Falha de autenticação retorna `401`; identidade válida sem permissão retorna `403`. Para recursos sensíveis, a specification pode optar por `404` para não revelar existência.

O schema atual modela perfis, mas não permissões. A implementação de RBAC exige evolução do banco ou uma decisão explícita de escopo antes da primeira feature autorizada.

## 5. CSRF, CORS e navegador

Como a autenticação usa cookies, operações mutáveis devem possuir proteção CSRF. A estratégia padrão é token CSRF vinculado à sessão enviado em header customizado, além de validação de `Origin`/`Referer` quando disponível.

CORS usa allowlist exata por ambiente, permite credenciais apenas para origens conhecidas e nunca combina credenciais com origem curinga. A aplicação deve definir CSP, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` e demais headers seguros no adaptador HTTP.

## 6. Validação e ataques de entrada

Toda entrada externa é validada por schema e limites de tamanho. Queries usam Prisma ou SQL parametrizado. Conteúdo rico deve ter formato permitido e sanitização definida antes de renderização; React escaping não torna HTML arbitrário seguro.

Uploads devem validar tamanho, tipo detectado pelo conteúdo, extensão permitida e autorização. Arquivos são renomeados, armazenados fora da raiz pública executável e servidos por mecanismo controlado. Antivírus e URLs assinadas são definidos pela feature conforme o risco.

## 7. Dados pessoais e LGPD

Cada feature deve registrar finalidade, dados coletados, base/premissa de tratamento fornecida pelo produto, destinatários, retenção e perfis com acesso. A API retorna somente campos necessários ao caso de uso.

Dados de saúde e acompanhamento são tratados como altamente sensíveis. Não devem aparecer em logs, analytics, mensagens de erro ou ambientes de demonstração. Exportação, correção, anonimização e exclusão dependem de política jurídica/produto documentada antes da produção.

Criptografia em trânsito é obrigatória fora do local. Criptografia em repouso, gestão de chaves e backups devem ser fornecidas e verificadas no ambiente de produção.

## 8. Segredos

Segredos entram por variáveis/secret manager, nunca pelo repositório, bundle frontend, logs ou mensagens de erro. Arquivos `.env` locais permanecem ignorados; deve existir um `.env.example` sem valores reais quando o scaffold for criado.

Vazamento suspeito exige revogação e rotação, não apenas remoção do histórico atual.

## 9. Logs e auditoria

Logs técnicos são estruturados e incluem request ID, resultado, duração e identificadores mínimos. Tokens, cookies, senhas e payloads sensíveis são redigidos.

Ações administrativas relevantes exigem trilha de auditoria append-only com ator, ação, recurso, instante, resultado e metadados não sensíveis. Login, falhas relevantes, alterações de permissão, bloqueios, publicação e operações sobre dados sensíveis devem ser considerados. O modelo e a retenção da auditoria devem ser especificados antes da primeira feature correspondente.

## 10. Respostas e erros

Erros não expõem stack trace, SQL, caminhos, segredo ou detalhe interno em produção. O cliente recebe o contrato definido em `backend.md`; logs correlacionam o erro por request ID.

Rate limits devem proteger autenticação, recuperação de acesso, exportações e endpoints caros. Valores são configuráveis por ambiente e validados por teste.

## 11. Dependências e entrega

Lockfiles são obrigatórios. CI executa análise de dependências, lint, tipos, testes e busca de segredos. Achados críticos ou altos exploráveis bloqueiam release até correção ou aceite formal de risco com prazo.

## 12. Checklist antes da produção

São bloqueantes: matriz de permissões, política de senha e recuperação, segredo/chaves fora do repositório, HTTPS, CORS/CSRF, rate limit de autenticação, headers seguros, auditoria das ações críticas, política LGPD/retensão, backup testado, monitoramento e procedimento de resposta a incidente.
