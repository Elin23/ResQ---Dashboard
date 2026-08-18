export const DISPLAY_FALLBACK = '—';

export function safeDisplayText(value: unknown, fallback = DISPLAY_FALLBACK): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

export function safeFiniteNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function isValidDateValue(value: unknown): value is string | number | Date {
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime());
}

export function safeDate(value: unknown): Date | null {
  if (!isValidDateValue(value)) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function safeFormatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions,
  fallback = DISPLAY_FALLBACK,
  locale = 'ar-SY-u-nu-latn',
): string {
  const date = safeDate(value);
  if (!date) return fallback;
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return fallback;
  }
}

export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  const lat = typeof latitude === 'number' ? latitude : Number(latitude);
  const lng = typeof longitude === 'number' ? longitude : Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
