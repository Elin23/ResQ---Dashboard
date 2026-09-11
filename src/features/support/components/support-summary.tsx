import { CircleCheck, CircleDot, Layers3, PauseCircle, ShieldAlert, Workflow } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';
import type { SupportSummary } from '../types';

const cards = [
  { key: 'total' as const, label: 'إجمالي التذاكر', filter: undefined, icon: Layers3, tone: 'neutral' as const },
  { key: 'open' as const, label: 'مفتوحة', filter: 'OPEN', icon: CircleDot, tone: 'info' as const },
  { key: 'inProgress' as const, label: 'قيد المعالجة', filter: 'IN_PROGRESS', icon: Workflow, tone: 'pending' as const },
  { key: 'urgent' as const, label: 'عاجلة', filter: 'URGENT', icon: ShieldAlert, tone: 'critical' as const },
  { key: 'resolved' as const, label: 'تم حلها', filter: 'RESOLVED', icon: CircleCheck, tone: 'success' as const },
  { key: 'closed' as const, label: 'مغلقة', filter: 'CLOSED', icon: PauseCircle, tone: 'neutral' as const },
];

export function SupportSummaryCards({ summary, loading, onFilter }: { summary?: SupportSummary; loading: boolean; onFilter: (key: string) => void }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => loading ? (
        <SummaryCardSkeleton key={card.key} />
      ) : (
        <SummaryCard
          key={card.key}
          label={card.label}
          value={(summary?.[card.key] ?? 0).toLocaleString('ar-SA-u-nu-latn')}
          icon={card.icon}
          tone={card.tone}
          onClick={card.filter ? () => onFilter(card.filter!) : undefined}
        />
      ))}
    </div>
  );
}
