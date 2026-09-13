import { env } from '@/config/env';

const MOBILE_MEDIA_HOST = 'resqmob.runasp.net';

function toDashboardMediaProxy(pathname: string, search = '', hash = ''): string {
  let path = pathname.replace(/\\/g, '/');
  path = path.replace(/^~\//, '/');
  path = path.replace(/^\/?wwwroot\//i, '/');
  path = path.replace(/^\/+/, '');

  // Most DB media values are /uploads/..., but some endpoints may return
  // another MobileBackend path. Preserve the actual path instead of forcing
  // every value under /uploads.
  return `${env.apiBaseUrl}/media/${path}${search}${hash}`;
}

/**
 * Resolve MobileBackend media through DashboardBackend.
 *
 * Browser -> https://resqback.runasp.net/media/<original-mobile-path>
 * DashboardBackend -> https://resqmob.runasp.net/<original-mobile-path>
 *
 * This prevents the browser from requesting resqmob.runasp.net directly and
 * avoids Cross-Origin-Resource-Policy: same-site blocking.
 */
export function resolveMediaUrl(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return '';

  if (/^(?:data:|blob:)/i.test(raw)) return raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const dashboardApi = new URL(env.apiBaseUrl);
      const host = url.host.toLowerCase();

      // Anything physically served by MobileBackend must go through the proxy,
      // regardless of whether its path is /uploads, /media, /api/files, etc.
      if (host === MOBILE_MEDIA_HOST) {
        return toDashboardMediaProxy(url.pathname, url.search, url.hash);
      }

      // Old dashboard responses sometimes contain absolute /uploads URLs that
      // point at DashboardBackend even though the file physically lives on mobile.
      if (host === dashboardApi.host.toLowerCase() && /^\/uploads(?:\/|$)/i.test(url.pathname)) {
        return toDashboardMediaProxy(url.pathname, url.search, url.hash);
      }

      return raw;
    } catch {
      return raw;
    }
  }

  let path = raw.replace(/\\/g, '/');
  path = path.replace(/^~\//, '/');
  path = path.replace(/^\/?wwwroot\//i, '/');

  // Relative media values normally come from MobileBackend storage. If the API
  // returned only a filename/subpath, retain the historical /uploads default.
  if (!path.startsWith('/')) {
    if (!/^(?:uploads|media|api)\//i.test(path)) path = `uploads/${path}`;
    path = `/${path}`;
  }

  return toDashboardMediaProxy(path);
}
