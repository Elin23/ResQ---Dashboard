import { Clock3, MapPinCheck, PauseCircle, RefreshCw } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { FeedingPointFilters, FeedingPointSummary } from '../types';

const cards = [
  {
    key: 'pendingPoints' as const,
    label: 'طلبات نقاط جديدة',
    icon: Clock3,
    tone: 'pending' as const,
    filter: { status: 'PENDING' } satisfies Partial<FeedingPointFilters>,
  },
  {
    key: 'pendingRefills' as const,
    label: 'تعبئات تنتظر التحقق',
    icon: RefreshCw,
    tone: 'info' as const,
    filter: { pendingRefills: true } satisfies Partial<FeedingPointFilters>,
  },
  {
    key: 'activePoints' as const,
    label: 'النقاط النشطة',
    icon: MapPinCheck,
    tone: 'success' as const,
    filter: { status: 'ACTIVE' } satisfies Partial<FeedingPointFilters>,
  },
  {
    key: 'inactivePoints' as const,
    label: 'النقاط المعطلة',
    icon: PauseCircle,
    tone: 'neutral' as const,
    filter: { status: 'INACTIVE' } satisfies Partial<FeedingPointFilters>,
  },
];

export function FeedingPointSummaryCards({ summary, loading, onFilter }: { summary?: FeedingPointSummary; loading: boolean; onFilter: (patch: Partial<FeedingPointFilters>) => void }) {
  // Each card remains a shortcut to its matching queue while sharing one visual system.
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) =>
        loading ? (
          <SummaryCardSkeleton key={card.key} />
        ) : (
          <SummaryCard
            key={card.key}
            label={card.label}
            value={(summary?.[card.key] ?? 0).toLocaleString('ar-SA-u-nu-latn')}
            icon={card.icon}
            tone={card.tone}
            onClick={() => onFilter({ ...card.filter, page: 1 })}
          />
        ),
      )}
    </div>
  );
}
