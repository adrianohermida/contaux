const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
const cloudflareWorker = require('./services/cloudflareWorker');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de gerenciamento de email (Cloudflare)
app.use('/api/email', emailRoutes);

// Configuração do transportador SMTP
// As credenciais vêm de variáveis de ambiente (delivered via /run/base44/app.env)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const TO_EMAIL = process.env.CONTACT_EMAIL || 'contato@contaux.com.br';
const FROM_EMAIL = process.env.FROM_EMAIL || 'contato@contaux.com.br';

/**
 * Envia email — tenta Cloudflare Worker (MailChannels) primeiro, fallback SMTP.
 */
async function sendMail({ to, subject, text, html, replyTo }) {
  // Tentativa 1: Cloudflare Worker (MailChannels)
  try {
    await cloudflareWorker.sendEmail({
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html,
      replyTo,
    });
    return { method: 'cloudflare-worker' };
  } catch (cfErr) {
    console.warn('Cloudflare Worker falhou, tentando SMTP:', cfErr.message);
  }

  // Tentativa 2: Fallback SMTP (nodemailer)
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_USER || FROM_EMAIL,
    to,
    replyTo,
    subject,
    text,
    html,
  });
  return { method: 'smtp' };
}

// Endpoint do formulário de contato
app.post('/api/contact', async (req, res) => {
  const { name, subject, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios.' });
  }

  try {
    const subjectLine = `[Contato do Site] ${subject || 'Nova mensagem'}`;
    const textBody = `
Nova mensagem recebida pelo site:

Nome: ${name}
Email: ${email}
Telefone: ${phone || 'Não informado'}
Assunto: ${subject || 'Não informado'}

Mensagem:
${message}
    `;
    const htmlBody = `
<h2>Nova mensagem recebida pelo site</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px;">
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nome:</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email:</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Telefone:</td><td style="padding:8px;border:1px solid #ddd;">${phone || 'Não informado'}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Assunto:</td><td style="padding:8px;border:1px solid #ddd;">${subject || 'Não informado'}</td></tr>
</table>
<h3>Mensagem:</h3>
<p style="white-space:pre-wrap;border:1px solid #ddd;padding:15px;border-radius:5px;background:#f9f9f9;">${message}</p>
    `;

    await sendMail({ to: TO_EMAIL, subject: subjectLine, text: textBody, html: htmlBody, replyTo: email });
    return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
    return res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente.' });
  }
});

// Endpoint de newsletter
app.post('/api/newsletter', async (req, res) => {
  const { EMAIL } = req.body;

  if (!EMAIL) {
    return res.status(400).json({ error: 'Email é obrigatório.' });
  }

  try {
    await sendMail({
      to: TO_EMAIL,
      subject: '[Newsletter] Nova inscrição no site',
      text: `Novo inscrito na newsletter: ${EMAIL}`,
      html: `<p>Novo inscrito na newsletter: <strong>${EMAIL}</strong></p>`,
    });

    return res.status(200).json({ success: true, message: 'Inscrição realizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar newsletter:', error.message);
    return res.status(500).json({ error: 'Erro ao registrar inscrição.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    email: {
      cloudflare: {
        configured: !!(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID),
        workerName: cloudflareWorker.WORKER_NAME,
      },
      smtp: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      },
    },
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Contaux API rodando na porta ${PORT}`);
});
