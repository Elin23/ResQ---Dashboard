import { ArrowRight, Building2, CircleHelp } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Badge, Button, Card, ErrorState, Skeleton } from '@/components/ui';
import { useReport } from '../hooks';
import { formatReportDate } from '../utils';
import { ReportStatusBadge } from '../components/report-badges';
import { ReportActions } from '../components/report-actions';
import {
  InternalNotesPanel,
  ReportLocationSection,
  ReportMediaSection,
  ReporterCard,
  ReportOverview,
  ReportTimelineSection,
} from '../components/report-details-sections';

function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 rounded-xl" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-[610px] rounded-xl" />
        <Skeleton className="h-[430px] rounded-xl" />
      </div>
    </div>
  );
}

export function ReportDetailsPage() {
  const { reportId = '' } = useParams();
  const query = useReport(reportId);

  if (query.isLoading) return <DetailsSkeleton />;

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل البلاغ"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <div className="space-y-4">
        <Link to="/reports">
          <Button variant="ghost" className="h-9 rounded-xl">
            <ArrowRight className="size-4" />
            العودة إلى البلاغات
          </Button>
        </Link>
        <ErrorState
          title="البلاغ غير موجود"
          description="تعذر العثور على البلاغ. ربما تم حذفه أو أن الرابط غير صحيح."
        />
      </div>
    );
  }

  const details = query.data;
  const report = details.report;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <Link to="/dashboard" className="hover:text-foreground">الرئيسية</Link>
            <span>/</span>
            <Link to="/reports" className="hover:text-foreground">البلاغات</Link>
            <span>/</span>
            <span dir="ltr">{report.id}</span>
          </div>

          <h1 className="mt-1 truncate text-[19px] font-semibold leading-6 tracking-tight text-foreground">
            {report.title}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/75">
            <span dir="ltr">{report.id}</span>
            <span>·</span>
            <span>نُشر {formatReportDate(report.createdAt)}</span>
            <span>·</span>
            <span>آخر تحديث {formatReportDate(report.updatedAt)}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {report.status ? (
              <ReportStatusBadge status={report.status} />
            ) : (
              <Badge tone="neutral">بانتظار جمعية</Badge>
            )}
            {report.assignedOrganization ? (
              <Badge tone="info">{report.assignedOrganization.name}</Badge>
            ) : (
              <Badge tone="neutral">بدون جمعية</Badge>
            )}
          </div>
        </div>

        <ReportActions report={report} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden rounded-xl border border-border/45 bg-white p-0 shadow-none">
          <section className="p-5"><ReportOverview details={details} /></section>
          <div className="border-t border-border/40" />
          <section className="p-5"><ReportMediaSection details={details} /></section>
          <div className="border-t border-border/40" />
          <section className="p-5"><ReportLocationSection details={details} /></section>
          <div className="border-t border-border/40" />
          <section className="p-5"><ReportTimelineSection details={details} /></section>
        </Card>

        <aside className="xl:sticky xl:top-20">
          <Card className="rounded-xl border border-border/45 bg-white p-4 shadow-none">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">المتابعة التشغيلية</h2>
              <div className="mt-3 flex items-start gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
                  <Building2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">الجمعية الحالية</p>
                  <p className="mt-0.5 truncate text-[12px] font-medium text-foreground">
                    {report.assignedOrganization?.name ?? 'لم تستلمها جمعية بعد'}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-muted/25 px-3 py-2.5 text-[11px] leading-5 text-muted-foreground">
                <CircleHelp className="me-1 inline size-3.5" />
                تحديث الحالة يتم من الجمعية المستلمة. خيار الإدارة الموجود في الإجراءات هو تجاوز استثنائي فقط ويطلب سببًا للتدقيق.
              </div>
            </div>

            <div className="my-4 border-t border-border/40" />
            <ReporterCard details={details} />

            <div className="my-4 border-t border-border/40" />
            <InternalNotesPanel details={details} />

            <div className="my-4 border-t border-border/40" />
            <div>
              <p className="text-[11px] text-muted-foreground">رقم البلاغ</p>
              <p dir="ltr" className="mt-1 text-[13px] font-medium text-foreground">{report.id}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
