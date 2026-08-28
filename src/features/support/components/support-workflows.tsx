import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Modal, Select, Textarea } from '@/components/ui';

import { escalationTeamLabels, supportAssignees, supportPriorityLabels } from '../constants';
import { useAssignSupportTicket, useChangeTicketPriority, useEscalateTicket, useReopenTicket, useResolveTicket } from '../hooks';
import { assignmentSchema, escalationSchema, prioritySchema, reopenSchema, resolutionSchema } from '../schemas';
import type { SupportEscalationTeam, SupportTicketPriority } from '../types';

type Assign = {
  assigneeId: string;
};

type Priority = {
  priority: SupportTicketPriority;
  reason?: string;
};

type Esc = {
  targetTeam: SupportEscalationTeam;
  reason: string;
};

type Text = {
  summary: string;
};

type Reopen = {
  reason: string;
};

export function AssignmentDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const m = useAssignSupportTicket(id);
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Assign>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { assigneeId: '' },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const submit = handleSubmit((v) => {
    const a = supportAssignees.find((x) => x.id === v.assigneeId);

    if (a) {
      m.mutate(
        {
          assigneeId: a.id,
          assigneeName: a.name,
          assigneeRole: a.role,
        },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    }
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="إسناد التذكرة"
      description="اختر مسؤول الدعم الذي سيتولى متابعة الحالة."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => void submit()} disabled={m.isPending}>
            تأكيد الإسناد
          </Button>
        </>
      }
    >
      <Select
        value={watch('assigneeId')}
        onValueChange={(v) => setValue('assigneeId', v, { shouldValidate: true })}
        options={supportAssignees.map((a) => ({
          value: a.id,
          label: `${a.name} — ${a.role} · ${a.workload} تذاكر`,
        }))}
      />

      {errors.assigneeId && <p className="mt-1 text-xs text-critical">{errors.assigneeId.message}</p>}
    </Modal>
  );
}

export function PriorityDialog({ id, current, open, onOpenChange }: { id: string; current: SupportTicketPriority; open: boolean; onOpenChange: (v: boolean) => void }) {
  const m = useChangeTicketPriority(id);
  const {
    watch,
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Priority>({
    resolver: zodResolver(prioritySchema),
    defaultValues: {
      priority: current,
      reason: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        priority: current,
        reason: '',
      });
    }
  }, [open, current, reset]);

  const submit = handleSubmit((v) =>
    m.mutate(v, {
      onSuccess: () => onOpenChange(false),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="تغيير الأولوية"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => void submit()}>حفظ</Button>
        </>
      }
    >
      <Select
        value={watch('priority')}
        onValueChange={(v) => setValue('priority', v as SupportTicketPriority, { shouldValidate: true })}
        options={Object.entries(supportPriorityLabels).map(([value, label]) => ({
          value,
          label,
        }))}
      />

      {/* Urgent priority changes require a reason. */}
      <label className="mt-4 block text-sm font-semibold" htmlFor="priority-reason">
        سبب التغيير {watch('priority') === 'URGENT' ? '(مطلوب)' : '(اختياري)'}
      </label>

      <Textarea id="priority-reason" {...register('reason')} className="mt-2" />

      {errors.reason && <p className="mt-1 text-xs text-critical">{errors.reason.message}</p>}
    </Modal>
  );
}

export function EscalationDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const m = useEscalateTicket(id);
  const {
    watch,
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Esc>({
    resolver: zodResolver(escalationSchema),
    defaultValues: {
      targetTeam: 'OPERATIONS',
      reason: '',
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const submit = handleSubmit((v) =>
    m.mutate(v, {
      onSuccess: () => onOpenChange(false),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="تصعيد التذكرة"
      description="التصعيد لا يمنح فريق الدعم صلاحيات الفريق المستهدف."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => void submit()}>تصعيد</Button>
        </>
      }
    >
      <Select
        value={watch('targetTeam')}
        onValueChange={(v) => setValue('targetTeam', v as SupportEscalationTeam)}
        options={Object.entries(escalationTeamLabels).map(([value, label]) => ({
          value,
          label,
        }))}
      />

      <label className="mt-4 block text-sm font-semibold" htmlFor="escalation-reason">
        سبب التصعيد
      </label>

      <Textarea id="escalation-reason" {...register('reason')} className="mt-2" />

      {errors.reason && <p className="mt-1 text-xs text-critical">{errors.reason.message}</p>}
    </Modal>
  );
}

export function ResolutionDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const m = useResolveTicket(id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Text>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: { summary: '' },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const submit = handleSubmit((v) =>
    m.mutate(v, {
      onSuccess: () => onOpenChange(false),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="حل التذكرة"
      description="اكتب ملخصًا واضحًا للحل ليبقى في سجل الحالة."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => void submit()}>تسجيل الحل</Button>
        </>
      }
    >
      <label className="block text-sm font-semibold" htmlFor="resolution-summary">
        ملخص الحل
      </label>

      <Textarea id="resolution-summary" {...register('summary')} className="mt-2" />

      {errors.summary && <p className="mt-1 text-xs text-critical">{errors.summary.message}</p>}
    </Modal>
  );
}

export function ReopenDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const m = useReopenTicket(id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Reopen>({
    resolver: zodResolver(reopenSchema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const submit = handleSubmit((v) =>
    m.mutate(v, {
      onSuccess: () => onOpenChange(false),
    }),
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="إعادة فتح التذكرة"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => void submit()}>إعادة الفتح</Button>
        </>
      }
    >
      <label className="block text-sm font-semibold" htmlFor="reopen-reason">
        سبب إعادة الفتح
      </label>

      <Textarea id="reopen-reason" {...register('reason')} className="mt-2" />

      {errors.reason && <p className="mt-1 text-xs text-critical">{errors.reason.message}</p>}
    </Modal>
  );
}