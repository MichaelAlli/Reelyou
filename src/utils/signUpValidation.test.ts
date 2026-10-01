import assert from 'node:assert/strict';

import { isSignUpFormValid, type SignUpFormValues } from '@/utils/signUpValidation';

const validBase: SignUpFormValues = {
  fullName: 'Alex Tester',
  email: 'alex@example.com',
  phone: '',
  password: 'password123',
  confirmPassword: 'password123',
  termsAccepted: false,
};

assert.equal(isSignUpFormValid({ ...validBase, termsAccepted: false }), false);
assert.equal(isSignUpFormValid({ ...validBase, termsAccepted: true }), true);

console.log('signUpValidation tests ok');
