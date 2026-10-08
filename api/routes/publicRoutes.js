/**
 * Rotas públicas — leads, newsletter, registro de conta e reset de senha.
 * Acessíveis sem autenticação (site institucional).
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../db');
const { signToken, JWT_SECRET } = require('../middleware/auth');

// ===== LEADS DE PARCEIROS — interesse sem compromisso =====
router.post('/partner-leads', async (req, res) => {
  const { name, email, phone, profile, interest, marketing_opt_in } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  if (!profile || !['autonomo', 'escritorio'].includes(profile)) {
    return res.status(400).json({ error: 'Perfil é obrigatório' });
  }

  const interests = Array.isArray(interest) ? interest : [];
  const validInterests = ['calculos', 'guias', 'contabilidade', 'abertura'];
  const filtered = interests.filter((i) => validInterests.includes(i));

  try {
    await query(
      `INSERT INTO partner_leads (name, email, phone, profile, interest, marketing_opt_in)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name.trim(), email.toLowerCase().trim(), phone || null, profile, filtered, !!marketing_opt_in],
    );
    res.status(201).json({
      success: true,
      message: 'Recebemos seu interesse. Conheça as condições e complete seu cadastro quando quiser.',
    });
  } catch (err) {
    console.error('Erro ao registrar lead de parceiro:', err.message);
    res.status(500).json({ error: 'Erro ao registrar interesse' });
  }
});

// ===== LEADS — captação no site =====
router.post('/leads', async (req, res) => {
  const { name, email, phone, service_interest, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    await query(
      `INSERT INTO leads (name, email, phone, service_interest, message, source)
       VALUES ($1, $2, $3, $4, $5, 'site')`,
      [name, email.toLowerCase(), phone || null, service_interest || null, message || null],
    );
    res.status(201).json({ success: true, message: 'Lead registrado com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar lead:', err.message);
    res.status(500).json({ error: 'Erro ao registrar lead' });
  }
});

// ===== NEWSLETTER — subscribe com persistência =====
router.post('/newsletter', async (req, res) => {
  const { email, name } = req.body;
  const EMAIL = (email || '').toLowerCase().trim();
  if (!EMAIL) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    await query(
      `INSERT INTO newsletter_subscribers (email, name, source)
       VALUES ($1, $2, 'site')
       ON CONFLICT (email) DO UPDATE SET active = true`,
      [EMAIL, name || null],
    );
    res.json({ success: true, message: 'Inscrição realizada com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar newsletter:', err.message);
    res.status(500).json({ error: 'Erro ao registrar inscrição' });
  }
});

// ===== REGISTRO DE NOVA CONTA (cliente) =====
router.post('/register', async (req, res) => {
  const { name, email, password, phone, company_name, document } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }

  try {
    // Verifica email duplicado
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Busca tenant raiz Contaux (office)
    const contaux = await query("SELECT id FROM tenants WHERE name = 'Contaux Contadoria' LIMIT 1");
    const parentTenantId = contaux.rows[0]?.id || null;

    // Cria tenant cliente vinculado à Contaux
    const tenantResult = await query(
      `INSERT INTO tenants (name, type, parent_id, document, contact_email, contact_phone)
       VALUES ($1, 'client', $2, $3, $4, $5) RETURNING id`,
      [company_name || name, parentTenantId, document || null, email.toLowerCase(), phone || null],
    );
    const tenantId = tenantResult.rows[0].id;

    // Cria usuário cliente
    const hash = await bcrypt.hash(password, 10);
    const userResult = await query(
      `INSERT INTO users (name, email, role, password_hash, tenant_id, active)
       VALUES ($1, $2, 'client', $3, $4, true) RETURNING id, name, email, role, tenant_id`,
      [name, email.toLowerCase(), hash, tenantId],
    );

    const user = userResult.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id, name: user.name });

    // Envia email de boas-vindas branded — não bloqueia o registro se falhar
    const { sendMail, emailTemplates } = req.app.locals;
    if (sendMail && emailTemplates) {
      try {
        const tpl = await emailTemplates.render('welcome', {
          name: user.name,
          loginUrl: `${process.env.SITE_URL || 'https://contaux.com.br'}/login`,
        });
        await sendMail({
          to: email.toLowerCase(),
          subject: tpl.subject,
          text: tpl.text,
          html: tpl.html,
        });
      } catch (mailErr) {
        console.warn('Aviso: email de boas-vindas não enviado:', mailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      token,
      user: { id: String(user.id), name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id },
    });
  } catch (err) {
    console.error('Erro ao registrar conta:', err.message);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// ===== ESQUECI MINHA SENHA =====
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    const result = await query('SELECT id, name FROM users WHERE email = $1 AND active = true', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      // Não revela se o email existe ou não
      return res.json({ success: true, message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, user.id],
    );

    // Envia email branded com link de reset — não bloqueia se falhar
    const resetUrl = `${process.env.SITE_URL || 'https://contaux.com.br'}/reset-password.html?token=${token}`;
    const { sendMail, emailTemplates } = req.app.locals;
    if (sendMail && emailTemplates) {
      try {
        const tpl = await emailTemplates.render('password_reset', { name: user.name, resetUrl });
        await sendMail({
          to: email.toLowerCase(),
          subject: tpl.subject,
          text: tpl.text,
          html: tpl.html,
        });
      } catch (mailErr) {
        console.warn('Aviso: email de reset não enviado:', mailErr.message);
      }
    }

    res.json({ success: true, message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' });
  } catch (err) {
    console.error('Erro ao solicitar reset:', err.message);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// ===== REDEFINIR SENHA =====
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }

  try {
    const result = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > now() AND active = true',
      [token],
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(password, 10);
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hash, result.rows[0].id],
    );

    res.json({ success: true, message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err.message);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// ===== CHAT PÚBLICO — assistente de atendimento do site (CQ-04) =====
// Suporta conversas persistentes com visitor_token e handoff IA→humano.

const QUICK = [
  {
    match: /servi[çc]o|oferec|fazem|trabalham/,
    answer: 'A Contaux oferece:<br>• Contabilidade para advogados<br>• Cálculos judiciais<br>• Guias e planos de pagamento<br>• Pareceres contábeis<br><br>Veja detalhes em <a href="/services.html">nossos serviços</a>.',
  },
  {
    match: /atendimento|suporte|falar|contato|whatsapp|telefone|email/,
    answer: 'Oferecemos atendimento por chat, e-mail, telefone e videoconferência.<br><br>Acesse nossa <a href="/contato.html">página de contato</a> para falar com nossa equipe.',
  },
  {
    match: /parceiro|parceria|indic|indicar|comiss/,
    answer: 'Temos um programa de parceria para escritórios e profissionais que indicam clientes.<br><br>Conheça as condições em <a href="/parceiros.html">nossa página de parceiros</a>.',
  },
  {
    match: /pre[çc]o|valor|custo|quanto|plan|mensal/,
    answer: 'Nossos planos variam conforme o porte do escritório e os serviços contratados.<br><br>Confira os planos em <a href="/pricing.html">nossa página de preços</a>.',
  },
  {
    match: /contador|falar com|especialista|consult|humano|pessoa|atendente/,
    answer: 'Para falar diretamente com um contador, acesse nossa <a href="/contato.html">página de contato</a> e escolha o canal de sua preferência. Respondemos em até 1 dia útil.',
    collectContact: true,
    wantsHuman: true,
  },
];

// Criar ou recuperar conversa pública por visitor_token
async function getOrCreatePublicConversation(visitorToken, visitorName) {
  if (visitorToken) {
    const existing = await query(
      `SELECT id, status, visitor_token FROM assistant_conversations WHERE visitor_token = $1`,
      [visitorToken],
    );
    if (existing.rows.length > 0) return existing.rows[0];
  }

  const token = crypto.randomBytes(16).toString('hex');
  const result = await query(
    `INSERT INTO assistant_conversations (title, origin, visitor_token, visitor_name, status)
     VALUES ($1, 'public', $2, $3, 'active')
     RETURNING id, status, visitor_token`,
    [`Atendimento público${visitorName ? ' — ' + visitorName : ''}`, token, visitorName || null],
  );

  await query(
    `INSERT INTO assistant_participants (conversation_id, role, display_name)
     VALUES ($1, 'visitor', $2)`,
    [result.rows[0].id, visitorName || 'Visitante'],
  );

  return result.rows[0];
}

// POST /chat — enviar mensagem (com persistência e handoff)
router.post('/chat', async (req, res) => {
  const { message, visitor_token, visitor_name } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Mensagem é obrigatória' });
  }

  try {
    const conv = await getOrCreatePublicConversation(visitor_token, visitor_name);
    const convId = conv.id;

    // Salva mensagem do visitante
    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, author_name)
       VALUES ($1, 'user', $2, $3)`,
      [convId, message.trim(), visitor_name || 'Visitante'],
    );
    await query(`UPDATE assistant_conversations SET updated_at = now() WHERE id = $1`, [convId]);

    // Se a conversa está com humano ou aguardando, IA pausada
    if (conv.status === 'waiting_human' || conv.status === 'with_human') {
      return res.json({
        answer: conv.status === 'waiting_human'
          ? 'Sua mensagem foi enviada. Aguarde um atendente.'
          : 'Mensagem enviada para o atendente.',
        visitor_token: conv.visitor_token,
        conversation_id: String(convId),
        status: conv.status,
        ai_paused: true,
      });
    }

    // Detecta pedido de atendimento humano
    const msg = message.trim().toLowerCase();
    for (const q of QUICK) {
      if (q.match && q.match.test(msg) && q.wantsHuman) {
        await query(
          `UPDATE assistant_conversations SET status = 'waiting_human', handoff_reason = $2, updated_at = now()
           WHERE id = $1`,
          [convId, 'Visitante solicitou atendimento humano'],
        );
        await query(
          `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
           VALUES ($1, 'system', $2, 'handoff_requested', $3)`,
          [convId, 'Transferindo para atendimento humano...', visitor_name || 'Visitante'],
        );
        return res.json({
          answer: 'Estou transferindo você para um atendente. Aguarde um momento...',
          visitor_token: conv.visitor_token,
          conversation_id: String(convId),
          status: 'waiting_human',
          ai_paused: true,
        });
      }
    }

    // Respostas rápidas (sem custo de IA)
    for (const q of QUICK) {
      if (q.match && q.match.test(msg)) {
        await query(
          `INSERT INTO assistant_messages (conversation_id, role, text, author_name)
           VALUES ($1, 'assistant', $2, 'Assistente')`,
          [convId, q.answer.replace(/<br>/g, '\n')],
        );
        return res.json({
          answer: q.answer,
          collectContact: !!q.collectContact,
          visitor_token: conv.visitor_token,
          conversation_id: String(convId),
          status: 'active',
        });
      }
    }

    // Busca na base de conhecimento (itens públicos, sem auth)
    try {
      const aiService = require('../services/aiService');
      const result = await aiService.ask(message.trim(), { tenantIds: null });
      if (result.sources && result.sources.length > 0) {
        const answer = result.answer.replace(/\n/g, '<br>');
        await query(
          `INSERT INTO assistant_messages (conversation_id, role, text, sources, author_name)
           VALUES ($1, 'assistant', $2, $3, 'Assistente')`,
          [convId, result.answer, JSON.stringify(result.sources)],
        );
        return res.json({
          answer,
          collectContact: false,
          visitor_token: conv.visitor_token,
          conversation_id: String(convId),
          status: 'active',
        });
      }
    } catch (e) {
      // Ignora erro — cai no fallback
    }

    // Fallback genérico
    const fallback = 'Não tenho essa informação no momento, mas nossa equipe pode ajudar!<br><br>Acesse nossa <a href="/contato.html">página de contato</a> e fale com um especialista.';
    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, author_name)
       VALUES ($1, 'assistant', $2, 'Assistente')`,
      [convId, fallback.replace(/<br>/g, '\n')],
    );
    res.json({
      answer: fallback,
      collectContact: true,
      visitor_token: conv.visitor_token,
      conversation_id: String(convId),
      status: 'active',
    });
  } catch (err) {
    console.error('Erro no chat público:', err.message);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// GET /chat/status — verificar status da conversa (polling do widget)
router.get('/chat/status', async (req, res) => {
  const { visitor_token, since } = req.query;
  if (!visitor_token) return res.status(400).json({ error: 'visitor_token é obrigatório' });

  try {
    const conv = await query(
      `SELECT id, status FROM assistant_conversations WHERE visitor_token = $1`,
      [visitor_token],
    );
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });

    const convId = conv.rows[0].id;
    const sinceDate = since ? new Date(parseInt(since)) : new Date(0);

    // Busca mensagens novas (do staff/sistema) desde o último poll
    const msgs = await query(
      `SELECT id, role, text, author_name, event_type, created_at
       FROM assistant_messages
       WHERE conversation_id = $1 AND created_at > $2
         AND (role = 'assistant' OR role = 'system' OR (role = 'user' AND author_name IS NOT NULL AND author_name != 'Visitante' AND author_name != $3))
       ORDER BY created_at ASC`,
      [convId, sinceDate, req.query.visitor_name || 'Visitante'],
    );

    res.json({
      status: conv.rows[0].status,
      messages: msgs.rows.map((m) => ({
        id: String(m.id),
        role: m.role,
        text: m.text,
        author_name: m.author_name,
        event_type: m.event_type,
        created_at: m.created_at,
      })),
    });
  } catch (err) {
    console.error('Erro ao buscar status do chat:', err.message);
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

// POST /chat/handoff — visitante solicita handoff explicitamente
router.post('/chat/handoff', async (req, res) => {
  const { visitor_token, reason } = req.body;
  if (!visitor_token) return res.status(400).json({ error: 'visitor_token é obrigatório' });

  try {
    const conv = await query(
      `SELECT id, status FROM assistant_conversations WHERE visitor_token = $1`,
      [visitor_token],
    );
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversa não encontrada' });
    if (conv.rows[0].status !== 'active') {
      return res.json({ status: conv.rows[0].status, ai_paused: true });
    }

    await query(
      `UPDATE assistant_conversations SET status = 'waiting_human', handoff_reason = $2, updated_at = now()
       WHERE id = $1`,
      [conv.rows[0].id, reason || 'Visitante solicitou atendimento humano'],
    );
    await query(
      `INSERT INTO assistant_messages (conversation_id, role, text, event_type, author_name)
       VALUES ($1, 'system', $2, 'handoff_requested', 'Visitante')`,
      [conv.rows[0].id, 'Transferindo para atendimento humano...'],
    );

    res.json({ success: true, status: 'waiting_human', ai_paused: true });
  } catch (err) {
    console.error('Erro ao solicitar handoff público:', err.message);
    res.status(500).json({ error: 'Erro ao solicitar handoff' });
  }
});

module.exports = router;
