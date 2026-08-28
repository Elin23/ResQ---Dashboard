import { CalendarClock, CheckCircle2, FilePenLine, Layers3, TriangleAlert } from 'lucide-react';

import { Card, Skeleton } from '@/components/ui';

import type { NotificationSummary } from '../types';

const items = [
  ['scheduled', 'مجدولة', CalendarClock],
  ['sentToday', 'تم إرسالها اليوم', CheckCircle2],
  ['partiallySent', 'فشلت جزئيًا', TriangleAlert],
  ['drafts', 'مسودات', FilePenLine],
  ['activeTemplates', 'قوالب تلقائية فعالة', Layers3],
] as const;

export function NotificationSummaryCards({ summary, loading, onFilter }: { summary?: NotificationSummary; loading: boolean; onFilter: (status?: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() =>
            onFilter(
              key === 'scheduled'
                ? 'SCHEDULED'
                : key === 'partiallySent'
                  ? 'PARTIALLY_SENT'
                  : key === 'drafts'
                    ? 'DRAFT'
                    : undefined,
            )
          }
          className="text-start"
        >
          <Card className="h-full transition hover:border-primary/30 hover:bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {label}
                </p>

                {loading ? (
                  <Skeleton className="mt-2 h-8 w-14" />
                ) : (
                  <p className="mt-2 text-2xl font-bold">
                    {summary?.[key] ?? 0}
                  </p>
                )}
              </div>

              {/* Keep each summary card visually tied to its notification state. */}
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="size-5" />
              </span>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}