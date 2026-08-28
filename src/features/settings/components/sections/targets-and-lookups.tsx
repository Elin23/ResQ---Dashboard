import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBlocker } from 'react-router';
import { toast } from 'sonner';
import { Badge, Button, Card, ConfirmDialog, Input, SectionHeader, Switch } from '@/components/ui';
import { lookupLabels } from '../../constants';
import { useAddLookup, useUpdateLookup, useUpdateTargets } from '../../hooks';
import { targetsSchema } from '../../schemas';
import type { LookupType, SystemLookupItem, SystemSettings } from '../../types';

export function TargetsForm({ settings }: { settings: SystemSettings }) {
  const mutation = useUpdateTargets();
  const [pending, setPending] = useState<SystemSettings['targets'] | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SystemSettings['targets']>({
    resolver: zodResolver(targetsSchema),
    defaultValues: settings.targets,
  });

  // Warn before leaving when operational targets have unsaved changes.
  const blocker = useBlocker(isDirty);

  const save = async () => {
    if (!pending) {
      return;
    }

    try {
      await mutation.mutateAsync(pending);
      toast.success('تم حفظ أهداف التشغيل.');
      reset(pending);
      setPending(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر حفظ الإعدادات.');
    }
  };

  return (
    <Card>
      <SectionHeader
        title="أهداف التشغيل الداخلية"
        description="هذه أهداف تشغيلية داخلية وليست اتفاقيات SLA تعاقدية."
      />

      <form
        className="mt-4 grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit((v) => setPending(v))}
      >
        {(
          [
            ['reportReviewMinutes', 'وقت مراجعة البلاغ المستهدف'],
            ['missionAcceptanceMinutes', 'وقت قبول المهمة المستهدف'],
            ['missionArrivalMinutes', 'وقت الوصول المستهدف'],
            ['supportFirstResponseMinutes', 'وقت أول استجابة للدعم'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm font-semibold">
            {label}

            <div className="mt-1 flex items-center gap-2">
              <Input
                type="number"
                {...register(key, { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">دقيقة</span>
            </div>

            {errors[key] && <span className="text-xs text-critical">قيمة بين 1 و1440 مطلوبة.</span>}
          </label>
        ))}

        <label className="text-sm font-semibold">
          هدف مراجعة التبني
          <Input
            type="number"
            className="mt-1"
            {...register('adoptionReviewHours', { valueAsNumber: true })}
          />
          <span className="text-xs text-muted-foreground">بالساعات</span>
        </label>

        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={!isDirty || mutation.isPending}>
            مراجعة التغييرات
          </Button>

          <Button
            variant="secondary"
            disabled={!isDirty}
            onClick={() => reset(settings.targets)}
          >
            إلغاء
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title="مراجعة تغيير أهداف التشغيل"
        description="سيتم تحديث أهداف تشغيلية تستخدمها التحليلات ومؤشرات التجاوز. راجع القيم قبل التطبيق."
        confirmLabel="حفظ التغييرات"
        onConfirm={save}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') {
            blocker.reset();
          }
        }}
        title="مغادرة الإعدادات؟"
        description="لديك تغييرات غير محفوظة في أهداف التشغيل."
        confirmLabel="مغادرة دون حفظ"
        destructive
        onConfirm={() => {
          if (blocker.state === 'blocked') {
            blocker.proceed();
          }
        }}
      />
    </Card>
  );
}

function LookupRow({ type, item, index, count, readOnly }: { type: LookupType; item: SystemLookupItem; index: number; count: number; readOnly: boolean }) {
  const update = useUpdateLookup();
  const [draft, setDraft] = useState(item.label);

  const save = async (next: SystemLookupItem) => {
    try {
      await update.mutateAsync({
        type,
        item: next,
      });
      toast.success('تم تحديث القيمة المرجعية.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تحديث القيمة.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border p-3">
      <Input
        className="min-w-52 flex-1"
        value={draft}
        disabled={readOnly}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={`تسمية ${item.key}`}
      />

      {!readOnly && (
        <Button
          size="sm"
          variant="secondary"
          disabled={draft.trim().length < 2 || draft === item.label}
          onClick={() =>
            void save({
              ...item,
              label: draft.trim(),
            })
          }
        >
          حفظ الاسم
        </Button>
      )}

      <Switch
        checked={item.active}
        onCheckedChange={(checked) =>
          !readOnly &&
          void save({
            ...item,
            active: checked,
          })
        }
        label={item.active ? 'فعال' : 'غير فعال'}
      />

      {!readOnly && (
        <>
          <Button
            size="sm"
            variant="secondary"
            disabled={index === 0}
            onClick={() =>
              void save({
                ...item,
                order: item.order - 1,
              })
            }
          >
            أعلى
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={index === count - 1}
            onClick={() =>
              void save({
                ...item,
                order: item.order + 1,
              })
            }
          >
            أسفل
          </Button>
        </>
      )}

      {item.locked && <Badge>مفتاح ثابت</Badge>}
    </div>
  );
}

export function LookupManager({ type, items, readOnly = false }: { type: LookupType; items: SystemLookupItem[]; readOnly?: boolean }) {
  const add = useAddLookup();
  const [label, setLabel] = useState('');
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <SectionHeader
        title={lookupLabels[type]}
        description="القيم ذات المفاتيح الثابتة يمكن تعديل عرضها/تفعيلها دون تغيير مفتاح الحالة البرمجي."
      />

      <div className="mt-4 space-y-2">
        {sorted.map((item, index) => (
          <LookupRow
            key={item.id}
            type={type}
            item={item}
            index={index}
            count={sorted.length}
            readOnly={readOnly}
          />
        ))}
      </div>

      {!readOnly && !items.some((i) => i.locked) && (
        <div className="mt-4 flex gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="قيمة جديدة"
          />

          <Button
            disabled={label.trim().length < 2}
            onClick={async () => {
              try {
                await add.mutateAsync({
                  type,
                  label: label.trim(),
                });

                setLabel('');
                toast.success('تمت إضافة القيمة المرجعية.');
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'تعذر إضافة القيمة.');
              }
            }}
          >
            إضافة
          </Button>
        </div>
      )}
    </Card>
  );
}

