import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard, Mail, Phone, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Badge, Button, Textarea } from '@/components/ui';
import { MediaGallery } from '@/components/ui/media-gallery';
import { LocationPreview } from '@/components/ui/location-preview';
import { OperationalTimeline } from '@/components/ui/operational-timeline';
import { PermissionGuard } from '@/features/auth/rbac';
import { animalTypeLabels } from '../constants';
import { useAddReportNote } from '../hooks';
import { noteSchema, type NoteFormValues } from '../schemas';
import type { ReportDetails } from '../types';
import { formatReportDate, formatRelativeTime } from '../utils';
import { ReportStatusBadge } from './report-badges';

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-[14px] font-semibold leading-5 text-foreground">{title}</h2>
      {description && (
        <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground/70">{description}</p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground/70">{label}</dt>
      <dd className="mt-1 min-w-0 text-[12px] font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function ReportOverview({ details }: { details: ReportDetails }) {
  const { report } = details;

  return (
    <div>
      <SectionTitle title="ملخص الحالة" description="المعلومات الأساسية المرتبطة بالبلاغ المنشور." />

      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="نوع الحيوان" value={animalTypeLabels[report.animalType]} />
        <Info
          label="الحالة"
          value={
            report.status ? (
              <ReportStatusBadge status={report.status} />
            ) : (
              <Badge tone="neutral">بانتظار جمعية</Badge>
            )
          }
        />
        <Info label="وقت النشر" value={formatReportDate(report.createdAt)} />
        <Info label="الجمعية الحالية" value={report.assignedOrganization?.name ?? 'لم تستلمها جمعية بعد'} />
        <Info label="الموقع" value={`${report.governorate}${report.city ? ` — ${report.city}` : ''}`} />
        <Info label="وصف الحيوان" value={report.animalDescription ?? 'غير محدد'} />
      </dl>

      <div className="mt-4 rounded-xl bg-muted/25 px-4 py-3">
        <p className="text-[12px] font-medium text-foreground">تفاصيل البلاغ</p>
        <p className="mt-1.5 text-[12px] leading-6 text-muted-foreground">{report.description}</p>
      </div>
    </div>
  );
}

export function ReportMediaSection({ details }: { details: ReportDetails }) {
  return (
    <div>
      <SectionTitle title="الوسائط" description={`${details.report.media.length} ملفات مرتبطة بالبلاغ`} />
      <div className="mt-4">
        <MediaGallery
          items={details.report.media.map((item, index) => ({
            ...item,
            alt: `صورة البلاغ ${details.report.id} — ${index + 1}`,
          }))}
        />
      </div>
    </div>
  );
}

export function ReportLocationSection({ details }: { details: ReportDetails }) {
  const report = details.report;
  const title = `${report.governorate}${report.city ? ` — ${report.city}` : ''}`;

  return (
    <div>
      <SectionTitle title="الموقع" description={report.address} />
      <div className="mt-4">
        <LocationPreview
          title={title}
          address={report.address}
          latitude={report.latitude}
          longitude={report.longitude}
         
        />
      </div>
    </div>
  );
}

export function ReportTimelineSection({ details }: { details: ReportDetails }) {
  return (
    <div>
      <SectionTitle
        title="سجل الحالة"
        description="النشر، استلام الجمعية، تغييرات الحالة، وأي تدخل إداري استثنائي."
      />
      <div className="mt-4">
        <OperationalTimeline
          items={details.timeline.map((event) => ({
            id: event.id,
            title: event.action,
            actor: event.actor,
            timestampLabel: formatReportDate(event.timestamp),
            details: event.details,
            tone: event.tone,
          }))}
        />
      </div>
    </div>
  );
}

export function ReporterCard({ details }: { details: ReportDetails }) {
  const reporter = details.report.reporter;

  const copyPhone = async () => {
    if (!reporter.phone) return;
    await navigator.clipboard.writeText(reporter.phone);
    toast.success('تم نسخ رقم الهاتف');
  };

  return (
    <div>
      <SectionTitle title="المبلّغ" />

      <div className="mt-3 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{reporter.name}</p>
          <div className="mt-1">
            <Badge tone={reporter.isGuest ? 'neutral' : 'info'}>
              {reporter.isGuest ? 'مبلّغ ضيف' : 'عضو مسجل'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-[12px]">
        {reporter.phone && (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5" /> الهاتف
            </span>
            <span dir="ltr" className="font-medium text-foreground">{reporter.phone}</span>
          </div>
        )}

        {reporter.email && (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" /> البريد
            </span>
            <span dir="ltr" className="max-w-[170px] truncate font-medium text-foreground">{reporter.email}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {reporter.phone && (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 rounded-lg px-2.5 text-[11px]"
            onClick={() => void copyPhone()}
          >
            <Clipboard className="size-3.5" /> نسخ الهاتف
          </Button>
        )}
        {!reporter.isGuest && (
          <Link to={`/users/${reporter.id}`}>
            <Button size="sm" variant="ghost" className="h-8 rounded-lg px-2.5 text-[11px]">
              ملف المستخدم
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function InternalNotesPanel({ details }: { details: ReportDetails }) {
  const mutation = useAddReportNote(details.report.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: '' },
  });

  const submit = handleSubmit((values) =>
    mutation.mutate(values.note, {
      onSuccess: () => {
        toast.success('تمت إضافة الملاحظة الداخلية');
        reset();
      },
      onError: () => toast.error('تعذر إضافة الملاحظة'),
    }),
  );

  return (
    <div>
      <SectionTitle title="ملاحظات الإدارة" description="داخلية ولا تظهر للمبلّغ أو الجمعية." />

      <PermissionGuard permission="reports:update">
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Textarea {...register('note')} placeholder="أضف ملاحظة تشغيلية…" />
          {errors.note && <p className="mt-1 text-[11px] text-critical">{errors.note.message}</p>}
          <Button size="sm" className="mt-2 h-8 rounded-lg px-2.5 text-[11px]" type="submit" disabled={mutation.isPending}>
            إضافة
          </Button>
        </form>
      </PermissionGuard>

      <div className="mt-4 divide-y divide-border/35">
        {details.notes.length === 0 ? (
          <p className="py-2 text-[12px] text-muted-foreground">لا توجد ملاحظات داخلية.</p>
        ) : (
          details.notes.slice(0, 4).map((note) => (
            <div key={note.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-foreground">{note.adminName}</p>
                  <p className="text-[11px] text-muted-foreground/70">{note.adminRole}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground/60">{formatRelativeTime(note.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
