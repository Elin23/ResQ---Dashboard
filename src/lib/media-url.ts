import { env } from '@/config/env';

/** Convert media paths returned by ASP.NET to URLs that the browser can load from Vercel. */
export function resolveMediaUrl(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return '';

  if (/^(?:https?:|data:|blob:)/i.test(raw)) return raw;

  let path = raw.replace(/\\/g, '/');
  path = path.replace(/^~\//, '/');
  path = path.replace(/^\/?wwwroot\//i, '/');
  if (!path.startsWith('/')) path = `/${path}`;

  return `${env.apiBaseUrl}${path}`;
}
