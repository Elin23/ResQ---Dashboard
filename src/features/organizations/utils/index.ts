import { format, formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';

import { safeDate } from '@/lib/runtime-safety';

import type { OrganizationFilters } from '../types';

export const formatOrganizationDate = (value: string) => {
  const date = safeDate(value);

  return date
    ? format(date, 'd MMMM yyyy', { locale: ar })
    : '—';
};

export const formatOrganizationRelative = (value: string) => {
  const date = safeDate(value);

  return date
    ? formatDistanceToNowStrict(date, {
        locale: ar,
        addSuffix: true,
      })
    : '—';
};

// Ignore pagination and sorting when checking for active filters.
export const hasOrganizationFilters = (f: OrganizationFilters) =>
  Boolean(
    f.search ||
      f.status ||
      f.verificationStatus ||
      f.governorate ||
      f.service ||
      f.activeReports ||
      f.dateFrom ||
      f.dateTo,
  );