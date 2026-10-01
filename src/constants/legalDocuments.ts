import {
  BETA_DRAFT_BANNER,
  BETA_DRAFT_PRIVACY_BODY,
  BETA_DRAFT_TERMS_BODY,
  LEGAL_DOCUMENT_DRAFT_VERSION,
  LEGAL_DOCUMENT_REQUIRES_COUNSEL,
} from '@/constants/legalDocumentsBetaDraftContent';

export type LegalDocumentId = 'terms-of-service' | 'privacy-policy';

/** Private beta draft copy — NOT counsel-approved final legal text. */
export const LEGAL_DOCUMENT_VERSION = LEGAL_DOCUMENT_DRAFT_VERSION;
export const LEGAL_DOCUMENT_IS_BETA_DRAFT = LEGAL_DOCUMENT_REQUIRES_COUNSEL;

function withBetaBanner(body: string): string {
  return `${BETA_DRAFT_BANNER}\n\n${body}`;
}

export const LEGAL_DOCUMENT_BODY: Record<LegalDocumentId, string | null> = {
  'terms-of-service': withBetaBanner(BETA_DRAFT_TERMS_BODY),
  'privacy-policy': withBetaBanner(BETA_DRAFT_PRIVACY_BODY),
};

export const LEGAL_DOCUMENT_TITLES: Record<LegalDocumentId, string> = {
  'terms-of-service': 'Private Beta Terms (Draft)',
  'privacy-policy': 'Private Beta Privacy Policy (Draft)',
};

export const LEGAL_DOCUMENT_UNAVAILABLE_MESSAGE =
  'Beta legal documents are not loaded. Contact reelyou.support@gmail.com.';

export function isLegalDocumentId(value: string): value is LegalDocumentId {
  return value === 'terms-of-service' || value === 'privacy-policy';
}
