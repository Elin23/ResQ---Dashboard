import { CalendarClock, CheckCircle2, FilePenLine, Layers3, TriangleAlert } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { NotificationSummary } from '../types';

const items = [
  {
    key: 'scheduled' as const,
    label: 'مجدولة',
    icon: CalendarClock,
    tone: 'info' as const,
    filter: 'SCHEDULED',
  },
  {
    key: 'sentToday' as const,
    label: 'تم إرسالها اليوم',
    icon: CheckCircle2,
    tone: 'success' as const,
    filter: undefined,
  },
  {
    key: 'partiallySent' as const,
    label: 'فشلت جزئيًا',
    icon: TriangleAlert,
    tone: 'critical' as const,
    filter: 'PARTIALLY_SENT',
  },
  {
    key: 'drafts' as const,
    label: 'مسودات',
    icon: FilePenLine,
    tone: 'neutral' as const,
    filter: 'DRAFT',
  },
  {
    key: 'activeTemplates' as const,
    label: 'قوالب تلقائية فعالة',
    icon: Layers3,
    tone: 'primary' as const,
    filter: undefined,
  },
];

export function NotificationSummaryCards({ summary, loading, onFilter }: { summary?: NotificationSummary; loading: boolean; onFilter: (status?: string) => void }) {
  // Notification metrics remain useful shortcuts while matching the shared KPI treatment.
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) =>
        loading ? (
          <SummaryCardSkeleton key={item.key} />
        ) : (
          <SummaryCard
            key={item.key}
            label={item.label}
            value={(summary?.[item.key] ?? 0).toLocaleString('ar-SA-u-nu-latn')}
            icon={item.icon}
            tone={item.tone}
            onClick={() => onFilter(item.filter)}
          />
        ),
      )}
    </div>
  );
}
