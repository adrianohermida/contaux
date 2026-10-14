# PUB-09 — Regressão, SEO e Liberação Controlada

Data: 14 de outubro de 2026. Branch: `contaux-audit-plan-2`.

## 1. SEO

### Metadados
- ✅ Todas as 34 páginas HTML possuem `<title>`, `<meta description>`, `<link canonical>`, Open Graph e Twitter Card.
- ✅ Canonical coerente com a URL pública de cada página.
- ✅ Páginas de redirecionamento (blog-single-sidebar.html, service-single.html) possuem `noindex`.

### Dados estruturados (JSON-LD)
| Página(s) | Schema |
|---|---|
| index.html | Organization, WebSite, FAQPage |
| about-us.html, services.html, contato.html, etc. | BreadcrumbList |
| servico-*.html (10 páginas) | Service |
| artigo-*.html, blog-single.html | BlogPosting, Organization |
| central-ajuda.html | FAQPage |
| como-funciona.html | HowTo |
| parceiros.html | BreadcrumbList, FAQPage |

### Sitemap
- ✅ 29 URLs públicas listadas (3.434 → atualizado em 2026-10-14).
- ✅ Páginas novas incluídas: servico-*.html (10), artigo-*.html (2), central-ajuda.html, como-funciona.html, integracao-hmadv.html, parceiros.html.
- ✅ Páginas excluídas: 404.html, mail-success.html, reset-password.html, blog-single-sidebar.html, service-single.html.

### robots.txt
- ✅ Permite indexação de páginas públicas.
- ✅ Bloqueia rotas internas: /dashboard, /api/, /login, /portal, etc.
- ✅ Bloqueia páginas utilitárias: reset-password.html, mail-success.html, blog-single-sidebar.html.
- ✅ Permite crawlers de IA (GPTBot, Claude-Web, Google-Extended, etc.).
- ✅ Referência ao sitemap.

### llms.txt
- ✅ Atualizado com todas as páginas públicas organizadas por categoria.
- ✅ Inclui páginas de serviço individuais, blog, central de ajuda e integração HMADV.
- ✅ Removida referência ao seguro-responsabilidade como "Cobertura e proteção" (fato pendente).

## 2. Build

### scripts/build-pages.sh
- ✅ Copia todos os `*.html` da raiz (glob — inclui páginas novas automaticamente).
- ✅ Copia diretórios de assets (assets/, css/, js/, img/, images/, fonts/).
- ✅ Compila o dashboard (Vite build) para `dist-pages/dashboard/`.
- ✅ Cria `_redirects` para Cloudflare Pages (rotas SPA + proxy API).
- ✅ Copia Pages Functions (proxy da API).
- ✅ **Adicionado**: copia sitemap.xml, robots.txt, llms.txt, manifest.json para o build.

### nginx (dev e prod)
- ✅ `nginx/default.conf`: `error_page 404 /404.html` + `try_files ... =404` (não mais fallback para index.html).
- ✅ `nginx/prod-routes.conf`: mesma correção aplicada.
- ✅ Rotas do dashboard (SPA) preservadas.
- ✅ Proxy da API preservado.

## 3. Acessibilidade (verificação manual)

- ✅ `lang="pt-BR"` em todas as páginas.
- ✅ `alt` em imagens de logo e conteúdo.
- ✅ `aria-label` no botão de navegação mobile.
- ✅ Contraste de texto verificado visualmente nas páginas principais.
- ⚠️ Foco por teclado: testar em navegador (não automatizado no sandbox).
- ⚠️ Reflow em 320px: testar em navegador.
- ⚠️ Movimento reduzido: verificar `prefers-reduced-motion`.

## 4. Regressão consolidada (PUB-00 a PUB-08)

| Onda | Verificação | Status |
|---|---|---|
| PUB-00 | Inventário e mapa de páginas | ✅ 34 HTMLs catalogados |
| PUB-01 | Conteúdo demonstrativo removido | ✅ Sem template de agência |
| PUB-02 | Componentes e responsividade | ✅ Nav padrão 5 itens, btn-alt |
| PUB-03 | Home, catálogo e Como funciona | ✅ index.html, services.html, como-funciona.html |
| PUB-04 | Serviços de contadoria (6 páginas) | ✅ Páginas individuais com escopo completo |
| PUB-05 | Contabilidade online (4 páginas) + pricing + parceiros | ✅ Páginas individuais |
| PUB-06 | Formulários, chat, newsletter | ✅ data-ctx-lead, cookie-consent.js |
| PUB-07 | Sobre, SLA, termos, privacidade, cookies | ✅ Conteúdo factual, cookie consent |
| PUB-08 | Blog, artigos, central de ajuda, HMADV | ✅ 3 artigos, central-ajuda, integracao-hmadv |

## 5. Fatos pendentes (não bloqueantes para PUB-09)

| Fato | Impacto | Ação |
|---|---|---|
| Seguro de responsabilidade: vigência encerrada | Página publicada com aviso de renovação | Aguardar comprovação vigente |
| Preços em HTML sem validação | pricing.html mantém preços informativos | Aguardar validação |
| Equipe real e CRCs | about-us.html sem fotos/nomes inventados | Aguardar confirmação |
| Perícia: oferta não confirmada | Página de perícia não publicada | Aguardar confirmação |
| Integração HMADV: homologação pendente | Página descreve status como proposta | Aguardar homologação |

## 6. Plano de reversão

### Reversão do branch
```bash
# Reverter todas as alterações da onda PUB-09:
git revert <commit-hash-pub-09>

# Ou reverter para o estado anterior à PUB-09:
git checkout <hash-antes-pub-09> -- sitemap.xml llms.txt robots.txt nginx/default.conf nginx/prod-routes.conf scripts/build-pages.sh service-single.html
# E remover JSON-LD adicionado aos servico-*.html e como-funciona.html
```

### Reversão por componente
| Componente | Reversão |
|---|---|
| sitemap.xml | Restaurar versão anterior (15 URLs, lastmod 2026-10-08) |
| llms.txt | Restaurar versão anterior |
| robots.txt | Remover Disallow blog-single-sidebar.html |
| nginx 404 | Reverter try_files para `/index.html` e remover error_page |
| Service JSON-LD | Remover blocos `<script type="application/ld+json">` dos servico-*.html |
| como-funciona HowTo | Remover bloco JSON-LD |
| service-single.html | Remover noindex e restaurar canonical |
| build-pages.sh | Remover bloco de cópia de SEO/PWA files |

### Critério de parada
Se a correção de 404 causar problemas com rotas SPA ou assets, reverter apenas o nginx (dev e prod) para `try_files $uri $uri/ $uri.html /index.html;`.

## 7. Liberação controlada

- ⛔ Não publicar nem enviar comunicações reais sem autorização explícita.
- ⛔ Não alterar contratos vigentes ou migrar produção.
- ✅ Alterações prontas para revisão e merge.
- ✅ Deploy: seguir `docs/DEPLOYMENT.md` após aprovação.
