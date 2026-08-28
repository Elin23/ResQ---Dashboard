import { Building2, CheckCircle2, Clock3, HeartHandshake, PauseCircle } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { OrganizationFilters, OrganizationSummary } from '../types';

export function OrganizationSummaryCards({ summary, loading, onFilter }: { summary?: OrganizationSummary; loading: boolean; onFilter: (patch: Partial<OrganizationFilters>) => void }) {
  const items = [
    {
      key: 'total',
      label: 'إجمالي الجمعيات',
      value: summary?.total ?? 0,
      icon: Building2,
      tone: 'primary' as const,
      filter: {} satisfies Partial<OrganizationFilters>,
    },
    {
      key: 'pendingVerification',
      label: 'تنتظر التحقق',
      value: summary?.pendingVerification ?? 0,
      icon: Clock3,
      tone: 'pending' as const,
      filter: { status: 'PENDING_VERIFICATION' as const },
    },
    {
      key: 'active',
      label: 'فعالة',
      value: summary?.active ?? 0,
      icon: CheckCircle2,
      tone: 'success' as const,
      filter: { status: 'ACTIVE' as const },
    },
    {
      key: 'suspended',
      label: 'معلقة',
      value: summary?.suspended ?? 0,
      icon: PauseCircle,
      tone: 'critical' as const,
      filter: { status: 'SUSPENDED' as const },
    },
    {
      key: 'withActiveReports',
      label: 'لديها بلاغات نشطة',
      value: summary?.withActiveReports ?? 0,
      icon: HeartHandshake,
      tone: 'info' as const,
      filter: { activeReports: 'YES' as const },
    },
  ];

  // Organization metrics share the same interaction and hierarchy as other page summaries.
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) =>
        loading ? (
          <SummaryCardSkeleton key={item.key} />
        ) : (
          <SummaryCard
            key={item.key}
            label={item.label}
            value={item.value.toLocaleString('ar-SA-u-nu-latn')}
            icon={item.icon}
            tone={item.tone}
            onClick={() => onFilter({ ...item.filter, page: 1 })}
          />
        ),
      )}
    </div>
  );
}
