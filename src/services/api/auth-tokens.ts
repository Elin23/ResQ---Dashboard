const ACCESS_TOKEN_KEY = 'resq-admin-access-token';
const REFRESH_TOKEN_KEY = 'resq-admin-refresh-token';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can be unavailable in hardened browser contexts.
  }
}

function remove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Storage can be unavailable in hardened browser contexts.
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window === 'undefined') return null;

  return (
    read(window.localStorage, ACCESS_TOKEN_KEY) ??
    read(window.sessionStorage, ACCESS_TOKEN_KEY)
  );
}

export function getRefreshToken(): string | null {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  if (typeof window === 'undefined') return null;

  return (
    read(window.localStorage, REFRESH_TOKEN_KEY) ??
    read(window.sessionStorage, REFRESH_TOKEN_KEY)
  );
}

export function setAuthTokens(tokens: AuthTokens, remember: boolean): void {
  inMemoryAccessToken = tokens.accessToken;
  inMemoryRefreshToken = tokens.refreshToken ?? null;

  if (typeof window === 'undefined') return;

  clearAuthTokens();

  inMemoryAccessToken = tokens.accessToken;
  inMemoryRefreshToken = tokens.refreshToken ?? null;

  const storage = remember ? window.localStorage : window.sessionStorage;
  write(storage, ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) write(storage, REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function updateAuthTokens(tokens: AuthTokens): void {
  inMemoryAccessToken = tokens.accessToken;
  inMemoryRefreshToken = tokens.refreshToken ?? inMemoryRefreshToken;

  if (typeof window === 'undefined') return;

  const isPersistent = Boolean(read(window.localStorage, ACCESS_TOKEN_KEY));
  const storage = isPersistent ? window.localStorage : window.sessionStorage;

  remove(window.localStorage, ACCESS_TOKEN_KEY);
  remove(window.sessionStorage, ACCESS_TOKEN_KEY);
  remove(window.localStorage, REFRESH_TOKEN_KEY);
  remove(window.sessionStorage, REFRESH_TOKEN_KEY);

  write(storage, ACCESS_TOKEN_KEY, tokens.accessToken);
  if (inMemoryRefreshToken) write(storage, REFRESH_TOKEN_KEY, inMemoryRefreshToken);
}

export function clearAuthTokens(): void {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;

  if (typeof window === 'undefined') return;

  remove(window.localStorage, ACCESS_TOKEN_KEY);
  remove(window.sessionStorage, ACCESS_TOKEN_KEY);
  remove(window.localStorage, REFRESH_TOKEN_KEY);
  remove(window.sessionStorage, REFRESH_TOKEN_KEY);
}
