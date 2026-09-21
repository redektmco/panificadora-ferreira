# Panificadora Ferreira's — Landing Page

Reconstrução da LP `lp.panificadoraferreiras.com.br` (originalmente feita no
GreatPages) como site estático, sem build e sem dependências externas.

```
index.html            página inteira
assets/css/styles.css estilos
assets/js/main.js     animações, carrossel e montador de pedido
assets/img/           imagens otimizadas
scripts/              utilitário para baixar as fotos que faltam
origem/               material de referência — não é publicado
```

Para rodar local: `python3 -m http.server` na raiz. Para publicar: sirva a
raiz do repositório (menos `origem/`).

## Google Tag Manager

Contêiner `GTM-WBXM8Q9J`, instalado conforme a documentação:

- o snippet principal é o **primeiro elemento dentro de `<head>`**;
- o `<noscript>` é o **primeiro elemento dentro de `<body>`**.

Além disso, `assets/js/main.js` alimenta o `dataLayer` com dois eventos:

| Evento | Quando dispara | Parâmetros |
| --- | --- | --- |
| `clique_whatsapp` | Clique em qualquer CTA de WhatsApp | `origem` (`topo`, `hero`, `kit-reuniao`, `kit-aniversariantes`, `kit-evento`, `flutuante`) |
| `montador_enviado` | Envio pelo montador de pedido | `kit`, `pessoas`, `quando` |

Dá para criar acionadores de evento personalizado no GTM direto por esses
nomes, sem precisar mexer no código.

## Elemento interativo: montador de pedido

No CTA final, um formulário monta a mensagem do WhatsApp em tempo real a
partir de três escolhas — kit, número de pessoas e data. O texto aparece numa
prévia antes de enviar, e o botão abre a conversa já preenchida.

A escolha não é decorativa: o próprio texto da LP pede *"manda o número de
pessoas e a data pelo WhatsApp agora"*. O montador tira esse trabalho do
visitante e, de quebra, faz a intenção chegar estruturada no `dataLayer`.

Nada é enviado pela página — não há backend, nem coleta de dados.

## Animações de entrada

Marque qualquer elemento com `data-reveal` para que ele entre com fade +
deslocamento quando aparecer na viewport:

```html
<section data-reveal>...</section>
<div data-reveal="esquerda">...</div>   <!-- esquerda | direita | zoom -->
```

Para cascata entre irmãos, envolva-os com `data-reveal-grupo` (valor = passo
em ms, padrão 90):

```html
<ul data-reveal-grupo="120">
  <li data-reveal>...</li>
  <li data-reveal>...</li>
</ul>
```

Os números do topo (`+5`, `200+`, `100%`) sobem de zero ao entrar na tela via
`data-contador`. O carrossel do hero faz crossfade a cada 4,5 s e pausa no
hover, no foco do teclado e quando a aba sai de foco.

Tudo respeita `prefers-reduced-motion`: com movimento reduzido, o conteúdo
aparece direto e o carrossel não gira sozinho. Sem JavaScript, a página
continua legível e todos os CTAs funcionam.

## Melhorias de performance

**239,5 KB contra 1.260,4 KB — 81% a menos** (comparando HTML + CSS + JS +
assets próprios; as fotos hospedadas no CDN são as mesmas nas duas versões).
Requisições de asset próprio caíram de 27 para 10.

De onde veio a diferença:

- **Um DOM em vez de dois.** O GreatPages emitia a página inteira duplicada,
  uma cópia para desktop e outra para mobile, com tudo posicionado em
  `position:absolute` e coordenadas em pixel. Aqui é uma marcação só,
  responsiva com Grid e Flexbox: 356 KB de HTML viraram 30 KB.
- **Zero JavaScript de terceiros.** Os 182 KB do runtime do construtor saíram;
  `main.js` tem 9 KB, sem dependências, carregado com `defer`.
- **Logo: 364 KB → 49 KB.** O arquivo era um SVG que só embrulhava dois PNGs
  em base64 (arte + máscara de luminância). Recompondo os dois num WebP com
  alpha real, e servindo um arquivo em vez de oito cópias.
- **28 KB a menos em um quadrado.** O fundo laranja da seção de kits era um
  SVG de 28 KB com um retângulo de cor sólida. Agora é `background-color`.
- **Cards de kit viraram HTML.** No mobile o original entregava os três cards
  como imagens pré-renderizadas (122 KB). Agora são texto de verdade:
  selecionável, pesquisável, acessível e responsivo.
- **Ícones inline.** Sprite SVG no documento, sem Font Awesome e sem
  requisição extra.
- **Sem CLS.** Toda imagem tem `width`/`height` ou `aspect-ratio`; as de baixo
  da dobra usam `loading="lazy"` e `decoding="async"`.
- **Prioridades explícitas.** `preconnect` para GTM, fontes e CDN; `preload`
  com `fetchpriority="high"` na primeira foto do carrossel.
- **Fonte enxuta.** Roboto em quatro pesos com `display=swap`, em vez do CSS
  completo do construtor (132 KB).

## Imagens ainda no CDN

Dez fotos (3 do carrossel, 4 da vitrine, 3 avatares) continuam apontando para
o CDN da GreatPages: a sessão que reconstruiu a página não tinha acesso de
rede a esse host, e o export de "salvar página" não as baixa porque elas são
`background-image` de CSS. Para trazer tudo para o repositório:

```bash
bash scripts/baixar-imagens.sh
```

O script baixa cada foto, reescreve `index.html` para usar os caminhos locais
e remove os `preconnect` que deixam de ser necessários. É idempotente.

## Pontos para o cliente decidir

- **`Coffe Break`** — a mensagem pré-preenchida do WhatsApp tem esse erro de
  digitação no original. Foi mantida como está para não alterar a copy por
  conta própria; corrigir é trocar `Coffe` por `Coffee` em `index.html`.
- **Links quebrados do WhatsApp** — 4 dos 8 links do original terminavam com
  um `)` ou `](https:` colado na URL (sobra de um Markdown copiado), o que
  jogava esses caracteres para dentro da mensagem enviada. Afetava os três
  kits e um dos CTAs gerais. Foram corrigidos na reconstrução.
- **Seção de FAQ** — existe no HTML original, escondida e com texto em *Lorem
  ipsum*. Não foi reconstruída. Se quiser um FAQ de verdade, é escrever as
  perguntas que a reconstrução comporta em accordion.
- **Avatares dos depoimentos** — a associação de cada foto ao nome foi
  deduzida pela posição na página original. Vale conferir depois de rodar o
  script de download.
