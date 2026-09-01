# Regra de implementação a partir do Figma

Ao implementar telas a partir de protótipos do Figma, o protótipo deve ser utilizado como referência visual de layout, hierarquia, espaçamento e composição, e não como uma representação literal dos elementos que devem ser utilizados no código.

## Ícones

* Nunca utilizar imagens, SVGs exportados do Figma, screenshots, assets rasterizados ou elementos gráficos do protótipo para representar ícones que possuam equivalente na biblioteca de ícones adotada pelo projeto.
* Todos os ícones da interface devem utilizar prioritariamente a biblioteca **Lucide React**.
* Antes de criar ou importar qualquer asset de ícone, procurar um equivalente semântico no `lucide-react`.
* O ícone deve ser escolhido de acordo com sua função, e não apenas pela semelhança visual com o protótipo.
* Exemplos:

  * editar → `Pencil`
  * excluir → `Trash2`
  * pesquisar → `Search`
  * adicionar → `Plus`
  * visualizar → `Eye`
  * configurações → `Settings`
  * voltar → `ArrowLeft`
  * próximo → `ChevronRight`
  * fechar → `X`
* Ícones customizados ou assets provenientes do Figma somente podem ser utilizados quando não existir equivalente adequado no Lucide ou quando se tratar de uma identidade visual específica, como logotipo, brasão ou ilustração.
* Não utilizar `<img>` para ícones comuns de interface.
* Manter consistência de tamanho e espessura entre os ícones da aplicação.

Exemplo preferencial:

```tsx
import { Search } from 'lucide-react'

<Search className="size-4" />
```

Evitar:

```tsx
<img src="/assets/search-icon.svg" />
```

---

## Dimensões dos componentes

As dimensões observadas no Figma não devem ser copiadas cegamente utilizando valores absolutos de largura e altura.

O código deve preservar a proporção visual do protótipo respeitando simultaneamente:

1. o Design System existente;
2. o espaço disponível na tela;
3. responsividade;
4. consistência com componentes semelhantes já existentes no projeto.

### Regras gerais

* Evitar definir `width` e `height` fixos apenas porque esses valores aparecem no Figma.
* Priorizar layouts fluidos utilizando:

  * `w-full`
  * `max-w-*`
  * `min-w-*`
  * `flex`
  * `grid`
  * `flex-1`
  * `gap-*`
  * breakpoints responsivos.
* Utilizar dimensões fixas somente quando o elemento possuir naturalmente uma dimensão estável, como:

  * ícones;
  * avatares;
  * botões quadrados;
  * thumbnails;
  * logos;
  * controles pequenos.
* Inputs, selects, cards, tabelas, formulários e containers devem se adaptar ao espaço disponível.
* Não aumentar ou reduzir um componente isoladamente apenas para coincidir visualmente com o screenshot do Figma.
* Comparar o componente com elementos equivalentes já utilizados em outras telas do sistema.

---

## Escala visual

Ao interpretar o Figma, considerar que o protótipo pode ter sido criado em uma resolução ou viewport diferente da aplicação executada.

Portanto:

* não assumir que a dimensão em pixels do Figma deve ser igual à dimensão CSS final;
* interpretar proporções e relações espaciais;
* preservar a hierarquia entre componentes;
* manter campos, botões e textos dentro da escala visual já utilizada pelo sistema.

Por exemplo, se um input parecer possuir `48px` de altura no Figma, mas o Design System do projeto utiliza inputs de `40px`, deve ser utilizado o padrão de `40px`, salvo quando existir justificativa funcional para uma variação.

---

## Prioridade de decisão

Sempre utilizar a seguinte ordem de prioridade ao implementar um componente:

1. **Componente já existente no projeto**
2. **Design System do projeto**
3. **Componentes do shadcn/ui**
4. **Lucide React para ícones**
5. **Layout e intenção visual do Figma**
6. **Valores absolutos encontrados no Figma**

O Figma nunca deve sobrescrever silenciosamente padrões globais já estabelecidos no sistema.

---

## Reutilização

Antes de implementar qualquer elemento visual:

* verificar se já existe componente equivalente em `components/ui`, `components/layout` ou nos componentes compartilhados do projeto;
* reutilizar componentes globais sempre que possível;
* não recriar localmente componentes já existentes;
* não modificar um componente global apenas para adequá-lo a uma única tela sem verificar possíveis impactos em outras páginas.

Caso seja necessária uma pequena variação visual, preferir utilizar propriedades, variantes ou classes locais.

---

## Responsividade

A implementação deve ser validada considerando diferentes larguras de viewport.

Não implementar a tela apenas para reproduzir a resolução exata utilizada no frame do Figma.

Os componentes devem:

* crescer e diminuir de forma previsível;
* evitar larguras excessivas;
* evitar elementos comprimidos;
* quebrar linhas ou reorganizar colunas quando necessário;
* manter espaçamentos consistentes.

Quando houver formulários, utilizar grid responsivo sempre que apropriado.

Exemplo:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
```

em vez de:

```tsx
<div className="flex">
  <div className="w-[387px]" />
  <div className="w-[412px]" />
  <div className="w-[365px]" />
</div>
```

---

## Validação antes de finalizar

Antes de considerar a implementação concluída, verificar:

* Os ícones comuns utilizam Lucide React?
* Algum ícone foi convertido indevidamente em imagem ou SVG exportado?
* Algum componente recebeu largura ou altura fixa apenas para reproduzir o Figma?
* Os componentes estão proporcionalmente consistentes com o restante do sistema?
* Foram reutilizados os componentes globais existentes?
* Inputs, selects e botões seguem as dimensões do Design System?
* A tela continua visualmente correta em outras larguras?
* Há algum elemento excessivamente grande ou pequeno em relação aos componentes equivalentes existentes?

Caso o Figma entre em conflito com um padrão já consolidado no projeto, priorizar o padrão existente e preservar apenas a intenção visual do protótipo.
