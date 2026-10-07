# AGENTS.md

## Project Overview
Static HTML marketing site ("Contaux Contadoria") + React dashboard app. The static site is the public face; the dashboard is the internal management tool.

## Architecture
- **Static site**: Pure HTML/CSS/JS served by nginx (index.html, about-us.html, services.html, etc.)
- **Dashboard app**: React 18 + Vite + Tailwind CSS in `dashboard/` directory, served by Vite dev server on port 5173 (internal)
- **nginx** (port 3000) proxies `/dashboard`, `/crm`, `/financeiro`, `/contabilidade`, `/suporte`, `/marketing`, `/admin` and Vite module paths (`/src/`, `/@vite/`, `/node_modules/`) to the Vite dev server. All other routes serve static files.

## Setup
- `docker compose -f docker-compose.base44.yml up -d` starts both nginx (port 3000) and the Vite dev server (port 5173 internal).
- The Vite container installs npm deps on startup from `dashboard/package.json` (volume `dashboard_node_modules` keeps them).
- No external credentials or secrets required.
- Directory permissions: the repo root must be world-readable (`chmod 755 .`) or nginx's worker user returns 403.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200 (static site)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/inicio` → 200 (PT-BR home route)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard` → 200 (Vite SPA)
- Edits to static HTML/CSS/JS appear immediately (nginx serves from bind mount).
- Edits to dashboard React files appear via Vite HMR (or call `reload_preview` if HMR doesn't fire through the proxy).

## Dashboard App Structure
```
dashboard/
├── src/
│   ├── main.jsx              # Entry point (BrowserRouter + App)
│   ├── App.jsx               # Routes with lazy loading
│   ├── index.css             # Tailwind + CSS variables (light/dark theme)
│   ├── lib/utils.js          # cn() helper
│   ├── components/
│   │   ├── ui/               # Card, Button, Badge (shadcn-style)
│   │   └── layout/           # AppLayout, Sidebar, Header, navItems
│   └── modules/
│       └── dashboard/        # DashboardPage, Stats, Activity, Alerts, Shortcuts
├── tailwind.config.js
├── vite.config.js
└── package.json
```

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
