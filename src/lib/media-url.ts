import { env } from '@/config/env';

/** Resolve media paths returned by the API against the MobileBackend media host. */
export function resolveMediaUrl(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return '';

  if (/^(?:data:|blob:)/i.test(raw)) return raw;

  // If the backend already returned an absolute URL, preserve it unless it points
  // to the dashboard API host for an uploaded file. Uploaded files live on MobileBackend.
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const apiUrl = new URL(env.apiBaseUrl);
      if (url.host === apiUrl.host && /^\/uploads(?:\/|$)/i.test(url.pathname)) {
        return `${env.mediaBaseUrl}${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      return raw;
    }
    return raw;
  }

  let path = raw.replace(/\\/g, '/');
  path = path.replace(/^~\//, '/');
  path = path.replace(/^\/?wwwroot\//i, '/');
  if (!path.startsWith('/')) path = `/${path}`;

  return `${env.mediaBaseUrl}${path}`;
}
