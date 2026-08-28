import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, ExternalLink, FileText, HeartHandshake, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { LocationPreview } from '@/components/ui/location-preview';
import { OperationalTimeline } from '@/components/ui/operational-timeline';
import { DocumentReviewList } from '@/components/ui/document-review-list';
import { WeeklyOperatingHours } from '@/components/ui/weekly-operating-hours';
import { Badge, Button, Card, SectionHeader, Textarea } from '@/components/ui';
import { usePermission } from '@/features/auth/rbac';
import { useAdvertiserAdvertisementSummary } from '@/features/advertisements/hooks';
import { VerificationBadge } from './organization-badges';
import { dayLabels, documentTypeLabels, organizationServiceLabels } from '../constants';
import { useAddOrganizationNote, useReviewOrganizationDocument } from '../hooks';
import { organizationNoteSchema } from '../schemas';
import type { OrganizationDetails } from '../types';
import { formatOrganizationDate, formatOrganizationRelative } from '../utils';

export function OverviewCard({ details }: { details: OrganizationDetails }) {
  const o = details.organization;

  return (
    <Card>
      <SectionHeader title="نظرة عامة" />

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {o.description}
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <Info l="رقم التسجيل" v={o.registrationNumber ?? '—'} />
        <Info l="رقم الترخيص" v={o.licenseNumber ?? '—'} />
        <Info l="سنة التأسيس" v={String(o.foundedYear ?? '—')} />
        <Info l="الهاتف" v={o.phone} />
        <Info l="البريد" v={o.email} />
        <Info l="الممثل الأساسي" v={`${o.primaryContact.name} — ${o.primaryContact.role}`} />
      </dl>
    </Card>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">
        {l}
      </dt>

      <dd className="mt-1 text-sm font-semibold">
        {v}
      </dd>
    </div>
  );
}

export function VerificationCard({ details }: { details: OrganizationDetails }) {
  const o = details.organization;

  // Required documents must be approved before verification can be completed.
  const missing = o.documents.filter(
    (document) => document.required && document.status !== 'VERIFIED',
  );

  return (
    <Card>
      <SectionHeader
        title="التحقق والامتثال"
        actions={<VerificationBadge status={o.verificationStatus} />}
      />

      {missing.length > 0 && (
        <div role="alert" className="mt-4 rounded-md border border-pending/30 bg-pending/10 p-3 text-sm">
          هناك مستندات مطلوبة لم تُعتمد بعد. لا يمكن إكمال الاعتماد قبل تسويتها.
        </div>
      )}

      <div className="mt-4 space-y-2">
        {details.review.checklist.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-md border p-3 text-sm"
          >
            <span>
              {item.label}
            </span>

            <Badge tone={item.passed ? 'success' : 'pending'}>
              {item.passed ? 'مكتمل' : 'غير مكتمل'}
            </Badge>
          </div>
        ))}
      </div>

      {details.review.adminMessage && (
        <div className="mt-4 rounded-md bg-muted p-3 text-sm">
          <p className="font-semibold">
            طلب معلومات إضافية
          </p>

          <p className="mt-1 text-muted-foreground">
            {details.review.adminMessage}
          </p>
        </div>
      )}
    </Card>
  );
}

export function DocumentsCard({ details }: { details: OrganizationDetails }) {
  const review = useReviewOrganizationDocument(details.organization.id);
  const canReview = usePermission('organizations.documents.review');

  return (
    <Card>
      <SectionHeader
        title="المستندات"
        description="مراجعة مستندات التسجيل والتحقق كلٌ على حدة."
      />

      <div className="mt-4">
        <DocumentReviewList
          documents={details.organization.documents}
          typeLabels={documentTypeLabels}
          formatDate={formatOrganizationDate}
          canReview={canReview}
          onPreview={() =>
            toast.info('معاينة الملفات ستتصل بخدمة التخزين الخلفية لاحقاً.')
          }
          onApprove={(document) =>
            review.mutate(
              {
                documentId: document.id,
                input: {
                  decision: 'APPROVE',
                },
              },
              {
                onSuccess: () =>
                  toast.success('تم اعتماد المستند'),
                onError: () =>
                  toast.error('تعذر اعتماد المستند'),
              },
            )
          }
          onReject={(document) =>
            review.mutate(
              {
                documentId: document.id,
                input: {
                  decision: 'REJECT',
                  reason: 'المستند يحتاج نسخة أوضح',
                },
              },
              {
                onSuccess: () =>
                  toast.success('تم رفض المستند مع تسجيل السبب'),
                onError: () =>
                  toast.error('تعذر تحديث المستند'),
              },
            )
          }
        />
      </div>
    </Card>
  );
}

export function ServicesHoursCard({ details }: { details: OrganizationDetails }) {
  return (
    <Card>
      <SectionHeader title="الخدمات وساعات العمل" />

      <div className="mt-4 flex flex-wrap gap-2">
        {details.organization.services.map((service) => (
          <span
            key={service.key}
            className="rounded-full bg-info/10 px-2.5 py-1 text-xs font-semibold text-info"
          >
            {organizationServiceLabels[service.key]}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <WeeklyOperatingHours
          hours={details.organization.operatingHours}
          dayLabels={dayLabels}
        />
      </div>
    </Card>
  );
}

export function LocationCard({ details }: { details: OrganizationDetails }) {
  const o = details.organization;

  if (o.latitude === undefined || o.longitude === undefined) {
    return (
      <Card>
        <SectionHeader title="الموقع" />

        <p className="mt-4 text-sm text-muted-foreground">
          لا توجد إحداثيات موثقة لهذا السجل بعد.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title="الموقع" />

      <div className="mt-4">
        <LocationPreview
          title={o.name}
          address={`${o.governorate}${o.city ? ` — ${o.city}` : ''} · ${o.address}`}
          latitude={o.latitude}
          longitude={o.longitude}
          mapHref={`/map?entityType=ORGANIZATION&entityId=${o.id}`}
        />
      </div>
    </Card>
  );
}

export function OperationsCard({ details }: { details: OrganizationDetails }) {
  const o = details.organization;
  const s = o.statistics;
  const canSupport = usePermission('support.read');

  return (
    <Card>
      <SectionHeader title="الأداء والنشاط التشغيلي" />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={HeartHandshake}
          l="بلاغات نشطة"
          v={s?.activeReports ?? 0}
        />

        <Metric
          icon={HeartHandshake}
          l="بلاغات مغلقة"
          v={s?.closedReports ?? 0}
        />

        <Metric
          icon={HeartHandshake}
          l="عروض تبني بانتظار النشر"
          v={s?.pendingAdoptionRequests ?? 0}
        />

        <Metric
          icon={Star}
          l="نسبة إغلاق البلاغات"
          v={s?.completionRate !== undefined ? `${s.completionRate}%` : '—'}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/reports?organization=${o.id}`}>
          <Button variant="secondary">
            عرض البلاغات المسندة
          </Button>
        </Link>

        <Link to={`/adoption-requests?organization=${o.id}`}>
          <Button variant="secondary">
            عرض عروض التبني
          </Button>
        </Link>

        <Link to={`/feeding-points?organizationId=${o.id}`}>
          <Button variant="secondary">
            نقاط الإطعام المسؤولة
          </Button>
        </Link>

        {canSupport && (
          <Link to={`/support?organizationId=${o.id}`}>
            <Button variant="secondary">
              سجل الدعم
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Recent
          title="أحدث البلاغات"
          items={details.recentReports.map((item) => ({
            id: item.id,
            label: item.status,
            href: `/reports/${item.id}`,
          }))}
        />

        <Recent
          title="أحدث عروض التبني"
          items={details.recentAdoptions.map((item) => ({
            id: item.id,
            label: item.applicantName,
            href: `/adoption-requests/${item.id}`,
          }))}
        />
      </div>
    </Card>
  );
}

function Metric({ icon: Icon, l, v }: { icon: typeof Building2; l: string; v: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <Icon className="size-4 text-primary" />

      <p className="mt-2 text-xs text-muted-foreground">
        {l}
      </p>

      <p className="mt-1 text-lg font-bold">
        {v}
      </p>
    </div>
  );
}

function Recent({ title, items }: { title: string; items: Array<{ id: string; label: string; href: string }> }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="font-semibold">
        {title}
      </p>

      <div className="mt-3 space-y-2">
        {items.length ? (
          items.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="flex justify-between gap-2 text-sm hover:text-primary"
            >
              <span>
                {item.id}
              </span>

              <span className="truncate text-muted-foreground">
                {item.label}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد بيانات مرتبطة.
          </p>
        )}
      </div>
    </div>
  );
}

export function OrganizationAdvertisingCard({ details }: { details: OrganizationDetails }) {
  const query = useAdvertiserAdvertisementSummary(
    'ORGANIZATION',
    details.organization.id,
  );

  return (
    <Card>
      <SectionHeader
        title="الإعلانات"
        description="حملات الجمعية المسجلة في نظام الإعلانات الموحد."
      />

      <div className="mt-4 rounded-lg border p-4">
        <FileText className="size-5 text-primary" />

        <p className="mt-2 font-semibold">
          الإعلانات
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {query.data?.active ?? 0} فعالة · {query.data?.pending ?? 0} بانتظار المراجعة · {query.data?.paused ?? 0} متوقفة
        </p>

        <Link
          to={`/advertisements?organizationId=${details.organization.id}`}
          className="mt-3 inline-flex text-sm font-semibold text-primary"
        >
          عرض كل الإعلانات
          <ExternalLink className="ms-1 size-4" />
        </Link>
      </div>
    </Card>
  );
}

export function TimelineCard({ details }: { details: OrganizationDetails }) {
  return (
    <Card>
      <SectionHeader title="سجل النشاط" />

      <div className="mt-4">
        <OperationalTimeline
          items={details.timeline.map((event) => ({
            id: event.id,
            title: event.action,
            actor: event.actor,
            timestampLabel: formatOrganizationRelative(event.timestamp),
            details: event.details,
            tone: event.tone,
          }))}
        />
      </div>
    </Card>
  );
}

type NoteForm = {
  note: string;
};

export function NotesCard({ details }: { details: OrganizationDetails }) {
  const mutation = useAddOrganizationNote(details.organization.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteForm>({
    resolver: zodResolver(organizationNoteSchema),
    defaultValues: {
      note: '',
    },
  });

  return (
    <Card>
      <SectionHeader
        title="ملاحظات داخلية"
        description="لا تظهر هذه الملاحظات للجمعية."
      />

      <form
        className="mt-4 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();

          // Clear the form only after the internal note is saved successfully.
          void handleSubmit((value) =>
            mutation.mutate(value.note, {
              onSuccess: () => {
                toast.success('أضيفت الملاحظة');
                reset();
              },
              onError: () =>
                toast.error('تعذر إضافة الملاحظة'),
            }),
          )();
        }}
      >
        <Textarea
          aria-label="ملاحظة داخلية"
          {...register('note')}
          placeholder="أضف ملاحظة لفريق الإدارة…"
        />

        {errors.note && (
          <p className="text-xs text-critical">
            {errors.note.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          إضافة ملاحظة
        </Button>
      </form>

      <div className="mt-4 space-y-3">
        {details.notes.map((note) => (
          <div
            key={note.id}
            className="rounded-md bg-muted/60 p-3 text-sm"
          >
            <div className="flex justify-between gap-2">
              <strong>
                {note.adminName}
              </strong>

              <span className="text-xs text-muted-foreground">
                {formatOrganizationRelative(note.createdAt)}
              </span>
            </div>

            <p className="mt-1 text-muted-foreground">
              {note.note}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}