export interface SignUpFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface SignUpFieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s().-]{7,}$/;

export function validateSignUpField(
  field: keyof SignUpFormValues,
  values: SignUpFormValues,
): string | undefined {
  switch (field) {
    case 'fullName': {
      const name = values.fullName.trim();
      if (!name) {
        return 'Full name is required.';
      }
      if (name.length < 2) {
        return 'Enter your full name.';
      }
      return undefined;
    }
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
    case 'phone': {
      const phone = values.phone.trim();
      if (!phone) {
        return undefined;
      }
      if (!PHONE_PATTERN.test(phone)) {
        return 'Enter a valid phone number.';
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
    case 'confirmPassword': {
      if (!values.confirmPassword) {
        return 'Confirm your password.';
      }
      if (values.confirmPassword !== values.password) {
        return 'Passwords do not match.';
      }
      return undefined;
    }
    case 'termsAccepted': {
      if (!values.termsAccepted) {
        return 'You must accept the Terms of Service and Privacy Policy.';
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export function validateSignUpForm(values: SignUpFormValues): SignUpFieldErrors {
  const fields: (keyof SignUpFormValues)[] = [
    'fullName',
    'email',
    'phone',
    'password',
    'confirmPassword',
    'termsAccepted',
  ];

  return fields.reduce<SignUpFieldErrors>((errors, field) => {
    const message = validateSignUpField(field, values);
    if (message) {
      errors[field] = message;
    }
    return errors;
  }, {});
}

export function isSignUpFormValid(values: SignUpFormValues): boolean {
  return Object.keys(validateSignUpForm(values)).length === 0;
}
