/**
 * Sistema de templates de email com identidade visual da marca Contaux.
 * Gera HTML branded e responsivo (desktop/tablet/mobile) para todos os emails do app.
 * As cores e nome da marca vêm da tabela settings (singleton).
 */

const { query } = require('../db');

let cachedSettings = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minuto

async function getSettings() {
  if (cachedSettings && Date.now() - cacheTime < CACHE_TTL) return cachedSettings;
  try {
    const result = await query('SELECT name, primary_color FROM settings WHERE id = 1');
    if (result.rows.length > 0) {
      cachedSettings = result.rows[0];
    } else {
      cachedSettings = { name: 'Contaux Contadoria', primary_color: '#3763EB' };
    }
  } catch {
    cachedSettings = { name: 'Contaux Contadoria', primary_color: '#3763EB' };
  }
  cacheTime = Date.now();
  return cachedSettings;
}

/**
 * Wrapper HTML branded — header com logo, corpo, footer.
 * Responsivo via media queries inline (email-safe).
 */
function wrap({ title, preheader, content, settings }) {
  const brand = settings.name || 'Contaux Contadoria';
  const color = settings.primary_color || '#3763EB';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #f0f4ff; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-wrapper { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .email-header { background: ${color}; padding: 28px 32px; text-align: center; }
    .email-header .brand { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .email-body { padding: 32px; color: #1a1a2e; line-height: 1.6; font-size: 15px; }
    .email-body h2 { color: ${color}; font-size: 20px; margin: 0 0 16px; }
    .email-body p { margin: 0 0 14px; }
    .email-footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
    .email-footer p { margin: 0; font-size: 13px; color: #94a3b8; }
    .btn { display: inline-block; padding: 12px 30px; background: ${color}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .info-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
    .info-table td.label { font-weight: 600; background: #f8fafc; width: 120px; }
    .message-box { white-space: pre-wrap; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; background: #f9fafb; font-size: 14px; }
    @media only screen and (max-width: 480px) {
      .email-wrapper { border-radius: 0; }
      .email-header { padding: 20px 16px; }
      .email-body { padding: 20px 16px; font-size: 14px; }
      .info-table td.label { width: 90px; }
      .btn { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
    <tr><td align="center">
      <div class="email-wrapper">
        <div class="email-header">
          <div class="brand">${brand}</div>
        </div>
        <div class="email-body">
          ${content}
        </div>
        <div class="email-footer">
          <p>${brand} &mdash; Contabilidade inteligente</p>
          <p style="margin-top:4px;">contaux.com.br</p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Gera um email branded. Retorna { subject, text, html }.
 * @param {string} templateKey - chave do template
 * @param {object} data - dados para preencher o template
 */
async function render(templateKey, data = {}) {
  const settings = await getSettings();
  const brand = settings.name || 'Contaux Contadoria';

  const templates = {
    contact: {
      subject: `[Contato do Site] ${data.subject || 'Nova mensagem'}`,
      preheader: `Nova mensagem de ${data.name}`,
      content: `
        <h2>Nova mensagem recebida pelo site</h2>
        <table class="info-table">
          <tr><td class="label">Nome</td><td>${data.name}</td></tr>
          <tr><td class="label">Email</td><td>${data.email}</td></tr>
          <tr><td class="label">Telefone</td><td>${data.phone || 'Não informado'}</td></tr>
          <tr><td class="label">Assunto</td><td>${data.subject || 'Não informado'}</td></tr>
        </table>
        <p style="font-weight:600;margin-bottom:8px;">Mensagem:</p>
        <div class="message-box">${data.message}</div>`,
      text: `Nova mensagem recebida pelo site:\n\nNome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone || 'Não informado'}\nAssunto: ${data.subject || 'Não informado'}\n\nMensagem:\n${data.message}`,
    },

    newsletter: {
      subject: '[Newsletter] Nova inscrição no site',
      preheader: 'Novo inscrito na newsletter',
      content: `
        <h2>Novo inscrito na newsletter</h2>
        <p>Um novo visitante se inscreveu na newsletter do site:</p>
        <table class="info-table">
          <tr><td class="label">Email</td><td><strong>${data.email}</strong></td></tr>
        </table>`,
      text: `Novo inscrito na newsletter: ${data.email}`,
    },

    password_reset: {
      subject: 'Redefinição de senha — ' + brand,
      preheader: 'Redefina sua senha de acesso',
      content: `
        <h2>Redefinição de senha</h2>
        <p>Olá ${data.name},</p>
        <p>Você solicitou a redefinição de sua senha de acesso ao sistema.</p>
        <p>Clique no botão abaixo para definir uma nova senha:</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${data.resetUrl}" class="btn">Redefinir senha</a>
        </p>
        <p style="font-size:13px;color:#64748b;">O link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.</p>`,
      text: `Olá ${data.name},\n\nVocê solicitou a redefinição de sua senha.\n\nAcesse o link abaixo para definir uma nova senha:\n${data.resetUrl}\n\nO link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.\n\n${brand}`,
    },

    welcome: {
      subject: 'Bem-vindo(a) à ' + brand + '!',
      preheader: 'Sua conta foi criada com sucesso',
      content: `
        <h2>Bem-vindo(a), ${data.name}!</h2>
        <p>Sua conta na ${brand} foi criada com sucesso.</p>
        <p>Agora você tem acesso ao nosso sistema de gestão contábil, onde pode acompanhar suas obrigações, documentos e comunicações com nosso escritório.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${data.loginUrl || 'https://contaux.com.br/login'}" class="btn">Acessar o sistema</a>
        </p>
        <p style="font-size:13px;color:#64748b;">Se tiver dúvidas, entre em contato pelo email contato@contaux.com.br.</p>`,
      text: `Bem-vindo(a), ${data.name}!\n\nSua conta na ${brand} foi criada com sucesso.\n\nAcesse o sistema em: ${data.loginUrl || 'https://contaux.com.br/login'}\n\nSe tiver dúvidas, entre em contato pelo email contato@contaux.com.br.\n\n${brand}`,
    },

    invitation: {
      subject: 'Convite para acessar o sistema — ' + brand,
      preheader: 'Você foi convidado para acessar o sistema',
      content: `
        <h2>Convite para acesso</h2>
        <p>Olá ${data.name},</p>
        <p>Você foi convidado para acessar o sistema da ${brand} com o perfil de <strong>${data.role || 'usuário'}</strong>.</p>
        <p>Para começar, acesse o sistema e faça login com seu email <strong>${data.email}</strong> e a senha temporária abaixo:</p>
        <p style="text-align:center;margin:16px 0;">
          <span style="display:inline-block;padding:10px 20px;background:#f1f5f9;border-radius:8px;font-family:monospace;font-size:16px;font-weight:600;letter-spacing:1px;">${data.tempPassword || ''}</span>
        </p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${data.loginUrl || 'https://contaux.com.br/login'}" class="btn">Acessar o sistema</a>
        </p>
        <p style="font-size:13px;color:#64748b;">Recomendamos que você altere sua senha após o primeiro acesso.</p>`,
      text: `Olá ${data.name},\n\nVocê foi convidado para acessar o sistema da ${brand} com o perfil de ${data.role || 'usuário'}.\n\nEmail: ${data.email}\nSenha temporária: ${data.tempPassword || ''}\n\nAcesse: ${data.loginUrl || 'https://contaux.com.br/login'}\n\nRecomendamos que você altere sua senha após o primeiro acesso.\n\n${brand}`,
    },

    email_verification: {
      subject: 'Verifique seu email — ' + brand,
      preheader: 'Confirme seu endereço de email',
      content: `
        <h2>Verificação de email</h2>
        <p>Olá ${data.name},</p>
        <p>Use o código abaixo para confirmar seu endereço de email:</p>
        <p style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;padding:12px 28px;background:#f1f5f9;border-radius:8px;font-family:monospace;font-size:24px;font-weight:700;letter-spacing:4px;">${data.code || '000000'}</span>
        </p>
        <p style="font-size:13px;color:#64748b;">Este código expira em 10 minutos. Se você não criou uma conta, ignore este email.</p>`,
      text: `Olá ${data.name},\n\nUse o código abaixo para confirmar seu endereço de email:\n\n${data.code || '000000'}\n\nEste código expira em 10 minutos.\n\nSe você não criou uma conta, ignore este email.\n\n${brand}`,
    },

    access_approved: {
      subject: 'Acesso aprovado — ' + brand,
      preheader: 'Seu acesso ao sistema foi aprovado',
      content: `
        <h2>Acesso aprovado!</h2>
        <p>Olá ${data.name},</p>
        <p>Seu pedido de acesso ao sistema da ${brand} foi aprovado.</p>
        <p>Você já pode fazer login e utilizar o sistema com seu email <strong>${data.email}</strong>.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${data.loginUrl || 'https://contaux.com.br/login'}" class="btn">Acessar o sistema</a>
        </p>`,
      text: `Olá ${data.name},\n\nSeu pedido de acesso ao sistema da ${brand} foi aprovado.\n\nVocê já pode fazer login e utilizar o sistema com seu email ${data.email}.\n\nAcesse: ${data.loginUrl || 'https://contaux.com.br/login'}\n\n${brand}`,
    },
  };

  const tpl = templates[templateKey];
  if (!tpl) throw new Error(`Template de email desconhecido: ${templateKey}`);

  return {
    subject: tpl.subject,
    text: tpl.text,
    html: wrap({ title: tpl.subject, preheader: tpl.preheader, content: tpl.content, settings }),
  };
}

/** Lista todos os templates disponíveis (para o dashboard de emails) */
function listTemplates() {
  return [
    { key: 'contact', name: 'Contato do site', description: 'Notificação interna quando alguém envia o formulário de contato' },
    { key: 'newsletter', name: 'Newsletter', description: 'Notificação interna de nova inscrição na newsletter' },
    { key: 'password_reset', name: 'Redefinição de senha', description: 'Email enviado ao usuário que solicitou reset de senha' },
    { key: 'welcome', name: 'Boas-vindas', description: 'Email de boas-vindas enviado no registro de nova conta' },
    { key: 'invitation', name: 'Convite de usuário', description: 'Email enviado quando um admin convida um novo usuário' },
    { key: 'email_verification', name: 'Verificação de email', description: 'Email com código de verificação de endereço de email' },
    { key: 'access_approved', name: 'Acesso aprovado', description: 'Email enviado quando um pedido de acesso é aprovado' },
  ];
}

/** Dados de exemplo para preview de cada template */
const SAMPLE_DATA = {
  contact: { name: 'João Silva', email: 'joao@exemplo.com', phone: '(92) 99999-9999', subject: 'Dúvida sobre serviços', message: 'Gostaria de saber mais sobre os serviços de contabilidade.' },
  newsletter: { email: 'visitante@exemplo.com' },
  password_reset: { name: 'João Silva', resetUrl: 'https://contaux.com.br/reset-password.html?token=exemplo' },
  welcome: { name: 'João Silva', loginUrl: 'https://contaux.com.br/login' },
  invitation: { name: 'Maria Santos', email: 'maria@exemplo.com', role: 'contador', tempPassword: 'Contaux2024', loginUrl: 'https://contaux.com.br/login' },
  email_verification: { name: 'João Silva', code: '842916' },
  access_approved: { name: 'João Silva', email: 'joao@exemplo.com', loginUrl: 'https://contaux.com.br/login' },
};

module.exports = { render, listTemplates, SAMPLE_DATA, getSettings };
