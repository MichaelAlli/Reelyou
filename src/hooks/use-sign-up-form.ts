import { useCallback, useMemo, useState } from 'react';

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

export function useSignUpForm() {
  const [values, setValues] = useState<SignUpFormValues>(INITIAL_VALUES);
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
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const markTouched = useCallback((field: keyof SignUpFormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleSubmit = useCallback(() => {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (!isSignUpFormValid(values)) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1200);
  }, [values]);

  return {
    values,
    errors,
    canSubmit,
    showPassword,
    showConfirmPassword,
    isSubmitting,
    updateField,
    markTouched,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
  };
}
