import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, ConfirmDialog, Modal, Select, Textarea } from '@/components/ui';
import { feedingPointInactiveReasons, feedingPointRejectReasons, issueRejectReasons, refillRejectReasons } from '../constants';
import { useApproveFeedingPoint, useDeactivateFeedingPoint, useReactivateFeedingPoint, useRejectFeedingPoint, useRejectFeedingPointIssue, useResolveFeedingPointIssue, useReviewFeedingPointRefill } from '../hooks';
import { reasonSchema, refillReviewSchema, resolveIssueSchema } from '../schemas';
import type { DeactivateFeedingPointInput, RejectFeedingPointInput, RejectIssueInput, ResolveIssueInput, ReviewRefillInput } from '../types';

function ReasonFields({ register, reason, errors, reasons }: { register: ReturnType<typeof useForm<RejectFeedingPointInput>>['register']; reason: string; errors: ReturnType<typeof useForm<RejectFeedingPointInput>>['formState']['errors']; reasons: readonly string[] }) {
  return (
    <>
      <label className="block text-[12px] font-medium">
        السبب
        <Select
          value={reason}
          onValueChange={(value) => {
            const event = { target: { name: 'reason', value } };
            void register('reason').onChange(event);
          }}
          options={[
            { value: '', label: 'اختر السبب' },
            ...reasons.map((value) => ({ value, label: value })),
          ]}
        />
      </label>

      {errors.reason && (
        <p className="text-[11px] text-critical">
          {errors.reason.message}
        </p>
      )}

      {/* Show a free-text field only when the predefined reasons are not enough. */}
      {reason === 'سبب آخر' && (
        <label className="block text-[12px] font-medium">
          تفاصيل السبب
          <Textarea
            {...register('otherReason')}
            className="mt-1"
          />
        </label>
      )}
    </>
  );
}

export function ApprovePointDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useApproveFeedingPoint(id);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="الموافقة على نشر النقطة"
      description="تأكد من الصور، الموقع وعدم وجود نقطة مكررة قبل النشر. بعد الموافقة ستصبح النقطة متاحة للمستخدمين لإعادة تعبئتها."
      confirmLabel="موافقة ونشر"
      onConfirm={() =>
        mutation.mutate(undefined, {
          onSuccess: () => toast.success('تمت الموافقة ونشر النقطة'),
          onError: () => toast.error('تعذر اعتماد النقطة'),
        })
      }
    />
  );
}

export function RejectPointDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useRejectFeedingPoint(id);

  const form = useForm<RejectFeedingPointInput>({
    resolver: zodResolver(reasonSchema),
    defaultValues: {
      reason: '',
      otherReason: '',
    },
  });

  const reason = form.watch('reason');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="رفض طلب إضافة النقطة"
      description="لن يتم نشر النقطة وسيبقى سبب الرفض محفوظًا في سجل المراجعة."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant="danger"
            disabled={mutation.isPending}
            onClick={() =>
              void form.handleSubmit((value) =>
                mutation.mutate(value, {
                  onSuccess: () => {
                    toast.success('تم رفض الطلب');
                    onOpenChange(false);
                    form.reset();
                  },
                  onError: () => toast.error('تعذر رفض الطلب'),
                }),
              )()
            }
          >
            رفض الطلب
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <ReasonFields
          register={form.register}
          reason={reason}
          errors={form.formState.errors}
          reasons={feedingPointRejectReasons}
        />
      </div>
    </Modal>
  );
}

export function DeactivatePointDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useDeactivateFeedingPoint(id);

  const form = useForm<DeactivateFeedingPointInput>({
    resolver: zodResolver(reasonSchema),
    defaultValues: {
      reason: '',
      otherReason: '',
    },
  });

  const reason = form.watch('reason');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="تعطيل نقطة الإطعام"
      description="لن تظهر كنقطة نشطة، لكن سجلها وتعبئاتها السابقة سيبقيان محفوظين."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant="danger"
            disabled={mutation.isPending}
            onClick={() =>
              void form.handleSubmit((value) =>
                mutation.mutate(value, {
                  onSuccess: () => {
                    toast.success('تم تعطيل النقطة');
                    onOpenChange(false);
                    form.reset();
                  },
                  onError: () => toast.error('تعذر تعطيل النقطة'),
                }),
              )()
            }
          >
            تعطيل
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <ReasonFields
          register={form.register}
          reason={reason}
          errors={form.formState.errors}
          reasons={feedingPointInactiveReasons}
        />
      </div>
    </Modal>
  );
}

export function ReactivatePointDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useReactivateFeedingPoint(id);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إعادة تفعيل النقطة"
      description="ستعود النقطة للظهور كحالة نشطة ويمكن للمستخدمين تسجيل تعبئات جديدة عليها."
      confirmLabel="إعادة التفعيل"
      onConfirm={() =>
        mutation.mutate(undefined, {
          onSuccess: () => toast.success('تمت إعادة التفعيل'),
          onError: () => toast.error('تعذر إعادة التفعيل'),
        })
      }
    />
  );
}

export function ReviewRefillDialog({ pointId, refillId, open, onOpenChange }: { pointId: string; refillId: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useReviewFeedingPointRefill(pointId);

  const form = useForm<ReviewRefillInput>({
    resolver: zodResolver(refillReviewSchema),
    defaultValues: {
      decision: 'VERIFY',
      reason: '',
    },
  });

  const decision = form.watch('decision');

  // Rejection requires a reason, while verified refill reports can be approved directly.
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="مراجعة إعادة التعبئة"
      description="راجع الصورة ووقت العملية قبل اعتمادها. البلاغ يبقى في السجل سواء تم التحقق منه أو رفضه."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant={decision === 'REJECT' ? 'danger' : 'primary'}
            disabled={mutation.isPending}
            onClick={() =>
              void form.handleSubmit((input) =>
                mutation.mutate(
                  { refillId, input },
                  {
                    onSuccess: () => {
                      toast.success(
                        input.decision === 'VERIFY'
                          ? 'تم التحقق من التعبئة'
                          : 'تم رفض بلاغ التعبئة',
                      );
                      onOpenChange(false);
                      form.reset();
                    },
                    onError: () => toast.error('تعذر مراجعة التعبئة'),
                  },
                ),
              )()
            }
          >
            {decision === 'VERIFY' ? 'تأكيد التعبئة' : 'رفض البلاغ'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block text-[12px] font-medium">
          القرار
          <Select
            value={decision}
            onValueChange={(value) =>
              form.setValue('decision', value as ReviewRefillInput['decision'])
            }
            options={[
              { value: 'VERIFY', label: 'التعبئة موثقة وصحيحة' },
              { value: 'REJECT', label: 'رفض بلاغ التعبئة' },
            ]}
          />
        </label>

        {decision === 'REJECT' && (
          <label className="block text-[12px] font-medium">
            سبب الرفض
            <Select
              value={form.watch('reason') ?? ''}
              onValueChange={(value) =>
                form.setValue('reason', value, { shouldValidate: true })
              }
              options={[
                { value: '', label: 'اختر السبب' },
                ...refillRejectReasons.map((value) => ({
                  value,
                  label: value,
                })),
              ]}
            />

            {form.formState.errors.reason && (
              <p className="mt-1 text-[11px] text-critical">
                {form.formState.errors.reason.message}
              </p>
            )}
          </label>
        )}
      </div>
    </Modal>
  );
}

export function ResolveIssueDialog({ pointId, issueId, open, onOpenChange }: { pointId: string; issueId: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useResolveFeedingPointIssue(pointId);

  const form = useForm<ResolveIssueInput>({
    resolver: zodResolver(resolveIssueSchema),
    defaultValues: {
      resolutionNote: '',
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="حل المشكلة"
      description="سجّل الإجراء الذي عالج المشكلة فعليًا."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            onClick={() =>
              void form.handleSubmit((input) =>
                mutation.mutate(
                  { issueId, input },
                  {
                    onSuccess: () => {
                      toast.success('تم حل المشكلة');
                      onOpenChange(false);
                      form.reset();
                    },
                    onError: () => toast.error('تعذر حل المشكلة'),
                  },
                ),
              )()
            }
          >
            تأكيد الحل
          </Button>
        </>
      }
    >
      <Textarea
        {...form.register('resolutionNote')}
        aria-label="ملاحظة الحل"
        placeholder="سجل ما تم عمله…"
      />

      {form.formState.errors.resolutionNote && (
        <p className="mt-1 text-xs text-critical">
          {form.formState.errors.resolutionNote.message}
        </p>
      )}
    </Modal>
  );
}

export function RejectIssueDialog({ pointId, issueId, open, onOpenChange }: { pointId: string; issueId: string; open: boolean; onOpenChange: (value: boolean) => void }) {
  const mutation = useRejectFeedingPointIssue(pointId);

  const form = useForm<RejectIssueInput>({
    resolver: zodResolver(reasonSchema),
    defaultValues: {
      reason: '',
      otherReason: '',
    },
  });

  const reason = form.watch('reason');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="رفض بلاغ المشكلة"
      description="سيبقى البلاغ المرفوض ضمن السجل."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              void form.handleSubmit((input) =>
                mutation.mutate(
                  { issueId, input },
                  {
                    onSuccess: () => {
                      toast.success('تم رفض البلاغ');
                      onOpenChange(false);
                      form.reset();
                    },
                    onError: () => toast.error('تعذر رفض البلاغ'),
                  },
                ),
              )()
            }
          >
            رفض البلاغ
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <ReasonFields
          register={form.register}
          reason={reason}
          errors={form.formState.errors}
          reasons={issueRejectReasons}
        />
      </div>
    </Modal>
  );
}