import { useCallback, useMemo, useState } from 'react';

import { readSignUpFormDraft, writeSignUpFormDraft } from '@/auth/signUpFormDraft';
import {
  isSignUpFormValid,
  validateSignUpField,
  type SignUpFieldErrors,
  type SignUpFormValues,
} from '@/utils/signUpValidation';

const INITIAL_VALUES: SignUpFormValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

function resolveInitialValues(): SignUpFormValues {
  return readSignUpFormDraft() ?? INITIAL_VALUES;
}

export function useSignUpForm() {
  const [values, setValues] = useState<SignUpFormValues>(resolveInitialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof SignUpFormValues, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next: SignUpFieldErrors = {};
    (Object.keys(values) as (keyof SignUpFormValues)[]).forEach((field) => {
      if (touched[field]) {
        const message = validateSignUpField(field, values);
        if (message) {
          next[field] = message;
        }
      }
    });
    return next;
  }, [touched, values]);

  const canSubmit = isSignUpFormValid(values) && !isSubmitting;

  const updateField = useCallback(
    <K extends keyof SignUpFormValues>(field: K, value: SignUpFormValues[K]) => {
      setValues((current) => {
        const next = { ...current, [field]: value };
        writeSignUpFormDraft(next);
        return next;
      });
    },
    [],
  );

  const markTouched = useCallback((field: keyof SignUpFormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });
  }, []);

  const setTermsAccepted = useCallback(
    (accepted: boolean) => {
      updateField('termsAccepted', accepted);
      markTouched('termsAccepted');
    },
    [markTouched, updateField],
  );

  const toggleTermsAccepted = useCallback(() => {
    setValues((current) => {
      const next = { ...current, termsAccepted: !current.termsAccepted };
      writeSignUpFormDraft(next);
      return next;
    });
    markTouched('termsAccepted');
  }, [markTouched]);

  const handleSubmit = useCallback(() => {
    markAllTouched();

    if (!isSignUpFormValid(values)) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1200);
  }, [markAllTouched, values]);

  return {
    values,
    errors,
    canSubmit,
    showPassword,
    showConfirmPassword,
    isSubmitting,
    updateField,
    markTouched,
    markAllTouched,
    setTermsAccepted,
    toggleTermsAccepted,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
  };
}
