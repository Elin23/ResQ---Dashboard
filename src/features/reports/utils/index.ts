import { formatDistanceToNowStrict } from 'date-fns';
import { arSA } from 'date-fns/locale';
import type { ReportFilters } from '../types';

export function formatRelativeTime(value: string): string {
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true, locale: arSA });
}

export function hasActiveFilters(filters: ReportFilters): boolean {
  return Boolean(
    filters.search ||
      filters.status ||
      filters.animalType ||
      filters.governorate ||
      filters.organizationId ||
      filters.userId ||
      filters.dateFrom ||
      filters.dateTo,
  );
}

export function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function isTodayIso(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}
