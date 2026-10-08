#!/usr/bin/env bash
# build-pages.sh — prepara o diretório dist-pages/ para Cloudflare Pages
#
# Estrutura do output:
#   dist-pages/
#   ├── index.html, about-us.html, services.html, ...  (site estático)
#   ├── assets/                                        (CSS/JS/imagens do site)
#   ├── dashboard/                                     (SPA React compilada)
#   │   ├── index.html
#   │   └── assets/
#   ├── _redirects                                     (rotas SPA + proxy API)
#   └── functions/                                     (não copiado — fica no repo)
#
# Uso: bash scripts/build-pages.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$REPO_ROOT/dist-pages"

echo "==> Limpando dist-pages/"
rm -rf "$DIST"
mkdir -p "$DIST"

echo "==> Compilando dashboard (Vite build)"
cd "$REPO_ROOT/dashboard"
npm ci
npm run build

echo "==> Copiando dashboard compilado para dist-pages/dashboard/"
cp -r "$REPO_ROOT/dashboard/dist" "$DIST/dashboard"

echo "==> Copiando site estático (HTML/CSS/JS/imagens)"
cd "$REPO_ROOT"
# Copia todos os arquivos HTML do root
cp "$REPO_ROOT"/*.html "$DIST/"
# Copia diretórios de assets do site
for dir in assets css js img images fonts; do
  if [ -d "$REPO_ROOT/$dir" ]; then
    cp -r "$REPO_ROOT/$dir" "$DIST/"
  fi
done
# Copia CNAME se existir (para domínio personalizado)
if [ -f "$REPO_ROOT/CNAME" ]; then
  cp "$REPO_ROOT/CNAME" "$DIST/"
fi

echo "==> Criando _redirects (rotas SPA + proxy API)"
cat > "$DIST/_redirects" << 'REDIRECTS'
# Dashboard SPA — todas as rotas internas servem o index.html do dashboard
/dashboard       /dashboard/index.html  200
/dashboard/*     /dashboard/index.html  200
/inbox           /dashboard/index.html  200
/inbox/*         /dashboard/index.html  200
/crm             /dashboard/index.html  200
/crm/*           /dashboard/index.html  200
/financeiro      /dashboard/index.html  200
/financeiro/*    /dashboard/index.html  200
/contabilidade   /dashboard/index.html  200
/contabilidade/* /dashboard/index.html  200
/suporte         /dashboard/index.html  200
/suporte/*       /dashboard/index.html  200
/marketing       /dashboard/index.html  200
/marketing/*     /dashboard/index.html  200
/admin           /dashboard/index.html  200
/admin/*         /dashboard/index.html  200
/importar        /dashboard/index.html  200
/importar/*      /dashboard/index.html  200

# Portal do Cliente e Login — também servidos pela SPA
/login           /dashboard/index.html  200
/login/*         /dashboard/index.html  200
/portal          /dashboard/index.html  200
/portal/*        /dashboard/index.html  200
REDIRECTS

echo "==> Removendo arquivos que não devem ir para produção"
rm -rf "$DIST/legacy" "$DIST/docs" "$DIST/.git"

echo "==> Build concluído: dist-pages/"
echo "    Deploy com: wrangler pages deploy dist-pages --project-name=contaux"
