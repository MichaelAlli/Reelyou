import { createTransport, type Transporter } from 'nodemailer';

import { normalizeEmail } from '../friendMatch/identifierNormalize.js';
import { config } from '../config.js';
import {
  buildResendAuthorizationHeader,
  passwordRecoveryEmailConfigured,
  selectTransactionalEmailProvider,
} from './emailProvider.js';
import { senderAddressForLog } from './emailLogHelpers.js';
import { normalizeEmailFrom } from './normalizeEmailFrom.js';
import { resolveTransactionalEmailFrom } from './resolveEmailFrom.js';
import {
  completeForgotPasswordTrace,
  patchForgotPasswordTrace,
} from '../auth/forgotPasswordTrace.js';
import { effectiveResendApiKey } from './runtimeEmailSecrets.js';

function summarizeResendResponseBody(raw: string, httpStatus: number): string {
  const trimmed = raw.trim();
  if (!trimmed) return httpStatus >= 200 && httpStatus < 300 ? 'empty_ok_body' : 'empty_body';
  try {
    const body = JSON.parse(trimmed) as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof body.name === 'string') parts.push(`name=${body.name}`);
    if (typeof body.message === 'string') parts.push(`message=${body.message.slice(0, 120)}`);
    if (typeof body.statusCode === 'number') parts.push(`statusCode=${body.statusCode}`);
    if (typeof body.id === 'string') parts.push('hasId=true');
    return parts.length > 0 ? parts.join('; ') : 'json_without_known_fields';
  } catch {
    return 'non_json_body';
  }
}

export type EmailSendResult = 'sent' | 'not_configured' | 'failed' | 'invalid_from';

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
  return passwordRecoveryEmailConfigured(config);
}

function emailFromDomain(fromAddress: string): string | null {
  const normalized = normalizeEmailFrom(fromAddress);
  return normalized.ok ? normalized.domain : null;
}

/** Safe env flags for server logs — never includes secrets or full addresses. */
export function resendSendDiagnostics(): {
  provider: 'resend';
  resendApiKeyPresent: boolean;
  emailFromPresent: boolean;
  emailFromDomain: string | null;
  emailFromValid: boolean;
  emailFromNormalized: boolean;
  selectedProvider: TransactionalEmailProvider;
} {
  const raw = config.email.fromAddress.trim();
  const resolved = resolveTransactionalEmailFrom();
  return {
    provider: 'resend',
    resendApiKeyPresent: effectiveResendApiKey(config.email.resendApiKey).length > 0,
    emailFromPresent: raw.length > 0,
    emailFromDomain: resolved.ok ? resolved.domain : emailFromDomain(raw),
    emailFromValid: resolved.ok,
    emailFromNormalized: resolved.ok && raw !== resolved.value,
    selectedProvider: selectTransactionalEmailProvider(config),
  };
}

type TransactionalEmailProvider = ReturnType<typeof selectTransactionalEmailProvider>;

function resendHttpBodyIndicatesFailure(body: Record<string, unknown>): boolean {
  if (body.error != null && body.error !== false) return true;
  const statusCode = body.statusCode;
  if (typeof statusCode === 'number' && statusCode >= 400) return true;
  return false;
}

function resendHttpBodyIndicatesSuccess(body: Record<string, unknown>): boolean {
  if (typeof body.id === 'string' && body.id.length > 0) return true;
  const data = body.data;
  if (data && typeof data === 'object') {
    const nested = data as { id?: string };
    if (typeof nested.id === 'string' && nested.id.length > 0) return true;
  }
  return false;
}

function parseResendErrorPayload(raw: string): {
  providerErrorName?: string;
  providerErrorCode?: string;
  providerErrorMessage?: string;
  providerErrorCategory?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { providerErrorCategory: 'empty_response_body' };
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
    let category = 'provider_rejected';
    const msg = (message ?? '').toLowerCase();
    if (name === 'validation_error' && msg.includes('api key')) category = 'invalid_api_key';
    else if (msg.includes('api key') || msg.includes('unauthorized')) category = 'invalid_api_key';
    else if (name === 'validation_error' || msg.includes('from')) category = 'invalid_sender';
    else if (msg.includes('domain')) category = 'unverified_domain';
    else if (msg.includes('rate')) category = 'rate_limit';
    if (typeof body.statusCode === 'number' && body.statusCode === 401) {
      category = 'invalid_api_key';
    }
    return {
      providerErrorName: name,
      providerErrorCode: code,
      providerErrorMessage: message?.slice(0, 300),
      providerErrorCategory: category,
    };
  } catch {
    return { providerErrorMessage: trimmed.slice(0, 300), providerErrorCategory: 'non_json_response' };
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

async function sendViaResend(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from: string;
  forgotTraceId?: string;
}): Promise<EmailSendResult> {
  const diagnostics = resendSendDiagnostics();
  const resendKey = effectiveResendApiKey(config.email.resendApiKey);
  const payload: Record<string, unknown> = {
    from: input.from,
    to: [input.to],
    subject: input.subject,
    text: input.text,
  };
  if (input.html) payload.html = input.html;

  console.log('[email] provider=resend', {
    apiKeyPresent: resendKey.length > 0,
    sender: senderAddressForLog(input.from),
    recipientDomain: input.to.includes('@') ? input.to.split('@').pop() : 'invalid',
  });

  if (!resendKey) {
    console.error('[email] resend-error-type=missing_api_key', { phase: 'before_resend_api_call' });
    return 'not_configured';
  }

  if (typeof globalThis.fetch !== 'function') {
    console.error('[email] resend-error-type=fetch_unavailable', {
      exceptionName: 'ReferenceError',
      exceptionMessage: 'globalThis.fetch is not a function',
    });
    return 'failed';
  }

  try {
    console.log('[email] before-resend-request');
    if (input.forgotTraceId) {
      await patchForgotPasswordTrace(input.forgotTraceId, {
        resendRequestStartingAt: new Date().toISOString(),
      });
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: buildResendAuthorizationHeader(resendKey),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const detail = await res.text().catch(() => '');
    const parsedResend = parseResendErrorPayload(detail);
    const bodySummary = summarizeResendResponseBody(detail, res.status);
    console.log('[email] resend-response-status=' + res.status, {
      resendErrorType: res.ok ? undefined : parsedResend.providerErrorName,
      resendErrorMessage: res.ok ? undefined : parsedResend.providerErrorMessage,
      resendResponseBodySummary: bodySummary,
    });
    if (input.forgotTraceId) {
      await patchForgotPasswordTrace(input.forgotTraceId, {
        resendRequestFinishedAt: new Date().toISOString(),
        resendHttpStatus: res.status,
        resendErrorType: parsedResend.providerErrorName ?? null,
        resendErrorMessage: parsedResend.providerErrorMessage ?? null,
      });
    }
    if (res.ok) {
      if (!detail.trim()) return 'sent';
      try {
        const body = JSON.parse(detail) as Record<string, unknown>;
        if (resendHttpBodyIndicatesFailure(body)) {
          console.error('[reellyou-email] resend_send_failed', {
            ...diagnostics,
            phase: 'from_resend_response',
            httpStatus: res.status,
            providerErrorCategory: 'error_in_ok_http_status',
            ...parseResendErrorPayload(detail),
          });
          return 'failed';
        }
        if (resendHttpBodyIndicatesSuccess(body)) return 'sent';
        console.error('[reellyou-email] resend_send_failed', {
          ...diagnostics,
          phase: 'from_resend_response',
          httpStatus: res.status,
          providerErrorCategory: 'missing_send_id',
        });
        return 'failed';
      } catch {
        return 'sent';
      }
    }
    console.error('[reellyou-email] resend_send_failed', {
      ...diagnostics,
      phase: 'from_resend_response',
      httpStatus: res.status,
      ...parseResendErrorPayload(detail),
    });
    return 'failed';
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (input.forgotTraceId) {
      await patchForgotPasswordTrace(input.forgotTraceId, {
        resendRequestFinishedAt: new Date().toISOString(),
        resendErrorType: err.name,
        resendErrorMessage: err.message.slice(0, 300),
      });
      await completeForgotPasswordTrace(input.forgotTraceId, 'network_exception');
    }
    console.error('[email] exception-name=' + err.name, {
      exceptionMessage: err.message.slice(0, 300),
    });
    console.error('[reellyou-email] resend_send_failed', {
      ...diagnostics,
      phase: 'before_resend_response',
      providerErrorCategory: 'network_failure',
      providerErrorName: err.name,
      providerErrorMessage: err.message.slice(0, 300),
    });
    return 'failed';
  }
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  forgotTraceId?: string;
}): Promise<EmailSendResult> {
  const provider = selectTransactionalEmailProvider(config);
  if (input.forgotTraceId) {
    console.log('[email] email-function-start');
    await patchForgotPasswordTrace(input.forgotTraceId, {
      emailFunctionEnteredAt: new Date().toISOString(),
      providerSelected: provider,
    });
  }

  const fromResolved = resolveTransactionalEmailFrom();
  if (!fromResolved.ok) {
    console.error('[reellyou-email] resend_send_failed', {
      ...resendSendDiagnostics(),
      phase: 'before_resend_api_call',
      providerErrorCategory: 'invalid_from_config',
      providerErrorMessage: fromResolved.reason,
    });
    return 'invalid_from';
  }

  const recipient = normalizeEmail(input.to) ?? '';
  if (!recipient) {
    console.error('[email] resend-error-type=invalid_recipient', {
      phase: 'before_resend_api_call',
    });
    console.error('[reellyou-email] resend_send_failed', {
      ...resendSendDiagnostics(),
      phase: 'before_resend_api_call',
      providerErrorCategory: 'invalid_recipient',
    });
    return 'failed';
  }

  console.log('[email] provider=' + provider, {
    apiKeyPresent: effectiveResendApiKey(config.email.resendApiKey).length > 0,
    sender: fromResolved.ok ? senderAddressForLog(fromResolved.value) : 'invalid',
  });
  if (provider === 'resend') {
    return sendViaResend({
      to: recipient,
      subject: input.subject,
      text: input.text,
      html: input.html,
      from: fromResolved.value,
      forgotTraceId: input.forgotTraceId,
    });
  }

  if (provider === 'smtp') {
    const transport = getSmtpTransport();
    if (!transport) return 'not_configured';
    try {
      await transport.sendMail({
        from: fromResolved.value,
        to: recipient,
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
