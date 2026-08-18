import { Ambulance, CircleCheck, Inbox, UsersRound } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import type { ReportFilters, ReportSummary } from '../types';

const items = [
  { key: 'todayCount' as const, label: 'بلاغات اليوم', icon: Inbox, patch: {} satisfies Partial<ReportFilters> },
  { key: 'unassignedCount' as const, label: 'بدون جمعية', icon: UsersRound, patch: { organizationId: 'UNASSIGNED' } satisfies Partial<ReportFilters> },
  { key: 'enRouteCount' as const, label: 'فرق في الطريق', icon: Ambulance, patch: { status: 'EN_ROUTE' } satisfies Partial<ReportFilters> },
  { key: 'receivedTodayCount' as const, label: 'تم استلامها اليوم', icon: CircleCheck, patch: { status: 'RECEIVED' } satisfies Partial<ReportFilters> },
];

export function ReportsSummaryCards({
  summary,
  loading,
  onFilter,
}: {
  summary?: ReportSummary;
  loading: boolean;
  onFilter: (patch: Partial<ReportFilters>) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Skeleton key={item.key} className="h-[86px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            className="group flex h-[86px] items-center gap-3 rounded-xl border border-border/45 bg-white px-4 text-start transition-colors duration-150 hover:border-primary/20 hover:bg-primary/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            onClick={() => onFilter({ ...item.patch, page: 1 })}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/[0.08] group-hover:text-primary">
              <Icon className="size-4" strokeWidth={1.65} />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-normal text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-[1.45rem] font-semibold leading-none tracking-tight text-foreground">
                {summary[item.key].toLocaleString('ar-SA-u-nu-latn')}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
