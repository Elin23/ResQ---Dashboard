import { CircleCheck, CircleDot, Clock3, MessageCircleQuestion, ShieldAlert, UserRoundX } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { SupportSummary } from '../types';

const cards = [
  {
    key: 'newCount' as const,
    label: 'طلبات جديدة',
    filter: 'NEW',
    icon: MessageCircleQuestion,
    tone: 'pending' as const,
  },
  {
    key: 'openCount' as const,
    label: 'مفتوحة',
    filter: 'OPEN',
    icon: CircleDot,
    tone: 'info' as const,
  },
  {
    key: 'urgentCount' as const,
    label: 'عاجلة',
    filter: 'URGENT',
    icon: ShieldAlert,
    tone: 'critical' as const,
  },
  {
    key: 'waitingForUser' as const,
    label: 'بانتظار المستخدم',
    filter: 'WAITING_FOR_USER',
    icon: Clock3,
    tone: 'pending' as const,
  },
  {
    key: 'unassigned' as const,
    label: 'غير مسندة',
    filter: 'UNASSIGNED',
    icon: UserRoundX,
    tone: 'neutral' as const,
  },
  {
    key: 'resolvedToday' as const,
    label: 'تم حلها اليوم',
    filter: 'RESOLVED',
    icon: CircleCheck,
    tone: 'success' as const,
  },
];

// Support metrics remain actionable shortcuts to the corresponding queue state.
export function SupportSummaryCards({ summary, loading, onFilter }: { summary?: SupportSummary; loading: boolean; onFilter: (key: string) => void }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-6">
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
            onClick={() => onFilter(card.filter)}
          />
        ),
      )}
    </div>
  );
}
