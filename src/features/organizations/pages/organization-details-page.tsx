import { useState } from 'react';
import { CheckCircle2, ClipboardCheck, Info, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { Avatar, Button, Card, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';
import { EntityDonationSupportCard } from '@/features/donations/components/entity-donation-support-card';
import { OrganizationStatusBadge, VerificationBadge } from '../components/organization-badges';
import { OrganizationAdvertisingCard, DocumentsCard, LocationCard, NotesCard, OperationsCard, OverviewCard, ServicesHoursCard, TimelineCard, VerificationCard } from '../components/organization-sections';
import { ApproveDialog, ReactivateDialog, RejectDialog, RequestInfoDialog, SuspendDialog } from '../components/organization-workflow-dialogs';
import { useOrganization, useStartOrganizationReview } from '../hooks';
import { formatOrganizationDate } from '../utils';

function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-96" />
        </div>

        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export function OrganizationDetailsPage() {
  const { organizationId = '' } = useParams();
  const query = useOrganization(organizationId);

  const [startApprove, setStartApprove] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const start = useStartOrganizationReview(organizationId);

  if (query.isLoading) {
    return <Loading />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل الجمعية"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <ErrorState
        title="الجمعية غير موجودة"
        description="تحقق من رقم الجمعية أو ارجع إلى قائمة الجمعيات."
      />
    );
  }

  const d = query.data;
  const o = d.organization;

  // Show only the workflow actions available for the current organization state.
  const actions = (
    <div className="flex flex-wrap gap-2">
      {o.verificationStatus === 'NOT_REVIEWED' && (
        <PermissionGuard permission="organizations:review">
          <Button
            onClick={() =>
              start.mutate(undefined, {
                onSuccess: () =>
                  toast.success('بدأت مراجعة الجمعية'),
                onError: () =>
                  toast.error('تعذر بدء المراجعة'),
              })
            }
          >
            <ClipboardCheck className="size-4" />
            بدء المراجعة
          </Button>
        </PermissionGuard>
      )}

      {['IN_REVIEW', 'MORE_INFO_REQUIRED'].includes(o.verificationStatus) && (
        <>
          <PermissionGuard permission="organizations:verify">
            <Button onClick={() => setStartApprove(true)}>
              <CheckCircle2 className="size-4" />
              اعتماد الجمعية
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="organizations:request_info">
            <Button
              variant="secondary"
              onClick={() => setInfoOpen(true)}
            >
              <Info className="size-4" />
              طلب معلومات
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="organizations:reject">
            <Button
              variant="danger"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="size-4" />
              رفض الطلب
            </Button>
          </PermissionGuard>
        </>
      )}

      {o.status === 'ACTIVE' && (
        <PermissionGuard permission="organizations:suspend">
          <Button
            variant="secondary"
            onClick={() => setSuspendOpen(true)}
          >
            <PauseCircle className="size-4" />
            تعليق الحساب
          </Button>
        </PermissionGuard>
      )}

      {o.status === 'SUSPENDED' && (
        <PermissionGuard permission="organizations:reactivate">
          <Button onClick={() => setReactivateOpen(true)}>
            <PlayCircle className="size-4" />
            إعادة التفعيل
          </Button>
        </PermissionGuard>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={o.name}
        description={`${o.id} · ${o.governorate}${o.city ? ` — ${o.city}` : ''}`}
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الجمعيات', href: '/organizations' },
          { label: o.name },
        ]}
        actions={actions}
      />

      <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Avatar
            name={o.name}
            src={o.logoUrl}
            size="lg"
          />

          <div>
            <p className="font-bold">
              {o.name}
            </p>

            <p className="text-sm text-muted-foreground">
              تاريخ التسجيل {formatOrganizationDate(o.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <OrganizationStatusBadge status={o.status} />
          <VerificationBadge status={o.verificationStatus} />
        </div>
      </Card>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <OverviewCard details={d} />
          <VerificationCard details={d} />
          <DocumentsCard details={d} />
          <OperationsCard details={d} />
          <OrganizationAdvertisingCard details={d} />

          <EntityDonationSupportCard
            title="تبرعات الجمعية"
            organizationId={o.id}
          />

          <TimelineCard details={d} />
        </main>

        <aside className="space-y-6 xl:sticky xl:top-24">
          <ServicesHoursCard details={d} />

          {o.latitude !== undefined && o.longitude !== undefined ? (
            <LocationCard details={d} />
          ) : (
            <Card>
              <p className="font-semibold">
                الموقع
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                لا توجد إحداثيات موثقة لهذا السجل بعد.
              </p>
            </Card>
          )}

          <PermissionGuard permission="organizations.notes.create">
            <NotesCard details={d} />
          </PermissionGuard>
        </aside>
      </div>

      <ApproveDialog
        details={d}
        open={startApprove}
        onOpenChange={setStartApprove}
      />

      <RequestInfoDialog
        id={o.id}
        open={infoOpen}
        onOpenChange={setInfoOpen}
      />

      <RejectDialog
        id={o.id}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />

      <SuspendDialog
        details={d}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />

      <ReactivateDialog
        id={o.id}
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
      />
    </div>
  );
}