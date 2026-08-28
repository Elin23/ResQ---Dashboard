import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type SummaryCardTone =
  | 'primary'
  | 'neutral'
  | 'success'
  | 'pending'
  | 'critical'
  | 'info';

const toneClasses: Record<SummaryCardTone, string> = {
  primary: 'bg-primary/[0.08] text-primary',
  neutral: 'bg-muted/60 text-muted-foreground',
  success: 'bg-success/[0.09] text-success',
  pending: 'bg-pending/10 text-brown',
  critical: 'bg-critical/[0.09] text-critical',
  info: 'bg-info/[0.09] text-info',
};

export interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  helper?: ReactNode;
  tone?: SummaryCardTone;
  onClick?: () => void;
  className?: string;
}

export function SummaryCard({ label, value, icon: Icon, helper, tone = 'neutral', onClick, className }: SummaryCardProps) {
  const content = (
    <div
      className={cn(
        'group relative flex h-full min-h-[94px] items-center gap-3.5 overflow-hidden rounded-xl border border-border/45 bg-white p-3.5 text-start shadow-none transition-[border-color,background-color,transform] duration-200 hover:border-primary/25 hover:bg-primary/[0.025]',
        onClick && 'hover:-translate-y-0.5',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-200',
          toneClasses[tone],
          'group-hover:scale-[1.04] group-hover:bg-primary group-hover:text-primary-foreground',
        )}
      >
        <Icon className="size-4" strokeWidth={1.7} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-normal leading-5 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
          {label}
        </p>

        <div className="mt-1 flex min-w-0 items-end gap-2">
          <p className="shrink-0 text-[1.55rem] font-semibold leading-none tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            {value}
          </p>

          {helper && (
            <div className="min-w-0 truncate pb-0.5 text-[11px] leading-4 text-muted-foreground/75">
              {helper}
            </div>
          )}
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-right scale-x-0 bg-gradient-to-l from-transparent via-primary/45 to-transparent transition-transform duration-200 group-hover:scale-x-100"
        aria-hidden="true"
      />
    </div>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </button>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="flex min-h-[94px] items-center gap-3.5 rounded-xl border border-border/35 bg-white p-3.5">
      <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted/70" />

      <div className="min-w-0 flex-1">
        <div className="h-3.5 w-24 animate-pulse rounded-md bg-muted/70" />
        <div className="mt-2 h-6 w-14 animate-pulse rounded-md bg-muted/70" />
      </div>
    </div>
  );
}
