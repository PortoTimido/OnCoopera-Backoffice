# OnCoopera Backoffice — Project Constitution

## 1. Propósito e escopo

Esta Constitution define os princípios, restrições e regras fundamentais que devem orientar o desenvolvimento do **backoffice do OnCoopera**.

Seu escopo é exclusivamente a aplicação administrativa utilizada para gerenciamento das informações e funcionalidades de backoffice do projeto.

Esta Constitution não define regras arquiteturais ou de implementação da aplicação mobile do OnCoopera.

Ela deve ser considerada a referência normativa de mais alto nível do backoffice para decisões relacionadas a:

* arquitetura;
* organização do código;
* desenvolvimento de funcionalidades;
* integração com o backend;
* qualidade de software;
* segurança;
* privacidade;
* acessibilidade;
* testes;
* documentação;
* Spec Driven Development.

As regras descritas neste documento devem ser respeitadas por desenvolvedores e agentes de inteligência artificial utilizados no desenvolvimento do backoffice.

Detalhes específicos de funcionalidades não devem ser definidos nesta Constitution. Eles devem permanecer nas respectivas specifications.

---

# 2. Stack tecnológica

## 2.1 Linguagem

TypeScript é a linguagem padrão para o desenvolvimento do backoffice e dos componentes de backend relacionados ao projeto.

Novos códigos devem utilizar TypeScript.

---

## 2.2 Frontend

O backoffice será desenvolvido utilizando:

* React;
* TypeScript.

A ferramenta de build e o roteamento do frontend são definidos no ADR-002. A biblioteca de componentes e/ou biblioteca visual é uma decisão incremental ainda aberta.

Enquanto não houver um Design System formal, o desenvolvimento deve:

* priorizar reutilização de componentes;
* evitar duplicação desnecessária;
* manter consistência visual entre telas;
* seguir boas práticas de componentização;
* utilizar os protótipos existentes no Figma como referência visual.

Antes de criar um novo componente, deve ser avaliado se a necessidade pode ser atendida por:

1. reutilização de um componente existente;
2. composição de componentes existentes;
3. extensão controlada de um componente existente.

A criação de abstrações excessivamente genéricas apenas para eliminar pequenas duplicações deve ser evitada.

---

## 2.3 Backend

O backend utilizado pelo backoffice será desenvolvido sobre:

* Node.js;
* TypeScript.

Fastify é o adaptador HTTP e Zod é utilizado para validação nas bordas, conforme ADR-003. Essas dependências não devem atravessar as fronteiras da API e da infraestrutura.

---

## 2.4 Banco de dados

O banco de dados utilizado pelo sistema será PostgreSQL.

O acesso ao banco será realizado utilizando Prisma.

Detalhes de persistência devem permanecer isolados das regras centrais de negócio.

O domínio da aplicação não deve depender diretamente do Prisma.

---

# 3. Arquitetura do backend

O backend seguirá Domain-Driven Design — DDD.

Sua organização em alto nível será:

```text
api/
application/
documentation/
domain/
infrastructure/
```

Cada camada deve possuir responsabilidades claramente delimitadas.

---

## 3.1 Domain

A camada `domain` representa os conceitos e regras de negócio do sistema.

Ela deve permanecer independente de:

* framework HTTP;
* controllers;
* Prisma;
* banco de dados;
* serviços externos;
* interface gráfica.

Regras de negócio relevantes devem permanecer no domínio ou em estruturas coerentes com o modelo adotado, e não em controllers ou componentes React.

---

## 3.2 Application

A camada `application` deve coordenar os casos de uso da aplicação.

Ela pode utilizar elementos do domínio para realizar operações e orquestrar o fluxo necessário para atender uma funcionalidade.

A camada de aplicação não deve depender de detalhes específicos de interface gráfica.

---

## 3.3 API

A camada `api` representa a entrada HTTP da aplicação.

Ela deve ser responsável principalmente por:

* receber requisições;
* interpretar parâmetros;
* validar dados de entrada conforme o padrão definido;
* acionar os casos de uso apropriados;
* transformar resultados em respostas HTTP;
* retornar códigos HTTP adequados.

Controllers ou estruturas equivalentes não devem concentrar regras de negócio.

---

## 3.4 Infrastructure

A camada `infrastructure` deve concentrar detalhes técnicos externos ao domínio.

Isso inclui, quando aplicável:

* Prisma;
* implementações de repositórios;
* persistência;
* acesso ao banco de dados;
* integração com serviços externos;
* implementações específicas de infraestrutura.

Mudanças de infraestrutura não devem exigir alterações desnecessárias no domínio.

---

## 3.5 Documentation

A área `documentation` deve concentrar documentação técnica relacionada ao backend quando essa documentação fizer parte da estrutura da aplicação.

Os artefatos de SDD devem permanecer organizados em sua própria estrutura documental e não devem ser misturados com código de domínio.

---

# 4. Dependências entre camadas

A arquitetura deve preservar a independência das regras de negócio.

Como princípio:

```text
API
 ↓
Application
 ↓
Domain

Infrastructure
      ↓
Application / Domain abstractions
```

O domínio não deve depender:

* da API;
* da infraestrutura;
* do framework do backend;
* do Prisma;
* do React;
* de qualquer detalhe de interface.

A infraestrutura pode implementar contratos definidos pelas camadas internas.

---

# 5. Arquitetura do frontend

A arquitetura do frontend é organizada por features, conforme ADR-002 e `architecture/frontend.md`. Novas funcionalidades devem:

* respeitar a organização já existente no projeto;
* manter código relacionado próximo quando isso melhorar coesão;
* separar componentes visuais de lógica relevante;
* evitar dependências desnecessárias entre módulos;
* evitar componentes com responsabilidades excessivas;
* reutilizar estruturas existentes antes de criar novas abstrações.

Mudanças globais nessa organização devem ser registradas através de ADR.

---

# 6. REST API

A comunicação entre o backoffice e o backend será realizada através de REST API.

---

## 6.1 Contratos

Os contratos entre frontend e backend devem ser explícitos.

Uma functionality que introduza ou altere uma operação da API deve documentar, quando aplicável:

* objetivo;
* método HTTP;
* rota;
* parâmetros;
* corpo da requisição;
* resposta esperada;
* possíveis erros;
* regras de autorização.

Mudanças que quebrem contratos existentes devem ser identificadas durante a etapa de design.

---

## 6.2 Padrão de rotas

O padrão global de rotas REST, paginação e erros é definido no ADR-004 e em `architecture/conventions.md`.

Nenhuma feature deve alterar implicitamente esse padrão global. Exceções precisam ser justificadas no design; mudanças transversais exigem novo ADR.

---

# 7. Autenticação e autorização

## 7.1 Mecanismo

O MVP utiliza access token JWT de curta duração e refresh token rotativo em cookies seguros, com sessão revogável no servidor, conforme ADR-005 e `architecture/security.md`.

O código de negócio depende de uma identidade autenticada e não de cookies, JWT ou framework HTTP.

---

## 7.3 Autorização

Autenticação e autorização são responsabilidades distintas.

Sempre que uma funcionalidade possuir restrições de acesso, a specification deve indicar quais atores podem executar determinada operação.

A autorização efetiva deve ser validada pelo backend.

Ocultar um recurso no frontend não deve ser considerado mecanismo suficiente de segurança.

---

# 8. Privacidade e LGPD

O backoffice do OnCoopera deve ser desenvolvido considerando adequação à Lei Geral de Proteção de Dados — LGPD.

As regras específicas de tratamento, retenção e proteção de dados ainda não foram formalmente definidas.

Portanto, esta Constitution não estabelece mecanismos técnicos que ainda não tenham sido aprovados.

Entretanto, toda nova funcionalidade que manipule dados pessoais deve avaliar, quando aplicável:

* quais dados são utilizados;
* por que são necessários;
* onde são armazenados;
* quem pode visualizá-los;
* quem pode alterá-los;
* quais dados são retornados pela API;
* riscos de exposição indevida.

Dados pessoais não devem ser expostos apenas por conveniência de implementação.

---

# 9. Acessibilidade

A acessibilidade é um requisito transversal do backoffice.

O alvo do MVP é WCAG 2.2 nível AA nos fluxos administrativos implementados. Os critérios técnicos mínimos estão em `architecture/frontend.md` e devem ser considerados durante design, implementação e validação.

---

# 10. Interface e Figma

Os protótipos existentes no Figma são atualmente a principal referência visual do backoffice.

Eles devem orientar:

* composição das telas;
* hierarquia visual;
* organização das informações;
* fluxos de interação;
* comportamento representado nos protótipos.

---

## 10.1 Ausência de Design System formal

O projeto ainda não possui Design System formal.

Não devem ser inventadas como regras globais definições que ainda não existem, como:

* tokens;
* paleta oficial;
* escalas de espaçamento;
* tipografia oficial;
* breakpoints;
* biblioteca de componentes obrigatória.

Padrões recorrentes devem ser identificados e, quando fizer sentido, transformados em componentes reutilizáveis.

---

# 11. Componentização

Componentes devem possuir responsabilidades claras.

Componentes puramente visuais não devem concentrar:

* regras de negócio;
* persistência;
* decisões de autorização;
* integrações complexas com API.

Antes da criação de um novo componente, deve ser verificado se já existe uma implementação equivalente.

Componentes compartilhados devem representar comportamentos realmente reutilizáveis.

Componentes específicos de uma feature não devem ser promovidos prematuramente a componentes globais.

---

# 12. Qualidade de código

O desenvolvimento deve priorizar:

* legibilidade;
* simplicidade;
* coesão;
* baixo acoplamento;
* responsabilidades claras;
* manutenção;
* previsibilidade;
* reutilização adequada.

Soluções mais complexas não devem ser escolhidas apenas por serem consideradas tecnicamente mais sofisticadas.

A arquitetura deve atender às necessidades reais do sistema.

---

## 12.1 Responsabilidade

Código de interface não deve concentrar regra de negócio.

Código HTTP não deve concentrar regra de domínio.

Código de persistência não deve definir comportamento de negócio pertencente ao domínio.

---

## 12.2 Duplicação

Duplicação significativa de lógica deve ser evitada.

Antes de repetir um comportamento existente, deve ser considerada a reutilização.

Entretanto, pequenas semelhanças não justificam automaticamente uma abstração compartilhada.

---

## 12.3 Escopo

A implementação deve permanecer dentro do escopo definido pela specification.

Refatorações não relacionadas à funcionalidade não devem ser executadas apenas por preferência do desenvolvedor ou do agente.

Quando uma alteração fora do escopo for necessária, ela deve ser identificada durante design ou review.

---

# 13. Testes

Testes fazem parte do processo de desenvolvimento e validação.

Os critérios de aceite das specifications devem servir como referência para definição dos cenários testáveis.

---

## 13.1 Backend

Japa será utilizado como ferramenta de testes do backend.

A estratégia divide testes entre domínio unitário, aplicação com dependências substituídas, integração de infraestrutura e API funcional, conforme `architecture/backend.md`.

Não existe atualmente uma taxa mínima obrigatória de cobertura.

---

## 13.2 Frontend

Playwright será utilizado para testes aplicáveis ao backoffice.

A ferramenta complementar para testes unitários e de componentes será escolhida junto ao scaffold do frontend e registrada no ADR-002 ou em ADR substituto.

Playwright não deve ser considerado automaticamente a única ferramenta de testes do frontend até que exista uma decisão formal nesse sentido.

---

## 13.3 Testes de regressão

Quando um bug puder ser reproduzido de forma automatizada, deve ser avaliada a criação de um teste de regressão.

O objetivo é evitar que o mesmo comportamento defeituoso seja reintroduzido posteriormente.

---

# 14. Spec Driven Development

O desenvolvimento de funcionalidades relevantes do backoffice deve seguir Spec Driven Development — SDD.

O fluxo obrigatório é:

```text
requirements
     ↓
design
     ↓
review
     ↓
tasks
     ↓
implementation
     ↓
validation
```

A implementação não substitui a specification.

---

# 15. Requirements

A etapa de `requirements` deve responder principalmente:

> O que precisa ser desenvolvido e por quê?

Ela deve priorizar necessidades funcionais e regras de negócio.

Quando aplicável, deve conter:

* objetivo;
* atores;
* requisitos funcionais;
* regras de negócio;
* restrições;
* critérios de aceite;
* cenários relevantes;
* erros esperados;
* requisitos de segurança;
* privacidade;
* acessibilidade.

Requirements não devem inventar decisões técnicas desnecessárias.

Informações ainda desconhecidas devem ser explicitamente tratadas como pendentes.

---

# 16. Design

A etapa de `design` deve responder:

> Como os requirements serão implementados tecnicamente?

Quando aplicável, deve considerar:

* frontend;
* backend;
* camadas afetadas;
* componentes;
* casos de uso;
* domínio;
* persistência;
* alterações no banco;
* endpoints;
* contratos da API;
* autenticação;
* autorização;
* tratamento de erros;
* impactos em funcionalidades existentes;
* estratégia de testes.

O design deve respeitar esta Constitution e os ADRs aceitos.

---

# 17. Review

Antes da criação das tasks, requirements e design devem ser revisados.

A revisão deve procurar, quando aplicável:

* ambiguidades;
* contradições;
* requisitos incompletos;
* regras de negócio ausentes;
* violações arquiteturais;
* funcionalidades existentes que possam ser reutilizadas;
* componentes existentes;
* impactos em outras telas;
* riscos de segurança;
* riscos de privacidade;
* impactos no banco;
* divergências entre Figma e specification;
* decisões técnicas sem justificativa.

Problemas encontrados devem ser corrigidos antes da implementação.

---

# 18. Tasks

Após o design ser revisado, o trabalho deve ser dividido em tasks executáveis.

Cada task deve representar uma unidade clara de implementação.

Sempre que possível, deve existir rastreabilidade entre requirements e tasks.

Exemplo:

```text
REQ-003
   ↓
T005 — Implementar caso de uso
T006 — Criar endpoint
T007 — Integrar tela
T008 — Validar critério de aceite
```

Tasks como:

```text
Implementar funcionalidade.
```

devem ser evitadas por serem genéricas demais.

---

# 19. Implementation

A implementação deve seguir:

* Constitution;
* ADRs aplicáveis;
* requirements;
* design;
* tasks.

Decisões já estabelecidas não devem ser alteradas silenciosamente.

Se durante a implementação surgir uma necessidade que altere requirements ou design, a documentação deve ser revisada para refletir a nova decisão.

---

# 20. Validation

A etapa de validation deve verificar se a implementação corresponde ao comportamento especificado.

Devem ser considerados:

* requirements;
* critérios de aceite;
* design;
* tasks;
* testes existentes;
* comportamento final da interface.

Uma task marcada como concluída não significa automaticamente que a functionality está validada.

---

# 21. Rastreabilidade

Sempre que viável, deve ser possível seguir a relação:

```text
Requirement
    ↓
Design
    ↓
Task
    ↓
Implementation
    ↓
Validation
```

Requisitos não devem desaparecer silenciosamente durante a implementação.

Comportamentos não especificados não devem surgir sem que a documentação correspondente seja atualizada.

---

# 22. Architecture Decision Records

Decisões arquiteturais relevantes e transversais ao backoffice devem ser registradas através de ADRs.

Um ADR deve ser criado quando uma decisão:

* afetar múltiplas features;
* estabelecer um padrão global;
* possuir alternativas relevantes;
* possuir consequências arquiteturais;
* precisar registrar por que determinada alternativa foi escolhida.

Exemplos:

* framework do backend;
* arquitetura do frontend React;
* padrão de rotas REST;
* estratégia de autenticação;
* biblioteca de componentes;
* estratégia global de testes.

Decisões específicas de uma única feature devem permanecer na documentação da própria feature quando não justificarem um ADR.

---

# 23. Informações não definidas

Informações desconhecidas não devem ser inventadas.

Quando uma specification depender de uma informação ainda não definida, deve-se:

1. identificar a lacuna;
2. verificar se já existe decisão aplicável;
3. solicitar esclarecimento quando necessário;
4. registrar a decisão no artefato adequado.

Não devem ser presumidos:

* requisitos;
* regras de negócio;
* permissões;
* tecnologias;
* comportamentos;
* valores;
* contratos;
* decisões arquiteturais.

---

# 24. Uso de agentes de IA

Agentes de inteligência artificial utilizados no desenvolvimento do backoffice devem considerar esta Constitution como uma restrição obrigatória.

Antes da implementação, o agente deve consultar:

1. Constitution;
2. ADRs aplicáveis;
3. requirements da feature;
4. design;
5. tasks aprovadas.

O agente deve analisar o código existente antes de criar novas estruturas.

Deve procurar:

* padrões existentes;
* componentes reutilizáveis;
* implementações semelhantes;
* contratos existentes;
* regras relacionadas;
* possíveis impactos da alteração.

---

## 24.1 Agentes não devem

* inventar requisitos;
* inventar regras de negócio;
* estabelecer padrões globais silenciosamente;
* substituir decisões arquiteturais por preferências próprias;
* introduzir bibliotecas sem necessidade;
* refatorar partes não relacionadas sem justificativa;
* mover regras de negócio para controllers;
* mover regras de negócio para componentes React;
* ignorar ADRs aplicáveis;
* considerar uma feature concluída sem validação.

---

# 25. Hierarquia documental

A documentação do SDD deve respeitar a seguinte separação:

```text
Constitution
    │
    │ regras globais
    ↓
Architecture Decision Records
    │
    │ decisões arquiteturais
    ↓
Feature Requirements
    │
    │ o que deve acontecer
    ↓
Feature Design
    │
    │ como será implementado
    ↓
Feature Tasks
    │
    │ trabalho executável
    ↓
Implementation
    │
    ↓
Validation
```

Uma specification não deve contradizer esta Constitution.

Uma feature não deve contradizer um ADR aceito sem que a decisão arquitetural correspondente seja revisada.

---

# 26. Evolução da Constitution

Esta Constitution deve evoluir somente quando uma nova regra passar a ser considerada global para o desenvolvimento do backoffice.

Antes de adicionar uma regra, deve ser feita a seguinte pergunta:

> Esta decisão deve obrigatoriamente ser seguida pelas próximas funcionalidades do backoffice?

Se a resposta for não, a informação provavelmente pertence a:

* requirements;
* design;
* decisions da feature;
* ADR.

---

# 27. Princípio final

O objetivo do SDD não é produzir documentação por formalidade.

A documentação existe para aumentar:

* clareza;
* consistência;
* rastreabilidade;
* previsibilidade;
* qualidade;
* facilidade de manutenção;
* confiabilidade da implementação realizada por humanos ou agentes de IA.

Quando existir uma decisão relevante ainda não definida, ela deve ser esclarecida antes de ser incorporada ao código como comportamento oficial do sistema.
