import { Clock3, HeartHandshake, Send, ShieldCheck } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { AdoptionRequestFilters, AdoptionRequestSummary } from '../types';

const cards = [
  {
    key: 'pendingReview' as const,
    label: 'بانتظار المراجعة',
    icon: Clock3,
    patch: { status: 'PENDING_REVIEW' as const },
    tone: 'pending' as const,
  },
  {
    key: 'published' as const,
    label: 'منشورة الآن',
    icon: ShieldCheck,
    patch: { status: 'PUBLISHED' as const },
    tone: 'success' as const,
  },
  {
    key: 'pendingApplications' as const,
    label: 'طلبات بانتظار رد المالك',
    icon: Send,
    patch: { status: 'PUBLISHED' as const },
    tone: 'info' as const,
  },
  {
    key: 'adopted' as const,
    label: 'تم التبني',
    icon: HeartHandshake,
    patch: { status: 'ADOPTED' as const },
    tone: 'success' as const,
  },
];

export function AdoptionSummaryCards({ summary, loading, onFilter }: { summary?: AdoptionRequestSummary; loading: boolean; onFilter: (patch: Partial<AdoptionRequestFilters>) => void }) {
  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCardSkeleton key={card.key} />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Keep adoption metrics visually aligned with the rest of the admin dashboard.
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          value={summary[card.key].toLocaleString('ar-SA-u-nu-latn')}
          icon={card.icon}
          tone={card.tone}
          onClick={() => onFilter({ ...card.patch, page: 1 })}
        />
      ))}
    </div>
  );
}
