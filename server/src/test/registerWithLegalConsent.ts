import { handleRegister } from '../auth/authHandlers.js';

const LEGAL_VERSION = '2026-10-01-beta-draft';

export function registerWithLegalConsent(body: {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
}) {
  return handleRegister({
    ...body,
    termsAccepted: true,
    termsVersion: LEGAL_VERSION,
    privacyVersion: LEGAL_VERSION,
    consentAcceptedAt: Date.now(),
  });
}
