import { getAdvertisements } from '@/features/advertisements/services/advertisements.mock';
import { advertisementPlacementConfig } from '@/features/advertisements/constants';
import { getSupportTickets } from '@/features/support/services/support.mock';
import { supportCategoryLabels } from '@/features/support/constants';
import { average, minutesBetween } from '../utils';
import type { AnalyticsFilters, NamedValue, SupplementalManagementReports } from '../types';

function countNamed<T extends string>(values: T[], label: (key: T) => string): NamedValue[] {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()]
    .map(([key, value]) => ({ key, label: label(key), value }))
    .sort((a, b) => b.value - a.value);
}

export async function getSupplementalManagementReports(
  filters: AnalyticsFilters,
  options: { includeAdvertisements: boolean; includeSupport: boolean },
): Promise<SupplementalManagementReports> {
  const [advertisementResult, supportResult] = await Promise.all([
    options.includeAdvertisements
      ? getAdvertisements({
          search: '',
          dateFrom: filters.from,
          dateTo: filters.to,
          governorate: filters.governorate,
          page: 1,
          pageSize: 100,
          sortBy: 'updatedAt',
          sortDirection: 'desc',
        })
      : Promise.resolve(undefined),
    options.includeSupport
      ? getSupportTickets({
          search: '',
          dateFrom: filters.from,
          dateTo: filters.to,
          page: 1,
          pageSize: 100,
          sortBy: 'updatedAt',
          sortDirection: 'desc',
        })
      : Promise.resolve(undefined),
  ]);

  const advertisements = advertisementResult
    ? (() => {
        const items = advertisementResult.items;
        const totalImpressions = items.reduce((sum, item) => sum + (item.performance?.impressions ?? 0), 0);
        const totalClicks = items.reduce((sum, item) => sum + (item.performance?.clicks ?? 0), 0);
        return {
          total: advertisementResult.total,
          pendingReview: items.filter((item) => item.status === 'PENDING_REVIEW').length,
          scheduled: items.filter((item) => item.status === 'SCHEDULED').length,
          active: items.filter((item) => item.status === 'ACTIVE').length,
          paused: items.filter((item) => item.status === 'PAUSED').length,
          rejected: items.filter((item) => item.status === 'REJECTED').length,
          totalImpressions,
          totalClicks,
          clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : undefined,
          byPlacement: countNamed(items.map((item) => item.placement), (key) => advertisementPlacementConfig[key].label),
          rows: items.slice(0, 10).map((item) => ({
            id: item.id,
            title: item.title,
            advertiser: item.advertiser.name,
            placement: advertisementPlacementConfig[item.placement].label,
            status: item.status,
            impressions: item.performance?.impressions,
            clicks: item.performance?.clicks,
            clickThroughRate: item.performance?.clickThroughRate,
          })),
        };
      })()
    : undefined;

  const support = supportResult
    ? (() => {
        const items = supportResult.items;
        const firstResponseMinutes = items
          .map((item) => minutesBetween(item.createdAt, item.firstResponseAt))
          .filter((value): value is number => value !== undefined && value >= 0);
        return {
          total: supportResult.total,
          newCount: items.filter((item) => item.status === 'NEW').length,
          openCount: items.filter((item) => item.status === 'OPEN').length,
          urgentCount: items.filter((item) => item.priority === 'URGENT' && !['RESOLVED', 'CLOSED'].includes(item.status)).length,
          waitingForUser: items.filter((item) => item.status === 'WAITING_FOR_USER').length,
          waitingForInternal: items.filter((item) => item.status === 'WAITING_FOR_INTERNAL').length,
          resolved: items.filter((item) => item.status === 'RESOLVED').length,
          closed: items.filter((item) => item.status === 'CLOSED').length,
          averageFirstResponseMinutes: average(firstResponseMinutes),
          byCategory: countNamed(items.map((item) => item.category), (key) => supportCategoryLabels[key]),
        };
      })()
    : undefined;

  return { advertisements, support };
}
