import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { safeDisplayText } from '@/lib/runtime-safety';
import { getStatusMeta, type SemanticStatus, type StatusTone } from '@/lib/statuses';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  const tones: Record<StatusTone, string> = {
    neutral:
      'bg-muted text-muted-foreground',
    success:
      'bg-success/10 text-success',
    pending:
      'bg-pending/12 text-brown',
    critical:
      'bg-critical/10 text-critical',
    info:
      'bg-info/10 text-info',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: SemanticStatus;
}) {
  const meta = getStatusMeta(status);

  return (
    <Badge tone={meta.tone}>
      {meta.label}
    </Badge>
  );
}

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/45 bg-white p-4 shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  helper,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  helper?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/35 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight">
            {value}
          </p>

          {helper && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {helper}
            </p>
          )}
        </div>

        {Icon && (
          <span className="rounded-xl border border-primary/10 bg-primary/10 p-2.5 text-primary">
            <Icon className="size-5" />
          </span>
        )}
      </div>
    </Card>
  );
}

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const displayName = safeDisplayText(name, 'مستخدم');

  const initials =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .filter(Boolean)
      .join('') || '؟';

  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12',
  };

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return src && !imageFailed ? (
    <img
      src={src}
      alt={displayName}
      onError={() => setImageFailed(true)}
      className={cn(
        'rounded-full object-cover',
        sizes[size],
      )}
    />
  ) : (
    <span
      role="img"
      aria-label={displayName}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/12 font-bold text-primary',
        sizes[size],
      )}
    >
      {initials}
    </span>
  );
}

export function Tooltip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-50 rounded-lg bg-brown px-2.5 py-1.5 text-xs text-white shadow-overlay"
          >
            {content}

            <TooltipPrimitive.Arrow className="fill-brown" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

