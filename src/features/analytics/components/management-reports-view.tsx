import type { ReactNode } from 'react';
import { Building2, ExternalLink, FileDown, FileText, HeartHandshake, HandHeart, PawPrint } from 'lucide-react';
import { Link } from 'react-router';
import { Button, EmptyState } from '@/components/ui';
import type { AnalyticsFilters, AnalyticsResponse, ManagementReportKey, NamedValue } from '../types';
import { formatAnalyticsMoney, formatDuration, formatInteger, formatPercent } from '../utils';
import { exportElementToPdf } from '../utils/export-pdf';
import { toast } from 'sonner';
import { DistributionChart, RankedBarChart, ChartCard, DonationTrendChart, TimeSeriesChart } from './analytics-charts';

interface MetricItem {
  label: string;
  value: string | number;
  helper?: string;
}

interface PrintTable {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

interface ReportDocumentData {
  title: string;
  description: string;
  summary: string;
  metrics: MetricItem[];
  tables: PrintTable[];
}

const reportItems: Array<{ key: ManagementReportKey; label: string; description: string; icon: typeof FileText }> = [
  { key: 'reports', label: 'البلاغات', description: 'الحجم والإغلاق والتوزع', icon: FileText },
  { key: 'rescue', label: 'عمليات الإنقاذ', description: 'الحالات المسندة والاستجابة', icon: HeartHandshake },
  { key: 'adoption', label: 'عمليات التبني', description: 'النشر والطلبات والنتائج', icon: PawPrint },
  { key: 'organizations', label: 'الجمعيات', description: 'الجهات والنشاط التشغيلي', icon: Building2 },
  { key: 'donations', label: 'التبرعات', description: 'القيمة والحملات والجمعيات', icon: HandHeart },
];

function topItem(items: NamedValue[]) {
  return items[0];
}

function formatDateRange(filters: AnalyticsFilters) {
  const formatter = new Intl.DateTimeFormat('ar-SY-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
  return `${formatter.format(new Date(`${filters.from}T00:00:00`))} — ${formatter.format(new Date(`${filters.to}T00:00:00`))}`;
}

async function downloadBrandedReport(title: string) {
  const element = document.getElementById('resq-report-pdf-document');
  if (!element) {
    toast.error('تعذر تجهيز التقرير للتصدير.');
    return;
  }
  try {
    const safeName = title.replace(/\s+/g, '-');
    await exportElementToPdf(element, `ResQ-${safeName}.pdf`);
    toast.success('تم تنزيل ملف PDF.');
  } catch {
    toast.error('تعذر إنشاء ملف PDF. حاول مرة أخرى.');
  }
}

function MetricStrip({ items }: { items: MetricItem[] }) {
  return <div className="grid overflow-hidden rounded-xl border border-border/45 bg-white sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item, index) => <div key={item.label} className={`min-h-[88px] px-4 py-3.5 ${index > 0 ? 'border-t border-border/35 sm:border-t-0 sm:border-s' : ''}`}>
      <p className="text-[11px] font-normal text-muted-foreground">{item.label}</p>
      <p className="mt-2 text-[21px] font-semibold leading-none text-foreground">{item.value}</p>
      {item.helper && <p className="mt-2 text-[11px] leading-4 text-muted-foreground/70">{item.helper}</p>}
    </div>)}
  </div>;
}

function SummaryBlock({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-primary/10 bg-primary/[0.025] px-4 py-3.5">
    <p className="text-[12px] font-medium text-foreground">ملخص التقرير</p>
    <p className="mt-1.5 text-[12px] leading-6 text-muted-foreground">{children}</p>
  </div>;
}

function ReportHeader({ title, description, href, onPdf }: { title: string; description: string; href: string; onPdf: () => void }) {
  return <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-3xl text-[12px] leading-5 text-muted-foreground/80">{description}</p>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2 print:hidden">
      <Button className="h-9 rounded-xl text-[12px]" onClick={onPdf}><FileDown className="size-4" />تصدير PDF</Button>
      <Link to={href}><Button className="h-9 rounded-xl text-[12px]" variant="secondary">فتح السجل<ExternalLink className="size-4" /></Button></Link>
    </div>
  </div>;
}

function BrandedPrintDocument({ report, filters, generatedAt }: { report: ReportDocumentData; filters: AnalyticsFilters; generatedAt: string }) {
  return <article id="resq-report-pdf-document" dir="rtl" className="fixed left-[-12000px] top-0 z-[-1] w-[794px] bg-white px-10 py-9 text-[#241b16]">
    <header className="flex items-center justify-between gap-6 pb-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">R</span>
        <div>
          <p className="text-xl font-bold text-primary">ResQ</p>
          <p className="mt-0.5 text-[10px] text-[#7d716a]">لوحة الإدارة</p>
        </div>
      </div>
      <div className="text-left text-[10px] leading-5 text-[#7d716a]">
        <p>تقرير إداري</p>
        <p>{new Date(generatedAt).toLocaleString('ar-SY-u-nu-latn')}</p>
      </div>
    </header>

    <div className="h-1 rounded-full bg-primary" />

    <section className="border-b border-[#eee7e2] py-6">
      <p className="mb-1.5 text-[10px] font-semibold text-primary">ResQ • التقارير</p>
      <h1 className="text-2xl font-semibold leading-9">{report.title}</h1>
      <p className="mt-2 text-[11px] leading-6 text-[#70655f]">{report.description}</p>
      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#eee5de] bg-[#fffaf7] px-3 py-2 text-[10px]"><span className="text-[#8a7c74]">الفترة</span><strong className="font-semibold text-[#3a2d26]">{formatDateRange(filters)}</strong></div>
    </section>

    <section className="mt-5 rounded-xl border border-[#f5dfd2] bg-[#fffaf7] p-4"><h2 className="text-[12px] font-semibold">الملخص التنفيذي</h2><p className="mt-1.5 text-[11px] leading-6 text-[#625750]">{report.summary}</p></section>

    <section className="mt-5 grid grid-cols-4 overflow-hidden rounded-xl border border-[#eee7e2]">
      {report.metrics.map((metric,index) => <div key={metric.label} className={`min-h-20 px-3 py-3 ${index ? 'border-r border-[#eee7e2]' : ''}`}><span className="block text-[9px] text-[#7d716a]">{metric.label}</span><strong className="mt-2 block text-lg font-semibold">{metric.value}</strong>{metric.helper && <small className="mt-1 block text-[9px] leading-4 text-[#8a7c74]">{metric.helper}</small>}</div>)}
    </section>

    {report.tables.map((table) => <section key={table.title} className="mt-6"><h2 className="mb-2 text-[12px] font-semibold">{table.title}</h2><div className="overflow-hidden rounded-lg border border-[#eee7e2]"><table className="w-full border-collapse text-[9px]"><thead className="bg-[#fff8f4] text-[#6e625b]"><tr>{table.headers.map((header) => <th key={header} className="border-b border-[#eee7e2] px-2 py-2 text-right font-semibold">{header}</th>)}</tr></thead><tbody>{table.rows.length ? table.rows.map((row, rowIndex) => <tr key={`${table.title}-${rowIndex}`} className="border-b border-[#f1ebe7] last:border-0">{row.map((value, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className="px-2 py-2 align-middle">{value}</td>)}</tr>) : <tr><td colSpan={table.headers.length} className="px-3 py-6 text-center text-[#7d716a]">لا توجد بيانات ضمن الفترة المحددة.</td></tr>}</tbody></table></div></section>)}

    <footer className="mt-8 flex justify-between gap-4 border-t border-[#eee7e2] pt-3 text-[9px] text-[#8a7c74]">
      <span>ResQ — تقرير إداري مولّد من لوحة التحكم</span>
      <span>لا يتضمن هذا التقرير بيانات دفع أو معلومات تواصل خاصة.</span>
    </footer>
  </article>;
}

function ReportsReport({ data, filters }: { data: AnalyticsResponse; filters: AnalyticsFilters }) {
  const topGovernorate = topItem(data.reports.byGovernorate);
  const metrics: MetricItem[] = [
    { label: 'إجمالي البلاغات', value: formatInteger(data.reports.total) },
    { label: 'الحالات المغلقة', value: formatInteger(data.reports.completed) },
    { label: 'نسبة الإغلاق', value: formatPercent(data.overview.reportCompletionRate.value) },
    { label: 'المتوسط اليومي', value: new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(data.reports.averagePerDay) },
  ];
  const summary = data.reports.total === 0
    ? 'لا توجد بلاغات مسجلة ضمن الفترة والفلاتر المحددة.'
    : `سجّل التطبيق ${formatInteger(data.reports.total)} بلاغًا خلال الفترة، وأُغلقت ${formatInteger(data.reports.completed)} حالة بنسبة ${formatPercent(data.overview.reportCompletionRate.value)}. ${topGovernorate ? `أعلى حجم بلاغات كان في ${topGovernorate.label} بعدد ${formatInteger(topGovernorate.value)} بلاغًا.` : ''}`;
  const printData: ReportDocumentData = {
    title: 'تقرير البلاغات',
    description: 'ملخص إداري لحجم البلاغات وحالاتها وتوزعها الجغرافي.',
    summary,
    metrics,
    tables: [
      { title: 'التوزع حسب المحافظة', headers: ['المحافظة', 'عدد البلاغات'], rows: data.reports.byGovernorate.map((item) => [item.label, item.value]) },
      { title: 'التوزع حسب الحالة', headers: ['الحالة', 'العدد'], rows: data.reports.byStatus.map((item) => [item.label, item.value]) },
    ],
  };
  return <ReportPanel report={printData} filters={filters} generatedAt={data.generatedAt} href="/reports">
    <MetricStrip items={metrics} />
    <SummaryBlock>{summary}</SummaryBlock>
    <div className="grid gap-4 xl:grid-cols-2"><ChartCard title="البلاغات حسب المحافظة"><RankedBarChart data={data.reports.byGovernorate} /></ChartCard><ChartCard title="البلاغات حسب الحالة"><DistributionChart data={data.reports.byStatus} /></ChartCard></div>
  </ReportPanel>;
}

function RescueReport({ data, filters }: { data: AnalyticsResponse; filters: AnalyticsFilters }) {
  const active = Math.max(0, data.rescue.total - data.rescue.completed - data.rescue.cancelled);
  const topOrganization = data.rescue.organizations[0];
  const metrics: MetricItem[] = [
    { label: 'عمليات الإنقاذ', value: formatInteger(data.rescue.total) },
    { label: 'مكتملة', value: formatInteger(data.rescue.completed) },
    { label: 'قيد التنفيذ', value: formatInteger(active) },
    { label: 'متوسط الوصول', value: formatDuration(data.rescue.averageArrivalMinutes) },
  ];
  const summary = data.rescue.total === 0
    ? 'لا توجد حالات إنقاذ مسندة لجمعيات ضمن الفترة المحددة.'
    : `تمت متابعة ${formatInteger(data.rescue.total)} عملية إنقاذ ناتجة عن البلاغات المسندة للجمعيات، واكتملت ${formatInteger(data.rescue.completed)} منها بنسبة ${formatPercent(data.rescue.completionRate)}. ${topOrganization ? `الجمعية الأكثر إغلاقًا للحالات ضمن النطاق الحالي هي ${topOrganization.name} بعدد ${formatInteger(topOrganization.completedMissions)} حالات.` : ''}`;
  const printData: ReportDocumentData = {
    title: 'تقرير عمليات الإنقاذ',
    description: 'متابعة الحالات المسندة للجمعيات من البلاغ وحتى اكتمال التعامل معها.',
    summary,
    metrics,
    tables: [{
      title: 'أداء الجمعيات في عمليات الإنقاذ',
      headers: ['الجمعية', 'المحافظة', 'المكتملة', 'النشطة', 'نسبة الإكمال', 'متوسط الوصول'],
      rows: data.rescue.organizations.map((row) => [row.name, row.governorate, row.completedMissions, row.activeMissions, formatPercent(row.completionRate), formatDuration(row.averageArrivalMinutes)]),
    }],
  };
  return <ReportPanel report={printData} filters={filters} generatedAt={data.generatedAt} href="/reports">
    <MetricStrip items={metrics} />
    <SummaryBlock>{summary}</SummaryBlock>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"><ChartCard title="مسار عمليات الإنقاذ"><TimeSeriesChart data={data.rescue.trend} primaryLabel="نشطة" secondaryLabel="مكتملة" /></ChartCard><OrganizationPerformanceTable rows={data.rescue.organizations.slice(0, 8)} /></div>
  </ReportPanel>;
}

function AdoptionReport({ data, filters }: { data: AnalyticsResponse; filters: AnalyticsFilters }) {
  const metrics: MetricItem[] = [
    { label: 'إجمالي عروض التبني', value: formatInteger(data.adoption.total) },
    { label: 'بانتظار مراجعة النشر', value: formatInteger(data.adoption.underReview) },
    { label: 'تم نشرها', value: formatInteger(data.adoption.approved) },
    { label: 'اكتمل التبني', value: formatInteger(data.adoption.completed) },
  ];
  const summary = data.adoption.total === 0
    ? 'لا توجد عروض تبنٍ ضمن الفترة والفلاتر المحددة.'
    : `تم تسجيل ${formatInteger(data.adoption.total)} عرض تبنٍ خلال الفترة. وافق الأدمن على نشر ${formatInteger(data.adoption.approved)} عرضًا، واكتملت ${formatInteger(data.adoption.completed)} عملية تبنٍ. يوجد حاليًا ${formatInteger(data.adoption.underReview)} عرضًا بانتظار مراجعة النشر.`;
  const printData: ReportDocumentData = {
    title: 'تقرير عمليات التبني',
    description: 'ملخص دورة عرض الحيوان للتبني من المراجعة والنشر حتى اكتمال التبني.',
    summary,
    metrics,
    tables: [
      { title: 'مسار التبني', headers: ['المرحلة', 'العدد'], rows: data.adoption.funnel.map((item) => [item.label, item.value]) },
      { title: 'التبني المكتمل حسب نوع الحيوان', headers: ['النوع', 'العدد'], rows: data.adoption.completedBySpecies.map((item) => [item.label, item.value]) },
    ],
  };
  return <ReportPanel report={printData} filters={filters} generatedAt={data.generatedAt} href="/adoption-requests">
    <MetricStrip items={metrics} />
    <SummaryBlock>{summary}</SummaryBlock>
    <div className="grid gap-4 xl:grid-cols-2"><ChartCard title="مسار عروض وطلبات التبني"><RankedBarChart data={data.adoption.funnel} /></ChartCard><ChartCard title="التبني المكتمل حسب النوع"><DistributionChart data={data.adoption.completedBySpecies} /></ChartCard></div>
  </ReportPanel>;
}

function OrganizationsReport({ data, filters }: { data: AnalyticsResponse; filters: AnalyticsFilters }) {
  const totalOrganizations = data.rescue.organizations.length;
  const totalCompleted = data.rescue.organizations.reduce((sum, row) => sum + row.completedMissions, 0);
  const totalActive = data.rescue.organizations.reduce((sum, row) => sum + row.activeMissions, 0);
  const topOrganization = data.rescue.organizations[0];
  const metrics: MetricItem[] = [
    { label: 'الجمعيات ضمن التقرير', value: formatInteger(totalOrganizations) },
    { label: 'جمعيات نشطة موثقة', value: formatInteger(data.overview.activeOrganizations.value) },
    { label: 'حالات مكتملة', value: formatInteger(totalCompleted) },
    { label: 'حالات نشطة', value: formatInteger(totalActive) },
  ];
  const summary = totalOrganizations === 0
    ? 'لا توجد جمعيات ضمن الفلاتر الحالية.'
    : `يشمل التقرير ${formatInteger(totalOrganizations)} جمعية مرتبطة بالبيانات التشغيلية الحالية، منها ${formatInteger(data.overview.activeOrganizations.value)} جمعية نشطة وموثقة. سجلت الجمعيات ${formatInteger(totalCompleted)} حالة مكتملة و${formatInteger(totalActive)} حالة ما زالت نشطة.${topOrganization ? ` أعلى عدد حالات مكتملة مسجل لدى ${topOrganization.name}.` : ''}`;
  const printData: ReportDocumentData = {
    title: 'تقرير الجمعيات',
    description: 'بيانات الجمعيات ونشاطها في الحالات المسندة دون عرض معلومات خاصة غير لازمة للتقرير.',
    summary,
    metrics,
    tables: [{
      title: 'ملخص الجمعيات',
      headers: ['الجمعية', 'المحافظة', 'حالات مكتملة', 'حالات نشطة', 'نسبة الإكمال', 'متوسط الوصول'],
      rows: data.rescue.organizations.map((row) => [row.name, row.governorate, row.completedMissions, row.activeMissions, formatPercent(row.completionRate), formatDuration(row.averageArrivalMinutes)]),
    }],
  };
  return <ReportPanel report={printData} filters={filters} generatedAt={data.generatedAt} href="/organizations">
    <MetricStrip items={metrics} />
    <SummaryBlock>{summary}</SummaryBlock>
    <OrganizationPerformanceTable rows={data.rescue.organizations} />
  </ReportPanel>;
}

function DonationsReport({ data, filters }: { data: AnalyticsResponse; filters: AnalyticsFilters }) {
  if (!data.donations) return <EmptyState title="لا توجد بيانات تبرعات متاحة" description="لا يملك هذا الحساب صلاحية عرض تقرير التبرعات أو لا توجد بيانات ضمن الفترة المحددة." />;
  const total = data.donations.totals[0];
  const topBeneficiary = topItem(data.donations.byBeneficiary);
  const metrics: MetricItem[] = [
    { label: 'إجمالي التبرعات عبر التطبيق', value: formatAnalyticsMoney(total?.amountMinor ?? 0) },
    { label: 'عدد التبرعات المؤرشفة', value: formatInteger(total?.operations ?? 0) },
    { label: 'متوسط التبرع', value: formatAnalyticsMoney(total?.averageMinor ?? 0) },
    { label: 'جمعيات مستفيدة', value: formatInteger(data.donations.byBeneficiary.length) },
  ];
  const summary = (total?.operations ?? 0) === 0
    ? 'لا توجد تبرعات مؤرشفة ضمن الفترة والفلاتر المحددة.'
    : `بلغ إجمالي التبرعات المؤرشفة عبر التطبيق ${formatAnalyticsMoney(total?.amountMinor ?? 0)} موزعة على ${formatInteger(total?.operations ?? 0)} تبرعًا، بمتوسط ${formatAnalyticsMoney(total?.averageMinor ?? 0)} للتبرع الواحد. ${topBeneficiary ? `أعلى جمعية من حيث عدد سجلات التبرع ضمن الفترة هي ${topBeneficiary.label}.` : ''}`;
  const printData: ReportDocumentData = {
    title: 'تقرير التبرعات',
    description: 'أرشيف مجمع للتبرعات عبر التطبيق بحسب الجمعيات المستفيدة، دون بيانات الدفع أو التواصل الخاصة.',
    summary,
    metrics,
    tables: [{ title: 'التبرعات حسب الجمعية المستفيدة', headers: ['الجمعية', 'عدد سجلات التبرع'], rows: data.donations.byBeneficiary.map((item) => [item.label, item.value]) }],
  };
  return <ReportPanel report={printData} filters={filters} generatedAt={data.generatedAt} href="/donations">
    <MetricStrip items={metrics} />
    <SummaryBlock>{summary}</SummaryBlock>
    <div className="grid gap-4 xl:grid-cols-2"><ChartCard title="اتجاه التبرعات خلال الفترة"><DonationTrendChart data={data.donations.trend} /></ChartCard><ChartCard title="حسب الجمعية المستفيدة"><DistributionChart data={data.donations.byBeneficiary} /></ChartCard></div>
  </ReportPanel>;
}

function ReportPanel({ report, filters, generatedAt, href, children }: { report: ReportDocumentData; filters: AnalyticsFilters; generatedAt: string; href: string; children: ReactNode }) {
  return <>
    <section className="space-y-5 rounded-xl border border-border/45 bg-white p-4 shadow-none sm:p-5">
      <ReportHeader title={report.title} description={`${report.description} الفترة: ${formatDateRange(filters)}.`} href={href} onPdf={() => void downloadBrandedReport(report.title)} />
      {children}
    </section>
    <BrandedPrintDocument report={report} filters={filters} generatedAt={generatedAt} />
  </>;
}

function OrganizationPerformanceTable({ rows }: { rows: AnalyticsResponse['rescue']['organizations'] }) {
  return <div className="overflow-hidden rounded-xl border border-border/45 bg-white">
    <div className="border-b border-border/40 px-4 py-3"><p className="text-[13px] font-semibold">ملخص أداء الجمعيات</p><p className="mt-0.5 text-[11px] text-muted-foreground">الأرقام مبنية على الحالات المسندة ضمن الفترة المحددة.</p></div>
    <div className="overflow-x-auto">
      <table dir="rtl" className="w-full min-w-[720px] text-start text-[12px]">
        <thead className="bg-muted/30 text-muted-foreground"><tr><th className="px-3.5 py-2.5 text-start font-medium">الجمعية</th><th className="px-3.5 py-2.5 text-start font-medium">المحافظة</th><th className="px-3.5 py-2.5 text-start font-medium">مكتملة</th><th className="px-3.5 py-2.5 text-start font-medium">نشطة</th><th className="px-3.5 py-2.5 text-start font-medium">نسبة الإكمال</th><th className="px-3.5 py-2.5 text-start font-medium">متوسط الوصول</th></tr></thead>
        <tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-t border-border/35 transition-colors hover:bg-primary/[0.025]"><td className="px-3.5 py-3 align-middle"><Link to={`/organizations/${row.id}`} className="font-medium text-foreground hover:text-primary">{row.name}</Link></td><td className="px-3.5 py-3 align-middle text-muted-foreground">{row.governorate}</td><td className="px-3.5 py-3 align-middle">{formatInteger(row.completedMissions)}</td><td className="px-3.5 py-3 align-middle">{formatInteger(row.activeMissions)}</td><td className="px-3.5 py-3 align-middle">{formatPercent(row.completionRate)}</td><td className="px-3.5 py-3 align-middle text-muted-foreground">{formatDuration(row.averageArrivalMinutes)}</td></tr>) : <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">لا توجد بيانات جمعيات ضمن الفترة المحددة.</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}

export function ManagementReportsView({ data, filters, reportKey, onReportKeyChange, canDonations, canOperational }: {
  data: AnalyticsResponse;
  filters: AnalyticsFilters;
  reportKey: ManagementReportKey;
  onReportKeyChange: (key: ManagementReportKey) => void;
  canDonations: boolean;
  canOperational: boolean;
}) {
  const available = reportItems.filter((item) => item.key === 'donations' ? canDonations : canOperational);
  const activeKey = available.some((item) => item.key === reportKey) ? reportKey : available[0]?.key;

  if (!activeKey) return <EmptyState title="لا توجد تقارير متاحة لهذا الدور" description="صلاحيات هذا الحساب لا تتضمن تقارير إدارية يمكن عرضها هنا." />;

  return <div dir="rtl" className="grid items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="print:hidden xl:sticky xl:top-24">
      <div className="overflow-hidden rounded-xl border border-border/45 bg-white p-1.5">
        <div className="px-2.5 pb-2 pt-1.5"><p className="text-[12px] font-semibold text-foreground">أنواع التقارير</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">اختر التقرير الذي تريد مراجعته أو تصديره.</p></div>
        <div className="flex gap-1 overflow-x-auto xl:block xl:space-y-1">
          {available.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKey;
            return <button key={item.key} type="button" onClick={() => onReportKeyChange(item.key)} className={`flex min-w-[170px] items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-start transition-colors xl:w-full xl:min-w-0 ${active ? 'bg-primary/[0.07] text-primary' : 'text-muted-foreground hover:bg-muted/45 hover:text-foreground'}`}>
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'bg-muted/55 text-muted-foreground'}`}><Icon className="size-4" strokeWidth={1.7} /></span>
              <span className="min-w-0"><span className="block text-[12px] font-medium">{item.label}</span><span className="mt-0.5 hidden truncate text-[10px] font-normal opacity-75 xl:block">{item.description}</span></span>
            </button>;
          })}
        </div>
      </div>
    </aside>

    <main className="min-w-0">
      {activeKey === 'reports' && <ReportsReport data={data} filters={filters} />}
      {activeKey === 'rescue' && <RescueReport data={data} filters={filters} />}
      {activeKey === 'adoption' && <AdoptionReport data={data} filters={filters} />}
      {activeKey === 'organizations' && <OrganizationsReport data={data} filters={filters} />}
      {activeKey === 'donations' && <DonationsReport data={data} filters={filters} />}
    </main>
  </div>;
}
