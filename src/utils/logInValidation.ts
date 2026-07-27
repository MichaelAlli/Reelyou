export interface LogInFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LogInFieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogInField(
  field: keyof Pick<LogInFormValues, 'email' | 'password'>,
  values: LogInFormValues,
): string | undefined {
  switch (field) {
    case 'email': {
      const email = values.email.trim();
      if (!email) {
        return 'Email address is required.';
      }
      if (!EMAIL_PATTERN.test(email)) {
        return 'Enter a valid email address.';
      }
      return undefined;
    }
    case 'password': {
      if (!values.password) {
        return 'Password is required.';
      }
      if (values.password.length < 8) {
        return 'Password must be at least 8 characters.';
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export function validateLogInForm(values: LogInFormValues): LogInFieldErrors {
  const fields: (keyof LogInFieldErrors)[] = ['email', 'password'];

  return fields.reduce<LogInFieldErrors>((errors, field) => {
    const message = validateLogInField(field, values);
    if (message) {
      errors[field] = message;
    }
    return errors;
  }, {});
}

export function isLogInFormValid(values: LogInFormValues): boolean {
  return Object.keys(validateLogInForm(values)).length === 0;
}
