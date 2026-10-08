# AGENTS.md

## Project Overview
Static HTML marketing site ("Contaux Contadoria") + React dashboard app. The static site is the public face; the dashboard is the internal management tool.

## Architecture
- **Static site**: Pure HTML/CSS/JS served by nginx (index.html, about-us.html, services.html, etc.)
- **Dashboard app**: React 18 + Vite + Tailwind CSS in `dashboard/` directory, served by Vite dev server on port 5173 (internal)
- **API backend**: Express + Nodemailer in `api/` directory, port 3001 (internal). Handles contact form, newsletter, email inbox CRUD, and Cloudflare Worker deployment.
- **nginx** (port 3000) proxies `/dashboard`, `/inbox`, `/crm`, `/financeiro`, `/contabilidade`, `/suporte`, `/marketing`, `/admin`, `/api/` and Vite module paths (`/src/`, `/@vite/`, `/node_modules/`) to the appropriate service. All other routes serve static files.

## Setup
- `docker compose -f docker-compose.base44.yml up -d` starts nginx (port 3000), Vite dev server (port 5173 internal), and Express API (port 3001 internal).
- The Vite container installs npm deps on startup from `dashboard/package.json` (volume `dashboard_node_modules` keeps them).
- The API container installs npm deps on startup from `api/package.json` (volume `api_node_modules` keeps them).
- External secrets (Cloudflare tokens, SMTP credentials) are delivered via `/run/base44/app.env`.
- Directory permissions: the repo root must be world-readable (`chmod 755 .`) or nginx's worker user returns 403.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200 (static site)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard` → 200 (Vite SPA)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health` → 200 (API health)
- Edits to static HTML/CSS/JS appear immediately (nginx serves from bind mount).
- Edits to dashboard React files appear via Vite HMR (or call `reload_preview` if HMR doesn't fire through the proxy).

## Dashboard App Structure
```
dashboard/src/
├── main.jsx              # Entry point (BrowserRouter + App)
├── App.jsx               # Routes with lazy loading
├── index.css             # Tailwind + CSS variables (light/dark theme)
├── lib/utils.js          # cn() helper
├── components/
│   ├── ui/               # Card, Button, Badge, Input, Select, Tabs, Dialog
│   └── layout/           # AppLayout, Sidebar, Header, navItems
└── modules/
    ├── dashboard/        # DashboardPage, Stats, Activity, Alerts, Shortcuts
    ├── email/            # InboxPage, EmailList, EmailDetail, ComposeForm
    ├── crm/              # CrmPage, ClientList/Form/Detail, ContactsPage
    ├── financeiro/       # FinanceiroPage, InvoiceList/Form, QuoteList/Form, PaymentList/Form
    ├── contabilidade/    # ContabilidadePage, AccountList/Form, JournalList/Form, TaxInvoiceList/Form, CalendarPage
    ├── suporte/          # SuportePage, TicketList/Form/Detail, ProcessList/Form
    ├── marketing/        # MarketingPage, CampaignList/Form, BlogPostList/Form, FidelidadePage
    └── admin/            # AdminPage, ConfiguracoesPage, SegurancaPage, AuditoriaPage, AutomacoesPage, DocumentosPage, RelatoriosPage
```

## API Structure
```
api/
├── server.js                    # Express server (port 3001)
├── routes/
│   ├── emailRoutes.js           # Cloudflare Email Routing + Workers management
│   └── inboxRoutes.js           # Inbox CRUD + webhook + send
└── services/
    ├── cloudflareRouting.js     # Email Routing API (zones, rules, destinations)
    ├── cloudflareWorker.js      # Legacy sender Worker (MailChannels)
    └── emailWorkers.js          # email-router (inbound) + email-forwarder (outbound)
```

## Cloudflare Email Workers
- **email-router**: Worker with `email` handler — receives inbound emails from Cloudflare Email Routing, extracts sender/subject/body, POSTs to `/api/inbox/webhook`.
- **email-forwarder**: Worker with `fetch` handler — sends outbound emails via MailChannels API.
- Deploy both via `POST /api/email/workers/deploy` (requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).

## Production Deployment
- **Files**: `Dockerfile.prod`, `docker-compose.prod.yml`, `nginx/prod.conf`, `nginx/prod-routes.conf`, `.env.prod.example`, `docs/DEPLOYMENT.md`
- **Build**: Multi-stage Dockerfile compiles the dashboard (`npm run build` with `base: '/dashboard/'`) and serves everything via nginx
- **SSL**: Two options — Cloudflare proxy (SSL na edge, servidor HTTP only) or Let's Encrypt direct (certbot)
- **Domains**: contaux.com.br (primary), www.contaux.com.br (redirects to non-www)
- **Deploy**: `docker compose -f docker-compose.prod.yml up -d --build` on a VPS with DNS pointing to it
- See `docs/DEPLOYMENT.md` for the full step-by-step guide

## Legacy Reference
- `legacy/` contains the old React/Base44 app — reference for business rules and data models ONLY. Never import from it.
- `docs/RECOVERY_PLAN.md` has the full modular migration plan.
- `docs/specs/` has per-module specifications.

## Rules
- Max 200 lines per component.
- Portuguese (BR) in all UI text and comments.
- Dark mode via `class="dark"` on `<html>`.
- Mobile-first (373px) and desktop (1880px) responsive.
- No imports from `legacy/` into the new dashboard app.
- No unnecessary animations — keep UI clean and functional.

## Branding & Theme System
- A cor primária da marca é persistida na tabela `settings` (singleton, id=1) no PostgreSQL.
- Endpoint: `GET /api/settings` (ler) e `PUT /api/settings` (salvar).
- O hook `useTheme` (`dashboard/src/hooks/useTheme.js`) carrega do backend, cacheia em `localStorage` (`contaux-settings`) e aplica via `applyBrandTheme()`.
- `dashboard/src/lib/theme.js` converte hex → HSL e expande a cadência de cores: primary, ring, accent, sidebar-* (10 vars para light + 10 para dark) a partir de uma única cor primária.
- `main.jsx` aplica o tema imediatamente na inicialização (lê do localStorage) para evitar flash.
- A cor padrão da marca Contaux é `#3763EB` (azul, HSL 225 82% 57%).
- As CSS vars base em `index.css` também usam essa cor como padrão.

## Cloudflare Pages Deployment
- `wrangler.toml` — configuração do projeto Pages.
- `scripts/build-pages.sh` — compila o dashboard e monta `dist-pages/` (site estático + SPA + `_redirects`).
- `functions/api/[[path]].js` — Pages Function que faz proxy de `/api/*` para o backend (VPS) via env `API_URL`.
- `.github/workflows/deploy-cloudflare.yml` — GitHub Actions para deploy automático.
- Ver `docs/DEPLOYMENT.md` → "Opção 0 — Cloudflare Pages" para o passo a passo completo.
