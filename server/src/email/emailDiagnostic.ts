import { authConfigured, config, productionAppOriginValid } from '../config.js';
import { API_SERVICE_NAME, resolveBuildIdentifier } from '../buildMeta.js';
import { normalizeSecretEnv, isResendApiKeyProductionLive } from './normalizeEmailFrom.js';
import { selectTransactionalEmailProvider } from './emailProvider.js';
import { emailProviderConfigured } from './transactionalEmail.js';
import { resolvePasswordForgotTraceForDiagnostic } from './emailDiagnosticPersistence.js';
import { resolveTransactionalEmailFrom } from './resolveEmailFrom.js';
import { effectiveEmailFromRaw, effectiveResendApiKey } from './runtimeEmailSecrets.js';

export async function buildEmailDiagnosticBody(): Promise<Record<string, unknown>> {
  const jwtLen = config.auth.jwtSecret.length;
  const resendKey = effectiveResendApiKey(config.email.resendApiKey);
  const fromRaw = effectiveEmailFromRaw(config.email.fromAddress);
  const fromResolved = resolveTransactionalEmailFrom();
  const appOrigin =
    normalizeSecretEnv(process.env.APP_ORIGIN ?? '').trim() || config.appOrigin.trim();
  const lastPasswordForgotAttempt = await resolvePasswordForgotTraceForDiagnostic();

  return {
    ok: true,
    service: API_SERVICE_NAME,
    build: resolveBuildIdentifier(),
    nodeEnv: config.nodeEnv,
    authJwtSecretPresent: jwtLen > 0,
    authJwtSecretLengthValid: authConfigured(),
    resendApiKeyPresent: resendKey.length > 0,
    resendApiKeyLength: resendKey.length,
    resendApiKeyProductionLive: isResendApiKeyProductionLive(resendKey),
    emailFromPresent: fromRaw.length > 0,
    emailFromValid: fromResolved.ok,
    emailFromDomain: fromResolved.ok ? fromResolved.domain : null,
    appOriginPresent: appOrigin.length > 0,
    appOriginHttpsValid: productionAppOriginValid(),
    selectedProvider: selectTransactionalEmailProvider(config),
    emailProviderConfigured: emailProviderConfigured(),
    passwordForgotRouteRegistered: true,
    fetchAvailable: typeof globalThis.fetch === 'function',
    realForgotHandlerMarker: lastPasswordForgotAttempt.realForgotHandlerEnteredAt,
    deliveryFailedPathMarker: lastPasswordForgotAttempt.deliveryFailedPathAt,
    lastPasswordForgotAttempt,
  };
}
