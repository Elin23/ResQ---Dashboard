import { useCallback } from 'react';
import { BarChart3, FileText, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Button, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { usePermission } from '@/features/auth/rbac';
import type { AdoptionAnimalSpecies } from '@/features/adoption-requests/types';
import type { AnalyticsFilters, AnalyticsRangePreset, ManagementReportKey } from '../types';
import { rangeDates } from '../utils';
import { useAnalytics } from '../hooks';
import { AnalyticsFilterPanel } from '../components/analytics-filter-panel';
import { AnalyticsDashboardView } from '../components/analytics-dashboard-view';
import { ManagementReportsView } from '../components/management-reports-view';

const validRanges: AnalyticsRangePreset[] = ['today', '7d', '30d', 'month', '3m', 'year', 'custom'];
const validViews = ['reports', 'analytics'] as const;
type AnalyticsView = (typeof validViews)[number];
const validReportKeys: ManagementReportKey[] = ['reports', 'rescue', 'adoption', 'organizations', 'donations'];

function filtersFrom(params: URLSearchParams): AnalyticsFilters {
  const candidate = params.get('range') as AnalyticsRangePreset | null;
  const range = candidate && validRanges.includes(candidate) ? candidate : '30d';
  const dates = rangeDates(range, params.get('from') ?? undefined, params.get('to') ?? undefined);
  return {
    range,
    from: params.get('from') ?? dates.from,
    to: params.get('to') ?? dates.to,
    governorate: params.get('governorate') ?? undefined,
    organizationId: params.get('organizationId') ?? undefined,
    species: (params.get('species') ?? undefined) as AdoptionAnimalSpecies | undefined,
  };
}

function viewFrom(params: URLSearchParams): AnalyticsView {
  const candidate = params.get('view') as AnalyticsView | null;
  return candidate && validViews.includes(candidate) ? candidate : 'reports';
}

function reportFrom(params: URLSearchParams): ManagementReportKey {
  const candidate = params.get('report') as ManagementReportKey | null;
  return candidate && validReportKeys.includes(candidate) ? candidate : 'reports';
}

function paramsFrom(filters: AnalyticsFilters, current: URLSearchParams) {
  const next = new URLSearchParams();
  const view = viewFrom(current);
  next.set('view', view);
  if (view === 'reports') next.set('report', reportFrom(current));
  next.set('range', filters.range);
  if (filters.range === 'custom') {
    next.set('from', filters.from);
    next.set('to', filters.to);
  }
  if (filters.governorate) next.set('governorate', filters.governorate);
  if (filters.organizationId) next.set('organizationId', filters.organizationId);
  if (filters.species) next.set('species', filters.species);
  return next;
}

export function AnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFrom(params);
  const view = viewFrom(params);
  const reportKey = reportFrom(params);
  const canDonations = usePermission('donations.read');
  const canOperational = usePermission('reports:view');
  const query = useAnalytics(filters, canOperational ? 'OPERATIONS' : 'FINANCE', false);

  const updateFilters = useCallback((patch: Partial<AnalyticsFilters>) => {
    let next = { ...filters, ...patch };
    if (patch.range && patch.range !== 'custom') next = { ...next, ...rangeDates(patch.range) };
    setParams(paramsFrom(next, params));
  }, [filters, params, setParams]);

  const setView = (nextView: AnalyticsView) => {
    const next = new URLSearchParams(params);
    next.set('view', nextView);
    if (nextView === 'reports' && !next.get('report')) next.set('report', canOperational ? 'reports' : 'donations');
    setParams(next);
  };

  const setReport = (key: ManagementReportKey) => {
    const next = new URLSearchParams(params);
    next.set('view', 'reports');
    next.set('report', key);
    setParams(next);
  };

  const refresh = () => void query.refetch();

  if (query.isError && !query.data) {
    return <ErrorState title="تعذر تحميل التقارير" description={query.error.message} onRetry={refresh} />;
  }

  const data = query.data;

  return <div dir="rtl" className="space-y-6 pb-6 print:bg-white">
    <PageHeader
      title="التقارير"
      description="تقارير إدارية قابلة للتصدير عن البلاغات وعمليات الإنقاذ والتبني والجمعيات والتبرعات، مع قسم إحصائيات منفصل للقراءة السريعة."
      breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'التقارير' }]}
      actions={<Button className="h-9 rounded-xl text-[12px] print:hidden" variant="secondary" onClick={refresh} disabled={query.isFetching}><RefreshCw className="size-4" />تحديث</Button>}
    />

    <div className="flex w-fit items-center gap-1 rounded-xl border border-border/45 bg-white p-1 print:hidden">
      <button type="button" onClick={() => setView('reports')} className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-[12px] font-medium transition-colors ${view === 'reports' ? 'bg-primary/[0.08] text-primary' : 'text-muted-foreground hover:bg-muted/45 hover:text-foreground'}`}><FileText className="size-4" />التقارير الإدارية</button>
      <button type="button" onClick={() => setView('analytics')} className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-[12px] font-medium transition-colors ${view === 'analytics' ? 'bg-primary/[0.08] text-primary' : 'text-muted-foreground hover:bg-muted/45 hover:text-foreground'}`}><BarChart3 className="size-4" />الإحصائيات</button>
    </div>

    <AnalyticsFilterPanel filters={filters} onChange={updateFilters} context={view} reportKey={reportKey} />

    {!data ? <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[94px] rounded-xl" />)}</div> : view === 'reports' ? <ManagementReportsView data={data} filters={filters} reportKey={reportKey} onReportKeyChange={setReport} canDonations={canDonations} canOperational={canOperational} /> : <AnalyticsDashboardView data={data} filters={filters} canOperational={canOperational} canDonations={canDonations} />}

    {data && <p className="text-[11px] text-muted-foreground/70 print:hidden">آخر تحديث: {new Date(data.generatedAt).toLocaleString('ar-SY-u-nu-latn')}</p>}
  </div>;
}
