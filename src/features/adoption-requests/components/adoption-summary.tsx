import { Clock3, HeartHandshake, Send, ShieldCheck } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { AdoptionRequestFilters, AdoptionRequestSummary } from '../types';

const cards = [
  { key: 'pendingReview' as const, label: 'بانتظار المراجعة', icon: Clock3, patch: { status: 'PENDING_REVIEW' as const }, tone: 'pending' },
  { key: 'published' as const, label: 'منشورة الآن', icon: ShieldCheck, patch: { status: 'PUBLISHED' as const }, tone: 'success' },
  { key: 'pendingApplications' as const, label: 'طلبات بانتظار رد المالك', icon: Send, patch: { status: 'PUBLISHED' as const }, tone: 'info' },
  { key: 'adopted' as const, label: 'تم التبني', icon: HeartHandshake, patch: { status: 'ADOPTED' as const }, tone: 'success' },
];

const toneClasses = {
  pending: 'bg-pending/10 text-brown',
  success: 'bg-success/[0.08] text-success',
  info: 'bg-info/[0.08] text-info',
};

export function AdoptionSummaryCards({ summary, loading, onFilter }: { summary?: AdoptionRequestSummary; loading: boolean; onFilter: (patch: Partial<AdoptionRequestFilters>) => void }) {
  if (loading) return <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Skeleton key={card.key} className="h-[94px] rounded-xl" />)}</div>;
  if (!summary) return null;
  return <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <button key={card.key} type="button" onClick={() => onFilter({ ...card.patch, page: 1 })} className="group rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"><Card className="h-[94px] rounded-xl border border-border/45 bg-white p-3.5 shadow-none transition-[border-color,background-color] duration-200 group-hover:border-primary/25 group-hover:bg-primary/[0.025]"><div className="flex h-full items-center gap-3"><span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg transition-[background-color,color] duration-200 group-hover:bg-primary group-hover:text-primary-foreground', toneClasses[card.tone as keyof typeof toneClasses])}><Icon className="size-4" strokeWidth={1.7}/></span><div className="min-w-0"><p className="text-[12px] text-muted-foreground transition-colors group-hover:text-foreground">{card.label}</p><p className="mt-1 text-[1.55rem] font-semibold leading-none tracking-tight transition-colors group-hover:text-primary">{summary[card.key].toLocaleString('ar-SA-u-nu-latn')}</p></div></div></Card></button>; })}</div>;
}
