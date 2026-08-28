import { ShieldAlert, UserCheck, UsersRound } from 'lucide-react';

import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';

import type { UserFilters, UserSummary } from '../types';

const numberFormatter = new Intl.NumberFormat('ar-SA-u-nu-latn');

export function UserSummaryCards({ summary, loading, onFilter }: { summary?: UserSummary; loading: boolean; onFilter: (patch: Partial<UserFilters>) => void }) {
  const cards = [
    {
      key: 'total',
      label: 'إجمالي المستخدمين',
      value: summary?.total ?? 0,
      helper: 'جميع الحسابات المسجلة',
      icon: UsersRound,
      patch: {} satisfies Partial<UserFilters>,
      tone: 'primary' as const,
    },
    {
      key: 'active',
      label: 'الحسابات النشطة',
      value: summary?.active ?? 0,
      helper: 'الحسابات المتاحة للاستخدام',
      icon: UserCheck,
      patch: { accountStatus: 'ACTIVE' as const },
      tone: 'success' as const,
    },
    {
      key: 'suspended',
      label: 'الحسابات المعلّقة',
      value: summary?.suspended ?? 0,
      helper: summary?.blocked
        ? `${numberFormatter.format(summary.blocked)} حساب محظور`
        : 'لا توجد حسابات محظورة',
      icon: ShieldAlert,
      patch: { accountStatus: 'SUSPENDED' as const },
      tone: 'pending' as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-3">
        {cards.map((card) => (
          <SummaryCardSkeleton key={card.key} />
        ))}
      </div>
    );
  }

  // Keep the summary focused on the primary account states used most often.
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          value={numberFormatter.format(card.value)}
          helper={card.helper}
          icon={card.icon}
          tone={card.tone}
          onClick={() => onFilter({ ...card.patch, page: 1 })}
        />
      ))}
    </div>
  );
}
