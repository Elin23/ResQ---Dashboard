import { env } from '@/config/env';
import type { ApiError } from '@/types/api';
import { clearAuthTokens, getAccessToken, getRefreshToken, updateAuthTokens } from './auth-tokens';
import { emitAuthExpired } from './auth-events';

export class ApiClientError extends Error implements ApiError {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly correlationId?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.status = error.status;
    this.fieldErrors = error.fieldErrors;
    this.correlationId = error.correlationId;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  get<T>(path: string, signal?: AbortSignal): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string, body?: unknown): Promise<T>;
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//u.test(path)) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function readError(response: Response, path: string): Promise<ApiError> {
  const headerCorrelationId = response.headers.get('x-correlation-id') ?? undefined;

  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const fieldErrors =
      payload.errors && typeof payload.errors === 'object'
        ? (payload.errors as Record<string, string[]>)
        : undefined;

    const rawCode = typeof payload.code === 'string' ? payload.code : 'HTTP_ERROR';
    const isLogin = /\/api\/dashboard\/auth\/login(?:$|\?)/u.test(path);
    const message =
      isLogin && response.status === 401
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
        : response.status === 401
          ? 'انتهت جلسة تسجيل الدخول أو لم تعد صالحة. سجّل الدخول مرة أخرى.'
          : response.status === 403
            ? 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'
            : response.status === 404
              ? 'تعذر العثور على البيانات المطلوبة.'
              : response.status >= 500
                ? 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.'
                : 'تعذر إتمام الطلب. راجع البيانات وحاول مرة أخرى.';

    return {
      code: rawCode,
      message,
      status: response.status,
      fieldErrors,
      correlationId:
        (typeof payload.traceId === 'string' && payload.traceId) ||
        (typeof payload.correlationId === 'string' && payload.correlationId) ||
        headerCorrelationId,
    };
  } catch {
    return {
      code: 'HTTP_ERROR',
      message:
        response.status === 401
          ? (/\/api\/dashboard\/auth\/login(?:$|\?)/u.test(path)
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
              : 'انتهت جلسة تسجيل الدخول أو لم تعد صالحة. سجّل الدخول مرة أخرى.')
          : response.status === 403
            ? 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'
            : response.status === 404
              ? 'تعذر العثور على البيانات المطلوبة.'
              : response.status >= 500
                ? 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.'
                : 'تعذر إتمام الطلب. راجع البيانات وحاول مرة أخرى.',
      status: response.status,
      correlationId: headerCorrelationId,
    };
  }
}

function extractToken(payload: unknown, names: readonly string[]): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  for (const name of names) {
    const value = record[name];
    if (typeof value === 'string' && value.trim()) return value;
  }

  for (const containerName of ['data', 'result']) {
    const nested = record[containerName];
    const value = extractToken(nested, names);
    if (value) return value;
  }

  return null;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch(resolveUrl('/api/dashboard/auth/refresh'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuthTokens();
      emitAuthExpired();
      return null;
    }

    const payload = (await response.json()) as unknown;
    const accessToken = extractToken(payload, ['accessToken', 'token', 'jwt', 'access_token']);
    const nextRefreshToken = extractToken(payload, ['refreshToken', 'refresh_token']);

    if (!accessToken) {
      clearAuthTokens();
      emitAuthExpired();
      return null;
    }

    updateAuthTokens({ accessToken, refreshToken: nextRefreshToken ?? refreshToken });
    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function parseSuccess<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  // ASP.NET actions may legitimately return HTTP 200 with an empty body.
  // Read once as text so those responses do not fail with an unexpected JSON parse error.
  const text = await response.text();
  if (!text.trim()) return undefined as T;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return text as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const apiClient: ApiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}) {
    const execute = async (token: string | null) =>
      fetch(resolveUrl(path), {
        method: options.method ?? 'GET',
        signal: options.signal,
        headers: {
          Accept: 'application/json',
          ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(!options.skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });

    let response: Response;

    try {
      response = await execute(options.skipAuth ? null : getAccessToken());

      if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
        const nextToken = await refreshAccessToken();
        if (nextToken) response = await execute(nextToken);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;

      throw new ApiClientError({
        code: 'NETWORK_ERROR',
        message: 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.',
        status: 0,
      });
    }

    if (!response.ok) throw new ApiClientError(await readError(response, path));
    return parseSuccess<T>(response);
  },

  get<T>(path: string, signal?: AbortSignal) {
    return this.request<T>(path, { signal });
  },
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body });
  },
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body });
  },
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body });
  },
  delete<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'DELETE', body });
  },
};
