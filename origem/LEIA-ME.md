# Material de origem (referência, não é publicado)

Esta pasta guarda a LP original exportada da GreatPages. Nada aqui é servido:
o site publicado é `index.html` + `assets/`.

| Caminho | O que é |
| --- | --- |
| `pagina-salva.html` | HTML da LP original (`lp.panificadoraferreiras.com.br`) |
| `pagina-salva/` | Arquivos que o "salvar página" baixou junto |

Serviu para extrair textos, paleta, geometria das seções e os assets que hoje
vivem em `assets/img/`. Pode apagar a pasta inteira sem afetar o site — o
histórico do Git mantém tudo.

## O que foi aproveitado daqui

- `0_yLIl.svg` → o logo. Era um SVG de 364 KB que apenas embrulhava dois PNGs
  em base64: a arte e uma máscara de luminância. Recompondo os dois virou
  `assets/img/logo.webp` (49 KB) e `assets/img/logo-simbolo.webp`, usado nas
  marcas d'água. O original repetia esse mesmo SVG 8 vezes.
- `24/26/28_yLIl.jpg` → fotos dos três kits, hoje WebP em `assets/img/`.
- `43_yLIl.png` → logo da agência no rodapé (`assets/img/agencia.webp`).
- `22_yLIl.svg` → descartado: eram 28 KB para desenhar um quadrado laranja
  sólido, que agora é uma cor de fundo em CSS.
- `30..34_yLIl.webp` → os cards de kit que a versão mobile entregava como
  imagem pré-renderizada. Serviram de referência de design; na reconstrução
  os cards são HTML de verdade (texto selecionável e acessível).

## O que não veio no export

O "salvar página" só baixa o que está em `<img>`. Dez fotos que a LP aplica
como `background-image` via CSS continuaram apontando para o CDN da
GreatPages: as 3 do carrossel do topo, as 4 da vitrine e os 3 avatares dos
depoimentos. Para trazê-las para o repositório:

```bash
bash scripts/baixar-imagens.sh
```
