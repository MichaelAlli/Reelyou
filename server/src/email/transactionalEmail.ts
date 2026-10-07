import { createTransport, type Transporter } from 'nodemailer';

import { config } from '../config.js';

export type EmailSendResult = 'sent' | 'not_configured' | 'failed';

let smtpTransport: Transporter | null = null;

function getSmtpTransport(): Transporter | null {
  if (
    !config.email.smtpHost.trim() ||
    !config.email.smtpUser.trim() ||
    !config.email.smtpPass.trim()
  ) {
    return null;
  }
  if (!smtpTransport) {
    smtpTransport = createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
  }
  return smtpTransport;
}

export function emailProviderConfigured(): boolean {
  if (config.email.resendApiKey.trim()) return true;
  return getSmtpTransport() != null;
}

function emailFromDomain(fromAddress: string): string | null {
  const trimmed = fromAddress.trim();
  const angle = trimmed.match(/<([^>@]+@[^>]+)>/);
  const email = (angle?.[1] ?? trimmed).trim();
  const at = email.lastIndexOf('@');
  if (at <= 0 || at >= email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

/** Safe env flags for server logs — never includes secrets or full addresses. */
export function resendSendDiagnostics(): {
  provider: 'resend';
  resendApiKeyPresent: boolean;
  emailFromPresent: boolean;
  emailFromDomain: string | null;
} {
  const from = config.email.fromAddress.trim();
  return {
    provider: 'resend',
    resendApiKeyPresent: config.email.resendApiKey.trim().length > 0,
    emailFromPresent: from.length > 0,
    emailFromDomain: emailFromDomain(from),
  };
}

function parseResendErrorPayload(raw: string): {
  providerErrorName?: string;
  providerErrorCode?: string;
  providerErrorMessage?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const body = JSON.parse(trimmed) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name : undefined;
    const message = typeof body.message === 'string' ? body.message : undefined;
    const code =
      typeof body.code === 'string'
        ? body.code
        : typeof body.statusCode === 'number'
          ? String(body.statusCode)
          : undefined;
    return {
      providerErrorName: name,
      providerErrorCode: code,
      providerErrorMessage: message?.slice(0, 300),
    };
  } catch {
    return { providerErrorMessage: trimmed.slice(0, 300) };
  }
}

function buildPasswordResetHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family: system-ui, sans-serif; background:#050508; color:#f8f4ec; padding:24px;">
  <p style="font-size:18px; font-weight:600; margin:0 0 12px;">REELYOU</p>
  <p style="line-height:1.5;">You requested a password reset. Use the button below within one hour.</p>
  <p style="margin:24px 0;">
    <a href="${link}" style="display:inline-block; background:#c9a84c; color:#050508; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600;">Reset password</a>
  </p>
  <p style="font-size:13px; color:rgba(248,244,236,0.65); line-height:1.5;">If you did not request this, you can ignore this email. Your password will stay the same.</p>
  <p style="font-size:12px; color:rgba(248,244,236,0.45); word-break:break-all;">${link}</p>
</body>
</html>`;
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailSendResult> {
  const resendKey = config.email.resendApiKey.trim();
  if (resendKey) {
    const diagnostics = resendSendDiagnostics();
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
          html: input.html,
        }),
      });
      if (res.ok) return 'sent';
      const detail = await res.text().catch(() => '');
      console.error('[reellyou-email] resend_send_failed', {
        ...diagnostics,
        phase: 'from_resend_response',
        httpStatus: res.status,
        ...parseResendErrorPayload(detail),
      });
      return 'failed';
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[reellyou-email] resend_send_failed', {
        ...diagnostics,
        phase: 'before_resend_response',
        providerErrorName: err.name,
        providerErrorMessage: err.message.slice(0, 300),
      });
      return 'failed';
    }
  }

  const transport = getSmtpTransport();
  if (transport) {
    try {
      await transport.sendMail({
        from: config.email.fromAddress,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      return 'sent';
    } catch (error) {
      console.error('[reellyou-email] SMTP send failed:', error);
      return 'failed';
    }
  }

  return 'not_configured';
}

export function buildPasswordResetEmail(link: string): { text: string; html: string } {
  const text = `Reset your REELYOU password\n\nUse this link within one hour:\n${link}\n\nIf you did not request this, you can ignore this email.`;
  return { text, html: buildPasswordResetHtml(link) };
}
