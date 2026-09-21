# Panificadora Ferreira's — Landing Page

Reconstrucao da LP `lp.panificadoraferreiras.com.br` com melhorias de
performance, animacoes de entrada, um elemento interativo e Google Tag Manager.

## Status

| Item | Situacao |
| --- | --- |
| Google Tag Manager (`GTM-WBXM8Q9J`) | Instalado |
| Base de performance | Instalada |
| Motor de animacoes de entrada | Instalado |
| Reconstrucao fiel do conteudo | **Pendente — origem inacessivel** |
| Elemento interativo | Pendente (depende do conteudo) |

### Por que o conteudo esta pendente

O host `lp.panificadoraferreiras.com.br` esta bloqueado pela politica de
egresso de rede desta sessao (403 no proxy, tanto via `curl` quanto via busca
web). O dominio raiz tambem nao responde. Sem acesso ao HTML original, nao e
possivel reconstruir as secoes com fidelidade — qualquer conteudo inventado
seria uma copia falsa, nao uma reconstrucao.

Para destravar, qualquer uma destas opcoes serve:

1. Liberar o host nas configuracoes de egresso de rede do ambiente; ou
2. Enviar o HTML exportado da pagina (e os assets); ou
3. Enviar capturas de tela da pagina inteira + os textos.

## GTM

O snippet principal e a primeira coisa dentro de `<head>`; o `<noscript>` e a
primeira coisa dentro de `<body>`, conforme a documentacao do GTM.

## Animacoes

Marque qualquer elemento com `data-reveal` para que ele entre com fade + slide
quando aparecer na viewport:

```html
<section data-reveal>...</section>
<div data-reveal="esquerda">...</div>
<img data-reveal="zoom" src="..." alt="...">
```

Para cascata entre irmaos, envolva-os com `data-reveal-grupo` (valor opcional =
passo em ms, padrao 90):

```html
<ul data-reveal-grupo="120">
  <li data-reveal>...</li>
  <li data-reveal>...</li>
</ul>
```

O motor usa um unico `IntersectionObserver`, desobserva cada elemento apos a
entrada e respeita `prefers-reduced-motion`. Sem JavaScript ou sem suporte ao
observer, todo o conteudo aparece normalmente.

## Estrutura

```
index.html
assets/
  css/styles.css
  js/main.js
  img/
```

Site estatico, sem build e sem dependencias externas — basta servir a pasta.
