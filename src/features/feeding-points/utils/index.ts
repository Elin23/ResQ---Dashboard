import { format, formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';

import { safeDate } from '@/lib/runtime-safety';

import type { FeedingPointFilters } from '../types';

// Format stored timestamps safely for the Arabic admin interface.
export const formatFeedingPointDate = (value: string) => {
  const date = safeDate(value);

  return date
    ? format(date, 'd MMM yyyy، HH:mm', { locale: ar })
    : '—';
};

export const formatFeedingPointRelative = (value: string) => {
  const date = safeDate(value);

  return date
    ? formatDistanceToNowStrict(date, {
        addSuffix: true,
        locale: ar,
      })
    : '—';
};

// Ignore pagination and sorting when checking whether list filters are active.
export const hasFeedingPointFilters = (filters: FeedingPointFilters) =>
  Boolean(
    filters.search ||
      filters.status ||
      filters.governorate ||
      filters.creatorType ||
      filters.organizationId ||
      filters.pendingRefills !== undefined ||
      filters.hasOpenIssues !== undefined ||
      filters.updatedFrom ||
      filters.updatedTo,
  );