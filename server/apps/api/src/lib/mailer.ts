import nodemailer, { type Transporter } from 'nodemailer';
import { env, hasMailTransport, isProduction } from '../config/env.js';
import { logger } from './logger.js';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!hasMailTransport) return null;

  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // 465 is implicit TLS; anything else negotiates STARTTLS.
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER!, pass: env.SMTP_PASSWORD! },
  });

  return transporter;
}

/**
 * Sends a message.
 *
 * When no transport is configured — which only happens outside production,
 * since the environment check refuses to start otherwise — the message is
 * written to the log instead. That keeps local development possible without an
 * SMTP account: the sign-in code appears in the server console.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const transport = getTransporter();

  if (!transport) {
    logger.warn(
      { to: message.to, subject: message.subject, body: message.text },
      'No SMTP transport configured — message written to the log instead of being sent',
    );
    return;
  }

  try {
    await transport.sendMail({
      from: env.SMTP_FROM ?? env.SMTP_USER,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  } catch (error) {
    // Delivery failure must not reveal whether the address exists, so the
    // caller always reports success. The operator sees the reason here.
    logger.error({ err: error, to: message.to }, 'Failed to send message');

    if (isProduction) {
      throw error;
    }
  }
}
