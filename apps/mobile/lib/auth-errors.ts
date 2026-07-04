import { strings } from './strings';

type AuthLikeError = {
  code?: string;
  message?: string;
};

export function isEmailNotConfirmedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { code, message } = error as AuthLikeError;
  const normalized = message?.toLowerCase() ?? '';
  return (
    code === 'email_not_confirmed' ||
    normalized.includes('email not confirmed') ||
    normalized.includes('e-mail not confirmed')
  );
}

export function getLoginErrorMessage(error: unknown): string {
  if (isEmailNotConfirmedError(error)) {
    return strings.errors.emailNotConfirmed;
  }

  if (error && typeof error === 'object') {
    const { code } = error as AuthLikeError;
    if (code === 'invalid_credentials') {
      return strings.errors.invalidCredentials;
    }
  }

  return strings.errors.auth;
}
