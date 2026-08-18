import { env } from '@/config/env';
import type { ApiError } from '@/types/api';

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
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  get<T>(path: string, signal?: AbortSignal): Promise<T>;
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//u.test(path)) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function readError(response: Response): Promise<ApiError> {
  const correlationId = response.headers.get('x-correlation-id') ?? undefined;
  try {
    const payload = await response.json() as Partial<ApiError>;
    return {
      code: payload.code ?? 'HTTP_ERROR',
      message: payload.message ?? 'تعذر إتمام الطلب.',
      status: response.status,
      fieldErrors: payload.fieldErrors,
      correlationId: payload.correlationId ?? correlationId,
    };
  } catch {
    return { code: 'HTTP_ERROR', message: 'تعذر إتمام الطلب.', status: response.status, correlationId };
  }
}

export const apiClient: ApiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}) {
    const response = await fetch(resolveUrl(path), {
      method: options.method ?? 'GET',
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (!response.ok) throw new ApiClientError(await readError(response));
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  },
  get<T>(path: string, signal?: AbortSignal) {
    return this.request<T>(path, { signal });
  },
};
