import { safeFormatDate } from '@/lib/runtime-safety';

// Convert a title into a URL-friendly slug and keep a fallback for empty results.
export function slugifyTitle(title: string) {
  return (
    String(title ?? '')
      .normalize('NFKD')
      .replace(/[\u0600-\u06FF]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `content-${Date.now()}`
  );
}

export function formatEditorialDate(value?: string) {
  return safeFormatDate(value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Clean duplicate or empty tags and keep the list within the editor limit.
export function normalizeTags(tags: string[]) {
  return [
    ...new Set(
      (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag ?? '').trim())
        .filter(Boolean),
    ),
  ].slice(0, 8);
}