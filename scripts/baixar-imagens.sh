#!/usr/bin/env bash
# =====================================================================
# Baixa para assets/img/ as fotos que ainda apontam para o CDN da
# GreatPages e reescreve index.html para usar os arquivos locais.
#
# Por que existe: a sessao que reconstruiu a pagina nao tinha acesso de
# rede ao CDN, entao essas fotos ficaram referenciadas pela URL de
# origem. Rode uma vez, de uma maquina com internet:
#
#     bash scripts/baixar-imagens.sh
#
# O script e idempotente: rodar de novo nao duplica nada.
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

EDITOR_BASE="https://files.greatpages.com.br/arquivos/paginas_editor"
PAGINA_BASE="https://pages.greatpages.com.br/lp.panificadoraferreiras.com.br/1790001641/imagens"

# "<url>|<arquivo local>"
MAPA=(
  "$EDITOR_BASE/443593-d79efdc69d598c1ccd3d63d0c964d046.jpg|hero-1.jpg"
  "$EDITOR_BASE/443593-83d08ecb7a03ce4104f501046e8d1ed8.jpg|hero-2.jpg"
  "$EDITOR_BASE/443593-2a89559741c95944f57bcbb263d1923d.jpg|hero-3.jpg"
  "$PAGINA_BASE/10.jpg|vitrine-paes.jpg"
  "$PAGINA_BASE/12.jpg|vitrine-salgados.jpg"
  "$PAGINA_BASE/11.jpg|vitrine-bolos.jpg"
  "$PAGINA_BASE/13.jpg|vitrine-detalhes.jpg"
  "$PAGINA_BASE/38.jpeg|depoimento-marcos.jpeg"
  "$PAGINA_BASE/36.jpeg|depoimento-carla.jpeg"
  "$PAGINA_BASE/37.jpeg|depoimento-paulo.jpeg"
)

mkdir -p assets/img
falhas=0

for par in "${MAPA[@]}"; do
  url="${par%%|*}"
  arquivo="${par##*|}"
  destino="assets/img/$arquivo"

  if [ -s "$destino" ]; then
    echo "ja existe  $arquivo"
  else
    printf 'baixando  %s ... ' "$arquivo"
    if curl -fsSL --max-time 60 -o "$destino" "$url"; then
      echo "ok ($(wc -c < "$destino") bytes)"
    else
      echo "FALHOU"
      rm -f "$destino"
      falhas=$((falhas + 1))
      continue
    fi
  fi

  # Troca a URL do CDN pelo caminho local no HTML.
  if grep -q "$url" index.html; then
    # '#' como separador porque a URL tem barras.
    sed -i.bak "s#$url#assets/img/$arquivo#g" index.html && rm -f index.html.bak
    echo "           index.html -> assets/img/$arquivo"
  fi
done

echo
if [ "$falhas" -gt 0 ]; then
  echo "Concluido com $falhas falha(s). As URLs que falharam continuam apontando para o CDN."
  exit 1
fi
# Sem imagens remotas, os preconnect para o CDN so custam handshake.
sed -i.bak '/rel="preconnect" href="https:\/\/files\.greatpages\.com\.br"/d; /rel="preconnect" href="https:\/\/pages\.greatpages\.com\.br"/d' index.html && rm -f index.html.bak
echo "Concluido. Nenhuma imagem depende mais do CDN da GreatPages."
