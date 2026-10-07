# Deploy de Produção — Contaux

Guia passo a passo para publicar o app em **contaux.com.br** e **www.contaux.com.br** com HTTPS.

---

## Pré-requisitos

1. **Servidor VPS** (recomendado: 2 vCPU, 2GB RAM, Ubuntu 22.04+) com Docker e Docker Compose instalados
2. **Domínio contaux.com.br** com acesso ao painel de DNS (Cloudflare ou Registro.br)
3. **Acesso SSH** ao servidor

---

## Opção A — Behind Cloudflare (mais simples, recomendado)

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
