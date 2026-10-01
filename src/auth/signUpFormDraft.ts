import type { SignUpFormValues } from '@/utils/signUpValidation';

/** In-memory draft so signup fields survive opening legal docs and navigating back. */
let draft: SignUpFormValues | null = null;

export function readSignUpFormDraft(): SignUpFormValues | null {
  return draft ? { ...draft } : null;
}

export function writeSignUpFormDraft(values: SignUpFormValues): void {
  draft = { ...values };
}

export function clearSignUpFormDraft(): void {
  draft = null;
}
