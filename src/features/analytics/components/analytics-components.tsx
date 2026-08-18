import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { SectionHeader } from '@/components/ui';
import type { ComparisonMetric } from '../types';
import { formatInteger, formatPercent } from '../utils';

export function TrendBadge({ metric }: { metric: ComparisonMetric }) {
  if (metric.percentageChange === undefined) return <span className="text-[11px] text-muted-foreground/70">لا تتوفر مقارنة</span>;
  const change = metric.percentageChange;
  const favorable = metric.meaning === 'NEUTRAL' ? undefined : metric.meaning === 'HIGHER_IS_BETTER' ? change > 0 : change < 0;
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
  return <span className={favorable === true ? 'text-success' : favorable === false ? 'text-critical' : 'text-muted-foreground'}><span className="inline-flex items-center gap-1 text-[11px]"><Icon className="size-3" />{formatPercent(Math.abs(change))} عن الفترة السابقة</span></span>;
}

export function AnalyticsMetric({ label, metric, valueFormatter = formatInteger, helper }: { label: string; metric: ComparisonMetric; valueFormatter?: (value: number) => string; helper?: string }) {
  return <div className="min-h-[94px] rounded-xl border border-border/45 bg-white p-3.5 shadow-none"><p className="text-[12px] font-normal text-muted-foreground">{label}</p><p className="mt-2 text-[22px] font-semibold leading-none text-foreground">{valueFormatter(metric.value)}</p><div className="mt-2"><TrendBadge metric={metric} /></div>{helper && <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground/70">{helper}</p>}</div>;
}

export function AnalyticsSection({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-24 space-y-4"><SectionHeader title={title} description={description} />{children}</section>;
}

export function SimpleMetricGrid({ items }: { items: Array<{ label: string; value: string | number; helper?: string }> }) {
  return <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <div key={item.label} className="min-h-[88px] rounded-xl border border-border/45 bg-white p-3.5 shadow-none"><p className="text-[12px] font-normal text-muted-foreground">{item.label}</p><p className="mt-2 text-[21px] font-semibold leading-none text-foreground">{item.value}</p>{item.helper && <p className="mt-2 text-[11px] leading-4 text-muted-foreground/70">{item.helper}</p>}</div>)}</div>;
}
