import { strings } from './strings';

type AuthLikeError = {
  code?: string;
  message?: string;
};

export class AuthFlowError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

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

export function isEmailRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { code, message } = error as AuthLikeError;
  const normalized = message?.toLowerCase() ?? '';
  return (
    code === 'over_email_send_rate_limit' ||
    normalized.includes('rate limit') ||
    normalized.includes('too many requests')
  );
}

export function isUserAlreadyRegisteredError(error: unknown): boolean {
  return error instanceof AuthFlowError && error.code === 'user_already_exists';
}

export function getLoginErrorMessage(error: unknown): string {
  if (isEmailNotConfirmedError(error)) {
    return strings.errors.emailNotConfirmed;
  }

  if (isEmailRateLimitError(error)) {
    return strings.errors.emailRateLimit;
  }

  if (error && typeof error === 'object') {
    const { code } = error as AuthLikeError;
    if (code === 'invalid_credentials') {
      return strings.errors.invalidCredentials;
    }
  }

  return strings.errors.auth;
}

export function getRegisterErrorMessage(error: unknown): string {
  if (isUserAlreadyRegisteredError(error)) {
    return strings.errors.userAlreadyExists;
  }

  if (isEmailRateLimitError(error)) {
    return strings.errors.emailRateLimit;
  }

  return strings.errors.generic;
}
