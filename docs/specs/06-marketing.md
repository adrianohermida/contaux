# Spec — Módulo 6: Marketing (Campanhas, Blog, Fidelidade)

## Objetivo
Gestão de campanhas de marketing, blog (CMS), programa de fidelidade e comunicação.

## Páginas
| Rota | Descrição |
|------|-----------|
| `/campanhas` | Campanhas de marketing |
| `/blog-manager` | Gerenciador de blog (CMS) |
| `/fidelidade` | Programas de fidelidade |
| `/comunicacao` | Central de comunicação (newsletter, notificações) |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `CampaignList` | Lista de campanhas com status |
| `CampaignForm` | Criar/editar campanha (canal, público, cronograma) |
| `BlogPostList` | Lista de posts do blog |
| `BlogPostForm` | Editor de post (título, conteúdo, SEO, imagem) |
| `LoyaltyProgramList` | Lista de programas de fidelidade |
| `LoyaltyProgramForm` | Criar/editar programa (regras, pontos, recompensas) |
| `CustomerPointsDashboard` | Pontos por cliente, resgates |
| `NewsletterSender` | Envio de newsletter para lista |

## Entidades
```
Campaign {
  name, channel (email/sms/whatsapp/push), audience,
  status (draft/scheduled/running/completed),
  start_date, end_date, metrics { sent, opened, clicked, converted },
  workspace_id
}

BlogPost {
  title, slug, content, excerpt, featured_image,
  category_id, tags [], author_id, status (draft/published/archived),
  seo { meta_title, meta_description, focus_keyword },
  published_date, views, workspace_id
}

BlogCategory { name, slug, description, workspace_id }
BlogComment { post_id, author, content, approved, created_date }
BlogReaction { post_id, type (like/love/helpful), user_id }

LoyaltyProgram {
  name, description, points_per_real, tier_thresholds [],
  rewards [], active, workspace_id
}

CustomerPoints {
  client_id, program_id, points_balance, tier,
  transactions [], workspace_id
}

RewardRedemption {
  client_id, reward_id, points_cost, status (pending/completed),
  redeemed_date, workspace_id
}
```

## Regras de negócio
1. **Pontos:** 1 ponto a cada R$ 1 em faturas pagas
2. **Tiers:** Bronze, Prata, Ouro, Diamante (configurável)
3. **Blog SEO:** Geração automática de Schema.org e sitemap
4. **Newsletter:** Agendamento e tracking de abertura
5. **Campanha:** Métricas de conversão rastreadas

## Funções backend
| Função | Descrição |
|--------|-----------|
| `executeCampaign` | Executa/envia campanha |
| `sendNewsletterPost` | Envia newsletter |
| `subscribeNewsletter` | Inscrição na newsletter |
| `executePointsTransaction` | Registra transação de pontos |
| `calculateLoyaltyTier` | Calcula tier do cliente |
| `generateBlogImage` | Gera imagem para post (IA) |
| `publishScheduledBlogs` | Publica posts agendados |
| `trackBlogView` | Rastreia visualização |
| `analyzeSEO` | Analisa SEO do post |
| `generateSchemaOrg` | Gera dados estruturados |
| `generateSitemap` | Gera sitemap.xml |

## Referência legada
- `legacy/src/pages/Campaigns.jsx`
- `legacy/src/pages/BlogManager.jsx` (284 linhas)
- `legacy/src/pages/LoyaltyPrograms.jsx`
- `legacy/src/pages/Communication.jsx`
- `legacy/src/components/dashboard/CampaignForm.jsx`
- `legacy/src/components/dashboard/CampaignList.jsx`
- `legacy/src/components/dashboard/LoyaltyProgramForm.jsx`
- `legacy/src/components/dashboard/LoyaltyProgramList.jsx`
- `legacy/src/components/blog/` (subdiretório com 8 componentes)
- `legacy/base44/functions/executeCampaign/entry.ts`
- `legacy/base44/functions/executePointsTransaction/entry.ts`

## Critérios de aceite
- [ ] CRUD de campanhas com métricas
- [ ] CMS de blog com editor, SEO e categorias
- [ ] Comentários e reações no blog
- [ ] CRUD de programas de fidelidade
- [ ] Cálculo automático de pontos e tier
- [ ] Resgate de recompensas
- [ ] Newsletter com agendamento
- [ ] Dark mode + mobile 373px
