/**
 * Serviço de envio de emails — Cloudflare Worker (MailChannels) com fallback SMTP
 */
const nodemailer = require('nodemailer');
const cloudflareWorker = require('./cloudflareWorker');

const FROM_EMAIL = process.env.FROM_EMAIL || 'contato@contaux.com.br';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Envia email — tenta Cloudflare Worker primeiro, fallback SMTP.
 * @returns {{ method: string }}
 */
async function sendMail({ to, from, subject, text, html, replyTo }) {
  // Tentativa 1: Cloudflare Worker (MailChannels)
  try {
    await cloudflareWorker.sendEmail({
      to,
      from: from || FROM_EMAIL,
      subject,
      text,
      html,
      replyTo,
    });
    return { method: 'cloudflare-worker' };
  } catch (cfErr) {
    console.warn('Cloudflare Worker falhou, tentando SMTP:', cfErr.message);
  }

  // Tentativa 2: SMTP (nodemailer)
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

module.exports = { sendMail, FROM_EMAIL };
