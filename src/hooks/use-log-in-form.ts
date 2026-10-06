import { useCallback, useMemo, useState } from 'react';

import {
  isLogInFormValid,
  validateLogInField,
  type LogInFieldErrors,
  type LogInFormValues,
} from '@/utils/logInValidation';

const INITIAL_VALUES: LogInFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};

export function useLogInForm() {
  const [values, setValues] = useState<LogInFormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof LogInFormValues, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next: LogInFieldErrors = {};
    (['email', 'password'] as const).forEach((field) => {
      if (touched[field]) {
        const message = validateLogInField(field, values);
        if (message) {
          next[field] = message;
        }
      }
    });
    return next;
  }, [touched, values]);

  const canSubmit = isLogInFormValid(values) && !isSubmitting;

  const updateField = useCallback(
    <K extends keyof LogInFormValues>(field: K, value: LogInFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const markTouched = useCallback((field: keyof LogInFormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleSubmit = useCallback(() => {
    setTouched({ email: true, password: true });
    return isLogInFormValid(values);
  }, [values]);

  const setSubmitting = useCallback((next: boolean) => {
    setIsSubmitting(next);
  }, []);

  return {
    values,
    errors,
    canSubmit,
    showPassword,
    isSubmitting,
    updateField,
    markTouched,
    handleSubmit,
    setSubmitting,
    setShowPassword,
  };
}
