import { Ambulance, CircleCheck, Inbox, UsersRound } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { ReportFilters, ReportSummary } from '../types';

const items = [
  {
    key: 'todayCount' as const,
    label: 'بلاغات اليوم',
    icon: Inbox,
    tone: 'primary' as const,
    patch: {} satisfies Partial<ReportFilters>,
  },
  {
    key: 'unassignedCount' as const,
    label: 'بدون جمعية',
    icon: UsersRound,
    tone: 'pending' as const,
    patch: { organizationId: 'UNASSIGNED' } satisfies Partial<ReportFilters>,
  },
  {
    key: 'enRouteCount' as const,
    label: 'فرق في الطريق',
    icon: Ambulance,
    tone: 'info' as const,
    patch: { status: 'EN_ROUTE' } satisfies Partial<ReportFilters>,
  },
  {
    key: 'receivedTodayCount' as const,
    label: 'تم استلامها اليوم',
    icon: CircleCheck,
    tone: 'success' as const,
    patch: { status: 'RECEIVED' } satisfies Partial<ReportFilters>,
  },
];

export function ReportsSummaryCards({ summary, loading, onFilter }: { summary?: ReportSummary; loading: boolean; onFilter: (patch: Partial<ReportFilters>) => void }) {
  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <SummaryCardSkeleton key={item.key} />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Summary cards double as shortcuts to the matching operational queue.
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <SummaryCard
          key={item.key}
          label={item.label}
          value={summary[item.key].toLocaleString('ar-SA-u-nu-latn')}
          icon={item.icon}
          tone={item.tone}
          onClick={() => onFilter({ ...item.patch, page: 1 })}
        />
      ))}
    </div>
  );
}
