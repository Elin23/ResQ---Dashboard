import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Checkbox, ConfirmDialog, Input, Modal, Select, Textarea } from '@/components/ui';
import { rejectionReasons, suspensionReasons } from '../constants';
import { useApproveOrganization, useReactivateOrganization, useRejectOrganization, useRequestOrganizationInfo, useSuspendOrganization } from '../hooks';
import { rejectOrganizationSchema, requestInfoSchema, suspendOrganizationSchema } from '../schemas';
import type { OrganizationDetails, RejectOrganizationInput, RequestInfoInput, SuspendOrganizationInput } from '../types';

export function ApproveDialog({ details, open, onOpenChange }: { details: OrganizationDetails; open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useApproveOrganization(details.organization.id);

  const unresolved =
    details.organization.documents.filter(
      (d) => d.required && d.status !== 'VERIFIED',
    ).length +
    details.review.checklist.filter(
      (c) => !c.passed,
    ).length;

  // Approval stays blocked while required verification items are unresolved.
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="اعتماد الجمعية"
      description={
        unresolved
          ? `لا يمكن الاعتماد حالياً: توجد ${unresolved} متطلبات غير محلولة.`
          : 'سيتم اعتماد الجمعية وتفعيل حسابها التشغيلي.'
      }
      confirmLabel="اعتماد الجمعية"
      onConfirm={() =>
        mutation.mutate(undefined, {
          onSuccess: () =>
            toast.success('تم اعتماد الجمعية'),
          onError: (e) =>
            toast.error(
              e.message === 'DOCUMENTS_UNRESOLVED'
                ? 'لا تزال مستندات مطلوبة غير معتمدة.'
                : 'تعذر اعتماد الجمعية',
            ),
        })
      }
    />
  );
}

export function RequestInfoDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useRequestOrganizationInfo(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestInfoInput>({
    resolver: zodResolver(requestInfoSchema),
    defaultValues: {
      requestedItems: [],
      message: '',
      deadline: '',
    },
  });

  const items = watch('requestedItems');

  const toggle = (item: string, checked: boolean) =>
    setValue(
      'requestedItems',
      checked
        ? [...items, item]
        : items.filter((x) => x !== item),
      { shouldValidate: true },
    );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="طلب معلومات إضافية"
      description="حدد المطلوب واكتب رسالة واضحة لممثل الجمعية."
      footer={
        <Button
          onClick={() =>
            void handleSubmit((v) =>
              mutation.mutate(v, {
                onSuccess: () => {
                  toast.success('تم إرسال طلب المعلومات');
                  onOpenChange(false);
                },
                onError: () =>
                  toast.error('تعذر تحديث الطلب'),
              }),
            )()
          }
          disabled={mutation.isPending}
        >
          إرسال الطلب
        </Button>
      }
    >
      <div className="space-y-4">
        <fieldset>
          <legend className="text-sm font-semibold">
            المطلوب
          </legend>

          <div className="mt-2 grid gap-2">
            <Checkbox
              label="نسخة واضحة من الترخيص"
              checked={items.includes('نسخة واضحة من الترخيص')}
              onCheckedChange={(v) =>
                toggle(
                  'نسخة واضحة من الترخيص',
                  v === true,
                )
              }
            />

            <Checkbox
              label="تحديث بيانات ممثل الجمعية"
              checked={items.includes('تحديث بيانات ممثل الجمعية')}
              onCheckedChange={(v) =>
                toggle(
                  'تحديث بيانات ممثل الجمعية',
                  v === true,
                )
              }
            />

            <Checkbox
              label="إثبات العنوان"
              checked={items.includes('إثبات العنوان')}
              onCheckedChange={(v) =>
                toggle(
                  'إثبات العنوان',
                  v === true,
                )
              }
            />
          </div>

          {errors.requestedItems && (
            <p className="mt-1 text-xs text-critical">
              {errors.requestedItems.message}
            </p>
          )}
        </fieldset>

        <label className="block text-sm font-semibold">
          رسالة الإدارة

          <Textarea
            className="mt-1"
            {...register('message')}
            placeholder="يرجى رفع نسخة واضحة من الترخيص…"
          />
        </label>

        {errors.message && (
          <p className="text-xs text-critical">
            {errors.message.message}
          </p>
        )}

        <label className="block text-sm font-semibold">
          موعد مستهدف اختياري

          <Input
            className="mt-1"
            type="date"
            {...register('deadline')}
          />
        </label>
      </div>
    </Modal>
  );
}

export function RejectDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useRejectOrganization(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RejectOrganizationInput>({
    resolver: zodResolver(rejectOrganizationSchema),
    defaultValues: {
      reason: '',
    },
  });

  const reason = watch('reason');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="رفض طلب الجمعية"
      description="الرفض نهائي لحالة الانضمام الحالية ويجب توثيق السبب."
      footer={
        <Button
          variant="danger"
          onClick={() =>
            void handleSubmit((v) =>
              mutation.mutate(v, {
                onSuccess: () => {
                  toast.success('تم رفض طلب الجمعية');
                  onOpenChange(false);
                },
                onError: () =>
                  toast.error('تعذر رفض الطلب'),
              }),
            )()
          }
        >
          تأكيد الرفض
        </Button>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold">
          سبب الرفض

          <Select
            value={reason || undefined}
            onValueChange={(v) =>
              setValue('reason', v, {
                shouldValidate: true,
              })
            }
            options={rejectionReasons.map((v) => ({
              value: v,
              label: v,
            }))}
          />
        </label>

        {errors.reason && (
          <p className="text-xs text-critical">
            {errors.reason.message}
          </p>
        )}

        {reason === 'سبب آخر' && (
          <label className="block text-sm font-semibold">
            تفاصيل السبب

            <Textarea
              className="mt-1"
              {...register('otherReason')}
            />
          </label>
        )}
      </div>
    </Modal>
  );
}

export function SuspendDialog({ details, open, onOpenChange }: { details: OrganizationDetails; open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useSuspendOrganization(details.organization.id);
  const active = details.organization.statistics?.activeReports ?? 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SuspendOrganizationInput>({
    resolver: zodResolver(suspendOrganizationSchema),
    defaultValues: {
      reason: '',
      note: '',
      acknowledgeActiveReports: false,
    },
  });

  const reason = watch('reason');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="تعليق حساب الجمعية"
      description="التعليق إجراء تشغيلي مختلف عن رفض طلب الانضمام."
      footer={
        <Button
          variant="danger"
          onClick={() =>
            void handleSubmit((v) =>
              mutation.mutate(v, {
                onSuccess: () => {
                  toast.success('تم تعليق الجمعية');
                  onOpenChange(false);
                },
                onError: (e) =>
                  toast.error(
                    e.message === 'ACTIVE_REPORTS_ACK_REQUIRED'
                      ? 'يجب تأكيد أثر البلاغات النشطة.'
                      : 'تعذر تعليق الجمعية',
                  ),
              }),
            )()
          }
        >
          تعليق الحساب
        </Button>
      }
    >
      <div className="space-y-4">
        {active > 0 && (
          <div role="alert" className="rounded-md border border-critical/25 bg-critical/5 p-3 text-sm">
            <strong>
              لدى الجمعية {active} بلاغات نشطة.
            </strong>

            <p className="mt-1 text-muted-foreground">
              تعليق الحساب قد يؤثر على البلاغات الجارية.
            </p>

            <div className="mt-2">
              <Checkbox
                label="أفهم الأثر التشغيلي وأريد المتابعة"
                checked={watch('acknowledgeActiveReports')}
                onCheckedChange={(v) =>
                  setValue(
                    'acknowledgeActiveReports',
                    v === true,
                    { shouldValidate: true },
                  )
                }
              />
            </div>
          </div>
        )}

        <label className="block text-sm font-semibold">
          سبب التعليق

          <Select
            value={reason || undefined}
            onValueChange={(v) =>
              setValue('reason', v, {
                shouldValidate: true,
              })
            }
            options={suspensionReasons.map((v) => ({
              value: v,
              label: v,
            }))}
          />
        </label>

        {errors.reason && (
          <p className="text-xs text-critical">
            {errors.reason.message}
          </p>
        )}

        {reason === 'سبب آخر' && (
          <Textarea
            {...register('otherReason')}
            placeholder="اكتب السبب…"
          />
        )}

        <Textarea
          {...register('note')}
          placeholder="ملاحظة داخلية اختيارية…"
        />
      </div>
    </Modal>
  );
}

export function ReactivateDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useReactivateOrganization(id);

  // Reactivation is only available after the suspension reason is handled.
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إعادة تفعيل الجمعية"
      description="تأكد من معالجة سبب التعليق قبل إعادة الصلاحية التشغيلية."
      confirmLabel="إعادة التفعيل"
      onConfirm={() =>
        mutation.mutate(
          'تمت معالجة سبب التعليق والتحقق من الجهة.',
          {
            onSuccess: () =>
              toast.success('تمت إعادة تفعيل الجمعية'),
            onError: () =>
              toast.error('تعذر إعادة التفعيل'),
          },
        )
      }
    />
  );
}