import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { AdoptionRequestFilters } from '../types';
import { safeDate } from '@/lib/runtime-safety';

export const formatAdoptionDate = (value: string) => {
  const date = safeDate(value);
  return date ? format(date, 'd MMMM yyyy، HH:mm', { locale: ar }) : '—';
};

export const formatAdoptionRelative = (value: string) => {
  const date = safeDate(value);
  return date ? formatDistanceToNow(date, { locale: ar, addSuffix: true }) : '—';
};

export function hasAdoptionFilters(filters: AdoptionRequestFilters) {
  return Boolean(filters.search || filters.status || filters.species || filters.publisherType || filters.organizationId || filters.city || filters.userId);
}

export function formatEstimatedAge(months?: number) {
  if (months === undefined) return 'غير محدد';
  if (months < 12) return `${months} شهر`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} سنة و${rest} شهر` : `${years} سنة`;
}
