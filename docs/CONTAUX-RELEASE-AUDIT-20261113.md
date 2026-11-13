# Auditoria de integração Contaux — 2026-11-13

## Identidade e destino confirmados
Aplicativo Base44 6ac662d96e17daa6cc43b266, repositório adrianohermida/contaux.
A principal corresponde a github-pages, SHA observado 8db04d0e960d26eeb306ee09df5568af6a878004.
Cloudflare Pages: projeto contaux, conta b32bcc487dfca3a70fe57a75fa5ac482, domínios contaux.com.br e www.contaux.com.br.
Produção observada: deployment https://b5f3acac.contaux.pages.dev, mesmo SHA 8db04d0.
Integração automática do Pages desativada. Workflow GitHub existente dispara em push para github-pages; não executar Actions.

## Branches
Há quatro branches Base44 ativas além da principal:
- contaux-audit-plan-2: c799b06609642a516f6edb49969f97cf61e86552 antes desta revisão, 30 commits à frente da principal.
- contaux-audit-plan: b882057d89e3d0329bc099e8aedd4b3790875a34, 7 à frente.
- configure-api-backend: ba2fb9641c242bd3969dfb16707bf56c314def7f, 4 à frente.
- fix-deployment: 15da9f1332799f059e1caccba0c75b0388d5d9f3, 1 à frente.

Na história disponível no sandbox, todas as três últimas são ancestrais de contaux-audit-plan-2 (contagens exclusivas 0/23, 0/26, 0/29). Portanto não há três conjuntos divergentes a combinar. Nenhum ref foi movido ou branch apagada. Revalidar heads remotos antes de integrar.

## Correção desta revisão
O middleware de autenticação não carregava o estado de MFA nem de PIN usado por GET /api/auth/me.
Foi adicionada projeção booleana has_pin e mfa_enabled, e /me passou a consumir has_pin sem carregar/expor o hash.
Nenhum usuário, tenant, papel, senha ou conexão foi alterado.
Checkpoint da correção: 6af71ee06665ef56dfac5431, commit a97cd19e100d3732634658a9f74bad7057327b23.

## Verificação
- Build do dashboard em cópia isolada de c799b06: npm ci --ignore-scripts, npm run build; passou com Vite 5.4.21, 1733 módulos.
- Verificação node --check nos JavaScripts da API: passou.
- node --test api/tests/auth-profile.test.cjs: 4 passaram, 0 falhas. Cobrem combinações PIN/MFA na resposta de /me com dependências simuladas; não comprovam banco ou login real.
- node --check dos dois arquivos alterados: passou.
- Não há scripts de teste/lint/typecheck nos package.json atuais do dashboard/API; os testes antigos encontrados estão no legado.
- git diff --check identificou espaços finais; removido o de authRoutes.js. Duas ocorrências Markdown em PUB-00 são quebras de linha, preservadas.
- Nenhum GitHub Actions executado. Nenhum merge ou deploy realizado.

## Bloqueio externo comprovado
Cloudflare Pages produção usa API_URL=https://api.contaux.com.br.
GET https://contaux.com.br/ retornou 200; /dashboard retornou 308.
GET https://contaux.com.br/api/health retornou 530.
api.contaux.com.br não resolveu no DNS do sandbox (curl código 6).
Leitura autenticada da zona c820588d4d7a5f297e256ebbc0020eb3 confirmou apenas CNAMEs web para contaux.pages.dev, sem A/AAAA/CNAME da API.
A documentação cita uma VPS, mas não identifica um destino operacional. Não apontar DNS para host presumido, sandbox ou banco.

## Pendências
Identificar/recuperar o backend de produção e seu destino autorizado; verificar banco/migrations sem perda de dados. Validar health, autenticação, isolamento e integração antes de publicar a versão final.
A revisão funcional completa dos 30 commits não está concluída; build verde não certifica os fluxos.
Após resolver branches/publicação, investigar os cadastros exatos de Adriano e Camila, autenticação e vínculos de empresa, conforme a ordem solicitada. Esta rodada não consultou nem alterou esses cadastros.
