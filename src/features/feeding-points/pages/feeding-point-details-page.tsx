import { useState } from 'react';
import { CheckCircle2, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import { useParams } from 'react-router';

import { Button, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';

import { FeedingPointStatusBadge } from '../components/feeding-point-badges';
import { IssuesCard, NotesCard, PointMetaCard, PointOverviewSection, RefillsSection, SubmitterCard, TimelineCard } from '../components/feeding-point-details-sections';
import { ApprovePointDialog, DeactivatePointDialog, ReactivatePointDialog, RejectPointDialog } from '../components/feeding-point-workflow-dialogs';
import { useFeedingPoint } from '../hooks';
import { formatFeedingPointRelative } from '../utils';

function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-20 rounded-xl" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>

        <div className="space-y-5">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function FeedingPointDetailsPage() {
  const { feedingPointId = '' } = useParams();

  const query = useFeedingPoint(feedingPointId);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  if (query.isLoading) {
    return <Loading />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل نقطة الإطعام"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <ErrorState
        title="نقطة الإطعام غير موجودة"
        description="تحقق من رقم النقطة أو ارجع إلى القائمة."
      />
    );
  }

  const details = query.data;
  const point = details.point;

  // Show only the workflow actions that match the current point status.
  const actions = (
    <div className="flex flex-wrap gap-2">
      {point.status === 'PENDING' && (
        <>
          <PermissionGuard permission="feeding_points.approve">
            <Button onClick={() => setApproveOpen(true)}>
              <CheckCircle2 className="size-4" />
              موافقة ونشر
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="feeding_points.reject">
            <Button
              variant="secondary"
              className="text-critical"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="size-4" />
              رفض الطلب
            </Button>
          </PermissionGuard>
        </>
      )}

      {point.status === 'ACTIVE' && (
        <PermissionGuard permission="feeding_points.deactivate">
          <Button
            variant="secondary"
            onClick={() => setDeactivateOpen(true)}
          >
            <PauseCircle className="size-4" />
            تعطيل النقطة
          </Button>
        </PermissionGuard>
      )}

      {point.status === 'INACTIVE' && (
        <PermissionGuard permission="feeding_points.reactivate">
          <Button onClick={() => setReactivateOpen(true)}>
            <PlayCircle className="size-4" />
            إعادة التفعيل
          </Button>
        </PermissionGuard>
      )}
    </div>
  );

  // Surface pending refill reviews near the main point status.
  const hasPendingRefills = details.refills.some(
    (item) => item.reviewStatus === 'PENDING',
  );

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title={point.name ?? point.id}
        description={`${point.id} · ${point.location.governorate}${point.location.city ? ` — ${point.location.city}` : ''} · آخر نشاط ${formatFeedingPointRelative(point.latestRefillReportAt ?? point.updatedAt)}`}
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'نقاط الإطعام', href: '/feeding-points' },
          { label: point.name ?? point.id },
        ]}
        actions={actions}
      />

      <div className="flex items-center gap-2">
        <FeedingPointStatusBadge status={point.status} />

        {hasPendingRefills && (
          <span className="text-[11px] text-muted-foreground">
            يوجد تعبئات تنتظر التحقق
          </span>
        )}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <main className="space-y-5">
          <PointOverviewSection details={details} />
          <RefillsSection details={details} />

          <PermissionGuard permission="feeding_points.issues.read">
            <IssuesCard details={details} />
          </PermissionGuard>

          <TimelineCard details={details} />
        </main>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <SubmitterCard details={details} />
          <PointMetaCard details={details} />

          <PermissionGuard permission="feeding_points.notes.create">
            <NotesCard details={details} />
          </PermissionGuard>
        </aside>
      </div>

      <ApprovePointDialog
        id={point.id}
        open={approveOpen}
        onOpenChange={setApproveOpen}
      />

      <RejectPointDialog
        id={point.id}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />

      <DeactivatePointDialog
        id={point.id}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />

      <ReactivatePointDialog
        id={point.id}
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
      />
    </div>
  );
}