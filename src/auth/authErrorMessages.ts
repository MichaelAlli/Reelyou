export function mapAuthErrorToMessage(error: string | undefined): string {
  switch (error) {
    case 'invalid_credentials':
      return 'That email or password is not correct.';
    case 'invalid_request':
      return 'Enter your email and password.';
    case 'auth_not_configured':
      return 'Sign-in is not available on this build. Check that the server is configured.';
    case 'account_locked':
      return 'This account is locked. Contact support if you need help.';
    case 'network_error':
      return 'Could not reach the server. Check your connection and try again.';
    case 'server_error':
      return 'Something went wrong on our side. Try again in a moment.';
    case 'weak_password':
      return 'Choose a password at least 8 characters long.';
    case 'email_in_use':
      return 'An account with this email already exists.';
    case 'terms_required':
    case 'legal_version_required':
      return 'Accept the terms and privacy policy to continue.';
    default:
      return 'Could not sign in. Check your email and password.';
  }
}
