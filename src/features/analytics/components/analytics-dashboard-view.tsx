import type { AnalyticsFilters, AnalyticsResponse } from '../types';
import { formatAnalyticsMoney, formatInteger, formatPercent } from '../utils';
import { AnalyticsMetric } from './analytics-components';
import { ChartCard, DistributionChart, DonationTrendChart, RankedBarChart, TimeSeriesChart } from './analytics-charts';

export function AnalyticsDashboardView({ data, filters, canOperational, canDonations }: {
  data: AnalyticsResponse;
  filters: AnalyticsFilters;
  canOperational: boolean;
  canDonations: boolean;
}) {
  return <div className="space-y-5">
    <div className="rounded-xl border border-border/45 bg-white px-4 py-3.5">
      <p className="text-[13px] font-semibold text-foreground">نظرة إحصائية سريعة</p>
      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">هذه الصفحة للقراءة والتحليل السريع فقط. التقارير القابلة للتصدير موجودة في تبويب التقارير الإدارية. الفترة الحالية: {filters.from} — {filters.to}.</p>
    </div>

    {canOperational && <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsMetric label="إجمالي البلاغات" metric={data.overview.reports} />
      <AnalyticsMetric label="نسبة إغلاق البلاغات" metric={data.overview.reportCompletionRate} valueFormatter={formatPercent} />
      <AnalyticsMetric label="عمليات إنقاذ مكتملة" metric={data.overview.completedMissions} />
      <AnalyticsMetric label="عمليات تبني مكتملة" metric={data.overview.completedAdoptions} />
    </div>}

    <div className="grid gap-4 xl:grid-cols-2">
      {canOperational && <ChartCard title="اتجاه البلاغات"><TimeSeriesChart data={data.reports.trend} primaryLabel="البلاغات" secondaryLabel="المغلقة" /></ChartCard>}
      {canOperational && <ChartCard title="البلاغات حسب المحافظة"><RankedBarChart data={data.reports.byGovernorate} /></ChartCard>}
      {canOperational && <ChartCard title="مسار التبني"><RankedBarChart data={data.adoption.funnel} /></ChartCard>}
      {canDonations && data.donations && <ChartCard title={`اتجاه التبرعات — ${formatAnalyticsMoney(data.donations.totals[0]?.amountMinor ?? 0)} إجمالي`}><DonationTrendChart data={data.donations.trend} /></ChartCard>}
    </div>

    {canOperational && <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="حالات البلاغات"><DistributionChart data={data.reports.byStatus} /></ChartCard>
      <ChartCard title={`الجمعيات النشطة — ${formatInteger(data.overview.activeOrganizations.value)}`}><RankedBarChart data={data.rescue.organizations.slice(0, 8).map((row) => ({ key: row.id, label: row.name, value: row.completedMissions }))} /></ChartCard>
    </div>}
  </div>;
}
