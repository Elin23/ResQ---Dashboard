export const AUTH_EXPIRED_EVENT = 'resq:auth-expired';

export function emitAuthExpired(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
