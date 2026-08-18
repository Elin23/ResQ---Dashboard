import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import {
  assignmentSchema,
  deleteReportSchema,
  statusOverrideSchema,
  type AssignmentFormValues,
  type DeleteReportFormValues,
  type StatusOverrideFormValues,
} from '../schemas';
import { reportStatusLabels } from '../constants';
import {
  useAdminOverrideReportStatus,
  useAssignReport,
  useDeleteReport,
  useEligibleOrganizations,
} from '../hooks';
import type { Report } from '../types';

export type ReportWorkflow = 'assign' | 'status-override' | 'delete';

function mutationMessage(error: Error): string {
  if (error.message === 'INVALID_REPORT_STATE') return 'حالة البلاغ الحالية لا تسمح بهذا الإجراء.';
  if (error.message === 'ORGANIZATION_NOT_AVAILABLE') return 'الجمعية المحددة غير متاحة حاليًا.';
  if (error.message === 'REPORT_NOT_FOUND') return 'البلاغ غير موجود أو تم حذفه.';
  return 'تعذر تنفيذ الإجراء. حاول مرة أخرى.';
}

export function ReportWorkflowDialog({
  report,
  workflow,
  open,
  onOpenChange,
  onDeleted,
}: {
  report: Report;
  workflow: ReportWorkflow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  if (workflow === 'assign') {
    return <AssignmentDialog report={report} open={open} onOpenChange={onOpenChange} />;
  }

  if (workflow === 'status-override') {
    return <StatusOverrideDialog report={report} open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <DeleteDialog
      report={report}
      open={open}
      onOpenChange={onOpenChange}
      onDeleted={onDeleted}
    />
  );
}

function AssignmentDialog({
  report,
  open,
  onOpenChange,
}: {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState('');
  const organizations = useEligibleOrganizations(search);
  const mutation = useAssignReport(report.id);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { organizationId: report.assignedOrganization?.id ?? '' },
  });

  const submit = handleSubmit((values) =>
    mutation.mutate(values.organizationId, {
      onSuccess: () => {
        toast.success(report.assignedOrganization ? 'تم تغيير الجمعية المسؤولة' : 'تم تعيين الجمعية المسؤولة');
        onOpenChange(false);
      },
      onError: (error) => toast.error(mutationMessage(error)),
    }),
  );

  const selectedId = watch('organizationId');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={report.assignedOrganization ? 'تغيير الجمعية المسؤولة' : 'تعيين جمعية للبلاغ'}
      description="هذا الإجراء يغيّر الجهة المسؤولة فقط. تحديث حالة الإنقاذ يتم عادة من الجمعية المستلمة."
      footer={
        <>
          <Button variant="secondary" className="h-9 rounded-xl" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button className="h-9 rounded-xl" onClick={() => void submit()} disabled={mutation.isPending}>
            حفظ
          </Button>
        </>
      }
    >
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label className="block text-[12px] font-medium text-foreground">
          البحث عن جمعية
          <Input
            className="mt-1.5 h-9 rounded-xl"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="اسم الجمعية…"
          />
        </label>

        <div className="max-h-72 overflow-y-auto rounded-xl border border-border/45 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {organizations.data?.map((organization) => {
            const selected = selectedId === organization.id;
            return (
              <button
                key={organization.id}
                type="button"
                onClick={() => setValue('organizationId', organization.id, { shouldValidate: true })}
                className={`flex w-full items-center justify-between gap-4 border-b border-border/35 px-3 py-2.5 text-start transition-colors last:border-b-0 ${
                  selected ? 'bg-primary/[0.055] text-foreground' : 'hover:bg-muted/25'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium">{organization.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                    {organization.governorate}
                    {organization.distanceKm ? ` · ${organization.distanceKm} كم تقريبًا` : ''}
                  </p>
                </div>

                <div className="shrink-0 text-end text-[11px] text-muted-foreground/70">
                  <p>{organization.activeReports} بلاغات نشطة</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {organization.availability === 'AVAILABLE'
                      ? 'متاحة'
                      : organization.availability === 'LIMITED'
                        ? 'محدودة'
                        : 'غير متاحة'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {errors.organizationId && (
          <p className="text-[11px] text-critical">{errors.organizationId.message}</p>
        )}
      </form>
    </Modal>
  );
}

function StatusOverrideDialog({
  report,
  open,
  onOpenChange,
}: {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useAdminOverrideReportStatus(report.id);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StatusOverrideFormValues>({
    resolver: zodResolver(statusOverrideSchema),
    defaultValues: { status: report.status, reason: '' },
  });

  const submit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success('تم تحديث الحالة كتجاوز إداري');
        onOpenChange(false);
      },
      onError: (error) => toast.error(mutationMessage(error)),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="تجاوز إداري للحالة"
      description="الحالة يحدّثها فريق الجمعية في الوضع الطبيعي. استخدم هذا الخيار فقط لتصحيح خطأ أو عند تعذر وصول الجمعية للنظام."
      footer={
        <>
          <Button variant="secondary" className="h-9 rounded-xl" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button className="h-9 rounded-xl" onClick={() => void submit()} disabled={mutation.isPending}>
            تطبيق التجاوز
          </Button>
        </>
      }
    >
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label className="block text-[12px] font-medium text-foreground">
          الحالة
          <div className="mt-1.5">
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as StatusOverrideFormValues['status'], { shouldValidate: true })}
              options={Object.entries(reportStatusLabels).map(([value, label]) => ({ value, label }))}
            />
          </div>
        </label>

        <label className="block text-[12px] font-medium text-foreground">
          سبب التجاوز الإداري
          <Textarea
            {...register('reason')}
            className="mt-1.5"
            placeholder="مثال: الجمعية أكدت الاستلام هاتفيًا وتعذر عليها تحديث الحالة…"
          />
          {errors.reason && <span className="mt-1 block text-[11px] text-critical">{errors.reason.message}</span>}
        </label>
      </form>
    </Modal>
  );
}

function DeleteDialog({
  report,
  open,
  onOpenChange,
  onDeleted,
}: {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const mutation = useDeleteReport(report.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteReportFormValues>({
    resolver: zodResolver(deleteReportSchema),
    defaultValues: { reason: '' },
  });

  const submit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success('تم حذف البلاغ');
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error) => toast.error(mutationMessage(error)),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="حذف البلاغ"
      description={`سيتم حذف البلاغ ${report.id} من الواجهة التشغيلية. سبب الحذف يبقى في سجل الإدارة.`}
      footer={
        <>
          <Button variant="secondary" className="h-9 rounded-xl" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="danger" className="h-9 rounded-xl" onClick={() => void submit()} disabled={mutation.isPending}>
            حذف البلاغ
          </Button>
        </>
      }
    >
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <div className="rounded-xl border border-critical/15 bg-critical/[0.04] px-3 py-2.5 text-[12px] leading-5 text-critical">
          الحذف ليس بديلًا عن إغلاق الحالة. استخدمه للبلاغات المخالفة أو المكررة أو المنشورة بالخطأ فقط.
        </div>

        <label className="block text-[12px] font-medium text-foreground">
          سبب الحذف
          <Textarea
            {...register('reason')}
            className="mt-1.5"
            placeholder="اذكر سبب الحذف بوضوح…"
          />
          {errors.reason && <span className="mt-1 block text-[11px] text-critical">{errors.reason.message}</span>}
        </label>
      </form>
    </Modal>
  );
}
