import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { safeDate, safeFormatDate } from '@/lib/runtime-safety';
import type { SupportRelatedResourceType } from '../types';

export const formatSupportRelative = (value: string) => {
  const d = safeDate(value);

  return d
    ? formatDistanceToNow(d, { addSuffix: true, locale: ar })
    : '—';
};

export const formatSupportDate = (value: string) =>
  safeFormatDate(value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

// Route each related resource to its corresponding admin details page.
export function relatedResourcePath(type: SupportRelatedResourceType, id: string) {
  return {
    REPORT: `/reports/${id}`,
    ADOPTION_REQUEST: `/adoption-requests/${id}`,
    ORGANIZATION: `/organizations/${id}`,
    DONATION: `/donations/${id}`,
    ADVERTISEMENT: `/advertisements/${id}`,
  }[type];
}

export function elapsedMinutes(value: string) {
  const d = safeDate(value);

  return d
    ? Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000))
    : 0;
}