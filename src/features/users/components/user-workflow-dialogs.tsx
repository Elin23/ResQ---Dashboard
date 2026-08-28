import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button, Modal, Select, Textarea } from '@/components/ui';

import { blockReasons, suspensionReasons } from '../constants';
import { useBlockUser, useReactivateUser, useSuspendUser, useUnblockUser } from '../hooks';
import { moderationSchema, type ModerationValues } from '../schemas';

function moderationErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'تعذر تنفيذ الإجراء. حاول مرة أخرى.';
  }

  if (error.message === 'USER_NOT_FOUND') {
    return 'تعذر العثور على حساب المستخدم.';
  }

  if (error.message === 'INVALID_USER_TRANSITION') {
    return 'تغيرت حالة الحساب ولم يعد هذا الإجراء متاحًا.';
  }

  return 'تعذر تنفيذ الإجراء. حاول مرة أخرى.';
}

function ModerationDialog({ id, open, onOpenChange, mode }: { id: string; open: boolean; onOpenChange: (v: boolean) => void; mode: 'suspend' | 'block' }) {
  const mutation = mode === 'suspend' ? useSuspendUser(id) : useBlockUser(id);
  const reasons = mode === 'suspend' ? suspensionReasons : blockReasons;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModerationValues>({
    resolver: zodResolver(moderationSchema),
    defaultValues: {
      reason: reasons[0],
      otherReason: '',
      note: '',
    },
  });

  const reason = watch('reason');

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      reason: reasons[0],
      otherReason: '',
      note: '',
    });
  }, [open, reasons, reset]);

  // Keep the dialog open until the mutation succeeds so failures stay visible and recoverable.
  const submit = handleSubmit((v) =>
    mutation.mutate(v, {
      onSuccess: () => {
        toast.success(mode === 'suspend' ? 'تم تعليق الحساب' : 'تم حظر الحساب');
        onOpenChange(false);
      },
      onError: (error) => toast.error(moderationErrorMessage(error)),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          onOpenChange(next);
        }
      }}
      title={mode === 'suspend' ? 'تعليق الحساب' : 'حظر الحساب'}
      description={
        mode === 'block'
          ? 'سيمنع الحظر المستخدم من الوصول إلى حسابه والخدمات التي تتطلب تسجيل الدخول.'
          : 'التعليق إجراء مؤقت ولا يحذف تاريخ الحساب.'
      }
      footer={
        <>
          <Button variant="secondary" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="danger" disabled={mutation.isPending} onClick={() => void submit()}>
            {mutation.isPending ? 'جارٍ التنفيذ…' : mode === 'suspend' ? 'تأكيد التعليق' : 'تأكيد الحظر'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold">
          السبب
          <Select
            value={reason}
            onValueChange={(v) => setValue('reason', v, { shouldValidate: true })}
            options={reasons.map((v) => ({ value: v, label: v }))}
            disabled={mutation.isPending}
          />
        </label>

        {reason === 'سبب آخر' && (
          <label className="block text-sm font-semibold">
            سبب آخر
            <Textarea className="mt-1" disabled={mutation.isPending} {...register('otherReason')} />
            {errors.otherReason && <p className="mt-1 text-xs text-critical">{errors.otherReason.message}</p>}
          </label>
        )}

        <label className="block text-sm font-semibold">
          ملاحظة داخلية اختيارية
          <Textarea className="mt-1" disabled={mutation.isPending} {...register('note')} />
        </label>
      </div>
    </Modal>
  );
}

function RestoreAccountDialog({ open, onOpenChange, title, description, confirmLabel, pending, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string; confirmLabel: string; pending: boolean; onConfirm: (note?: string) => void }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setNote('');
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          onOpenChange(next);
        }
      }}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button disabled={pending} onClick={() => onConfirm(note.trim() || undefined)}>
            {pending ? 'جارٍ التنفيذ…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-border/60 bg-muted/35 p-3 text-sm leading-6 text-muted-foreground">
          سيبقى سجل الإجراءات الإدارية السابق محفوظًا في حساب المستخدم.
        </div>

        <label className="block text-sm font-semibold">
          ملاحظة داخلية اختيارية
          <Textarea
            className="mt-1"
            value={note}
            disabled={pending}
            onChange={(event) => setNote(event.target.value)}
            placeholder="أضف سياقًا مختصرًا لهذا الإجراء عند الحاجة"
            maxLength={1000}
          />
        </label>
      </div>
    </Modal>
  );
}

export const SuspendUserDialog = (p: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) => (
  <ModerationDialog {...p} mode="suspend" />
);

export const BlockUserDialog = (p: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) => (
  <ModerationDialog {...p} mode="block" />
);

export function ReactivateUserDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const mutation = useReactivateUser(id);

  return (
    <RestoreAccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إعادة تفعيل الحساب"
      description="سيعود المستخدم إلى حالة الحساب النشطة مع الاحتفاظ بكامل السجل السابق."
      confirmLabel="إعادة التفعيل"
      pending={mutation.isPending}
      onConfirm={(note) =>
        mutation.mutate(note, {
          onSuccess: () => {
            toast.success('تمت إعادة تفعيل الحساب');
            onOpenChange(false);
          },
          onError: (error) => toast.error(moderationErrorMessage(error)),
        })
      }
    />
  );
}

export function UnblockUserDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const mutation = useUnblockUser(id);

  return (
    <RestoreAccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="رفع حظر الحساب"
      description="سيتمكن المستخدم من الوصول إلى حسابه مجددًا. سيبقى سجل الحظر محفوظًا."
      confirmLabel="رفع الحظر"
      pending={mutation.isPending}
      onConfirm={(note) =>
        mutation.mutate(note, {
          onSuccess: () => {
            toast.success('تم رفع الحظر');
            onOpenChange(false);
          },
          onError: (error) => toast.error(moderationErrorMessage(error)),
        })
      }
    />
  );
}
