# Deploy de Produção — Contaux

Guia passo a passo para publicar o app em **contaux.com.br** e **www.contaux.com.br** com HTTPS.

---

## Pré-requisitos

1. **Servidor VPS** (recomendado: 2 vCPU, 2GB RAM, Ubuntu 22.04+) com Docker e Docker Compose instalados
2. **Domínio contaux.com.br** com acesso ao painel de DNS (Cloudflare ou Registro.br)
3. **Acesso SSH** ao servidor

---

## Opção 0 — Cloudflare Pages (recomendado para o frontend)

Deploy do site estático + dashboard via Cloudflare Pages, com API em VPS separada.
O Pages Function em `functions/api/[[path]].js` faz proxy das requisições `/api/*`
para o backend, mantendo tudo no mesmo domínio (sem CORS).

### Arquitetura

```
contaux.com.br (Cloudflare Pages)
├── Site estático (HTML/CSS/JS)      → servido diretamente pela edge
├── /dashboard, /crm, /admin, ...   → SPA React (dashboard compilado)
├── /api/*                          → Pages Function → proxy para VPS
└── functions/api/[[path]].js       → proxy para ${API_URL}/api/*
```

### Passo 1: Deploy do backend (VPS)

Suba o backend em uma VPS (ver Opção A ou B abaixo). O backend roda na porta 80 ou 3001.
Certifique-se de que `https://api.contaux.com.br` (ou o IP da VPS) responde no `/api/health`.

### Passo 2: Deploy do frontend (Cloudflare Pages)

**Opção 2a — GitHub Integration (auto-deploy on push):**

1. Acesse o dashboard do Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Selecione o repositório `contaux` (privado)
3. Configure:
   - **Build command**: `bash scripts/build-pages.sh`
   - **Build output directory**: `dist-pages`
   - **Environment variables**:
     - `API_URL` = `https://api.contaux.com.br` (URL do seu backend)
4. **Save and Deploy**

**Opção 2b — Wrangler CLI (manual):**

```bash
# Instalar wrangler
npm install -g wrangler

# Autenticar
wrangler login

# Criar o projeto (primeira vez)
wrangler pages project create contaux

# Buildar
bash scripts/build-pages.sh

# Deploy
wrangler pages deploy dist-pages --project-name=contaux

# Configurar a variável API_URL (secret)
wrangler pages secret put API_URL --project-name=contaux
# Digite: https://api.contaux.com.br
```

### Passo 3: Configurar domínio personalizado

1. No dashboard do Cloudflare Pages → **contaux** → **Custom domains** → **Set up a custom domain**
2. Adicione `contaux.com.br`
3. Adicione `www.contaux.com.br` (redirecionamento automático)
4. O Cloudflare configura o DNS automaticamente

### Passo 4: GitHub Actions (opcional, CI/CD)

O workflow `.github/workflows/deploy-cloudflare.yml` faz deploy automático em cada push para `github-pages`.
Configure os secrets no GitHub:
- `CLOUDFLARE_API_TOKEN` — token com permissão de Pages
- `CLOUDFLARE_ACCOUNT_ID` — Account ID
- `API_URL` — URL do backend

### Passo 5: Verificar

```bash
curl -s -o /dev/null -w "%{http_code}" https://contaux.com.br/           # → 200
curl -s -o /dev/null -w "%{http_code}" https://contaux.com.br/dashboard  # → 200
curl -s https://contaux.com.br/api/health                                # → {"status":"ok"}
```

---

## Opção A — VPS com Cloudflare Proxy (frontend + backend no mesmo servidor)

A Cloudflare fornece SSL na edge automaticamente. O servidor roda apenas HTTP.

### Passo 1: Configurar DNS na Cloudflare

1. Acesse o painel da Cloudflare → contaux.com.br
2. Adicione registros DNS:
   - `A` → `contaux.com.br` → IP_DO_SERVIDOR (Proxied / nuvem laranja)
   - `A` → `www` → IP_DO_SERVIDOR (Proxied / nuvem laranja)
3. Em **SSL/TLS** → modo **Flexible** (ou **Full** se quiser SSL no servidor também)

### Passo 2: Preparar o servidor

```bash
# Clone o repositório no servidor
git clone <url-do-repo> /opt/contaux
cd /opt/contaux

# Crie o arquivo de variáveis de ambiente
cp .env.prod.example .env.prod
nano .env.prod  # preencha com valores reais

# Suba os serviços
docker compose -f docker-compose.prod.yml up -d --build
```

### Passo 3: Verificar

```bash
curl -I http://localhost:80/         # Site estático → 200
curl -I http://localhost:80/dashboard # Dashboard SPA → 200
curl http://localhost:80/api/health  # API → {"status":"ok"}
```

Acesse `https://contaux.com.br` — a Cloudflare entrega HTTPS automaticamente.

---

## Opção B — SSL direto com Let's Encrypt

Use esta opção se **não** estiver behind Cloudflare, ou se quiser SSL Full (Strict).

### Passo 1: Configurar DNS

Aponte `contaux.com.br` e `www.contaux.com.br` (registro A) diretamente para o IP do servidor.

### Passo 2: Subir o app (HTTP primeiro)

```bash
git clone <url-do-repo> /opt/contaux
cd /opt/contaux
cp .env.prod.example .env.prod
nano .env.prod  # preencha com valores reais

docker compose -f docker-compose.prod.yml up -d --build
```

### Passo 3: Obter certificado SSL

```bash
docker compose -f docker-compose.prod.yml run --rm certbot
```

### Passo 4: Ativar HTTPS

1. Edite `nginx/prod.conf`:
   - Descomente o bloco `server` de HTTPS (porta 443)
   - Descomente a linha `return 301 https://...` no bloco HTTP
2. Reinicie o nginx:

```bash
docker compose -f docker-compose.prod.yml restart web
```

### Passo 5: Renovação automática

Adicione ao crontab:
```bash
0 3 * * * cd /opt/contaux && docker compose -f docker-compose.prod.yml run --rm certbot && docker compose -f docker-compose.prod.yml restart web
```

---

## Estrutura de Produção

```
Dockerfile.prod          # Build multi-stage: compila dashboard + nginx
docker-compose.prod.yml  # Compose de produção (web + api + certbot)
nginx/prod.conf          # nginx config (HTTP + HTTPS)
nginx/prod-routes.conf   # Rotas compartilhadas (SPA + API + estático)
.env.prod                # Variáveis de ambiente (NÃO commitar)
.env.prod.example        # Template das variáveis
```

## Serviços

| Serviço | Porta | Função |
|---------|-------|--------|
| web (nginx) | 80, 443 | Site estático + dashboard SPA + proxy API |
| api (Express) | 3001 (interno) | Formulário de contato, newsletter, inbox, email |
| certbot | — | SSL Let's Encrypt (opcional) |

## Verificação pós-deploy

```bash
# Site estático
curl -s -o /dev/null -w "%{http_code}" https://contaux.com.br/  # → 200

# Dashboard
curl -s -o /dev/null -w "%{http_code}" https://contaux.com.br/dashboard  # → 200

# API
curl -s https://contaux.com.br/api/health  # → {"status":"ok"}

# Redirecionamento www
curl -I https://www.contaux.com.br/  # → 301 para contaux.com.br
```
