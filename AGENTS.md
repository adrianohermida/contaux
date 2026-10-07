# AGENTS.md

## Project Overview
Static HTML website ("contaux") — multi-page marketing site for a Brazilian company. No build step, no backend, no package manager. Pure HTML/CSS/JS with assets.

## Setup
- Served via `docker-compose.base44.yml` using `nginx:alpine`, bind-mounting the repo root at `/usr/share/nginx/html:ro`.
- Web entry point is on host port 3000.
- No external credentials or secrets required.
- Directory permissions: the repo root must be world-readable (`chmod 755 .`) or nginx's worker user returns 403.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` should return 200.
- Edits to HTML/CSS/JS files appear immediately (nginx serves from the bind mount; no rebuild needed, but call `reload_preview` for the browser to pick up changes).
