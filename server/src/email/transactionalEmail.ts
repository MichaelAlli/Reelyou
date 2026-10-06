import { config } from '../config.js';

export type EmailSendResult = 'sent' | 'not_configured' | 'failed';

export function emailProviderConfigured(): boolean {
  return Boolean(config.email.resendApiKey?.trim() || config.email.smtpHost?.trim());
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailSendResult> {
  const resendKey = config.email.resendApiKey?.trim();
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.email.fromAddress,
          to: [input.to],
          subject: input.subject,
          text: input.text,
        }),
      });
      return res.ok ? 'sent' : 'failed';
    } catch {
      return 'failed';
    }
  }
  return 'not_configured';
}
