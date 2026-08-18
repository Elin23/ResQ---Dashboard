import { ShieldAlert, UserCheck, UsersRound } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import type { UserFilters, UserSummary } from '../types';

const numberFormatter = new Intl.NumberFormat('ar-SA-u-nu-latn');

export function UserSummaryCards({
  summary,
  loading,
  onFilter,
}: {
  summary?: UserSummary;
  loading: boolean;
  onFilter: (patch: Partial<UserFilters>) => void;
}) {
  const cards = [
    {
      key: 'total',
      label: 'إجمالي المستخدمين',
      value: summary?.total ?? 0,
      helper: 'جميع الحسابات المسجلة',
      icon: UsersRound,
      patch: {} satisfies Partial<UserFilters>,
      tone: 'bg-primary/[0.07] text-primary',
    },
    {
      key: 'active',
      label: 'الحسابات النشطة',
      value: summary?.active ?? 0,
      helper: 'الحسابات المتاحة للاستخدام',
      icon: UserCheck,
      patch: { accountStatus: 'ACTIVE' as const },
      tone: 'bg-success/[0.08] text-success',
    },
    {
      key: 'suspended',
      label: 'الحسابات المعلّقة',
      value: summary?.suspended ?? 0,
      helper: summary?.blocked
        ? `${numberFormatter.format(summary.blocked)} حساب محظور إضافي`
        : 'لا توجد حسابات محظورة',
      icon: ShieldAlert,
      patch: { accountStatus: 'SUSPENDED' as const },
      tone: 'bg-pending/10 text-brown',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-3">
        {cards.map((card) => (
          <Skeleton key={card.key} className="h-[94px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.key}
            type="button"
            className="group text-start focus-visible:outline-none"
            onClick={() => onFilter({ ...card.patch, page: 1 })}
          >
            <Card className="h-[94px] rounded-xl border-border/45 bg-white p-3.5 shadow-none transition-[border-color,background-color] duration-200 group-hover:border-primary/25 group-hover:bg-primary/[0.025] group-focus-visible:ring-2 group-focus-visible:ring-primary/20">
              <div className="flex h-full items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-normal text-muted-foreground transition-colors group-hover:text-foreground">
                    {card.label}
                  </p>
                  <p className="mt-1 text-[1.55rem] font-semibold leading-none text-foreground transition-colors group-hover:text-primary">
                    {numberFormatter.format(card.value)}
                  </p>
                  <p className="mt-2 truncate text-[11px] font-normal text-muted-foreground/80">
                    {card.helper}
                  </p>
                </div>

                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.tone} transition-[background-color,color] duration-200 group-hover:bg-primary group-hover:text-primary-foreground`}
                >
                  <Icon className="size-4" strokeWidth={1.7} />
                </span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
