import nodemailer from 'nodemailer';
import { env } from '../config/env';

function createTransport() {
  if (!env.smtpConfigured) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const transport = createTransport();

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!transport || !env.SMTP_FROM) {
    // eslint-disable-next-line no-console
    console.warn('[mail] SMTP non configuré — email simulé:', options.subject, '→', options.to);
    return { simulated: true as const };
  }

  try {
    await transport.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return { simulated: false as const };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[mail] Échec SMTP:', err);
    return { simulated: true as const, error: true as const };
  }
}

export async function sendContactConfirmation(params: {
  to: string;
  nom: string;
  service: string;
}) {
  const subject = 'Confirmation de votre demande — Cabinet Conseil';
  const text = `Bonjour ${params.nom},\n\nNous avons bien reçu votre demande concernant « ${params.service} ». Notre équipe vous recontactera rapidement.\n\nCordialement,\nCabinet Conseil Algérie`;
  return sendMail({ to: params.to, subject, text });
}

export async function sendContactNotification(params: {
  service: string;
  zone: string;
  secteur: string;
  description: string;
  nom: string;
  societe?: string | null;
  email: string;
  telephone?: string | null;
}) {
  if (!env.SMTP_NOTIFY_TO) {
    // eslint-disable-next-line no-console
    console.warn('[mail] SMTP_NOTIFY_TO manquant — notification équipe simulée');
    return { simulated: true as const };
  }

  const subject = `[Lead] ${params.service} — ${params.nom}`;
  const text = [
    'Nouvelle demande ContactFlow',
    `Service: ${params.service}`,
    `Zone: ${params.zone}`,
    `Secteur: ${params.secteur}`,
    `Description: ${params.description}`,
    `Nom: ${params.nom}`,
    `Société: ${params.societe ?? '—'}`,
    `Email: ${params.email}`,
    `Téléphone: ${params.telephone ?? '—'}`,
  ].join('\n');

  return sendMail({ to: env.SMTP_NOTIFY_TO, subject, text });
}
