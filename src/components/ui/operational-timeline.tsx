import { cn } from '@/lib/cn';
import type { StatusTone } from '@/lib/statuses';

export interface OperationalTimelineItem { id: string; title: string; actor?: string; timestampLabel: string; details?: string; tone?: StatusTone; }
export function OperationalTimeline({ items }: { items: OperationalTimelineItem[] }) {
  const toneClass: Record<StatusTone, string> = { neutral:'bg-muted-foreground', success:'bg-success', pending:'bg-pending', critical:'bg-critical', info:'bg-info' };
  return <ol className="space-y-0">{items.map((item, index) => <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0"><div className="relative flex w-4 shrink-0 justify-center"><span className={cn('relative z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-surface', toneClass[item.tone ?? 'neutral'])} />{index < items.length - 1 && <span className="absolute top-4 h-full border-s" aria-hidden="true" />}</div><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start"><p className="font-semibold">{item.title}</p><time className="shrink-0 text-xs text-muted-foreground">{item.timestampLabel}</time></div>{item.actor && <p className="mt-0.5 text-xs text-muted-foreground">بواسطة {item.actor}</p>}{item.details && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.details}</p>}</div></li>)}</ol>;
}
