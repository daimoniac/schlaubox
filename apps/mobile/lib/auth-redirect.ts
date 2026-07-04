import { Platform } from 'react-native';

const PRODUCTION_APP_URL = 'https://schlaubox.expo.app';

/** Redirect target for Supabase signup / magic-link emails. */
export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { origin, protocol } = window.location;
    if (origin && protocol !== 'file:') {
      return origin;
    }
  }
  return PRODUCTION_APP_URL;
}
