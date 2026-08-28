import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, ConfirmDialog, IconButton, Input, Modal, SectionHeader, Select, Switch } from '@/components/ui';
import { useAddEmergencyContact, useDeleteEmergencyContact, useUpdateEmergencyContact, useUpdateMediaLimits } from '../../hooks';
import type { EmergencyContact, EmergencyContactCategory, SystemSettings } from '../../types';

export function MediaLimitsForm({ settings, readOnly = false }: { settings: SystemSettings; readOnly?: boolean }) {
  const mutation = useUpdateMediaLimits();
  const [value, setValue] = useState(settings.media);
  const [confirm, setConfirm] = useState(false);

  const valid =
    value.maxImages >= 1 &&
    value.maxImages <= 20 &&
    value.maxImageMb >= 1 &&
    value.maxImageMb <= 25 &&
    value.maxVideoMb >= 1 &&
    value.maxVideoMb <= 200;

  const save = async () => {
    try {
      await mutation.mutateAsync(value);
      toast.success('تم تحديث حدود الوسائط.');
      setConfirm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تحديث حدود الوسائط.');
    }
  };

  return (
    <Card>
      <SectionHeader
        title="حدود الوسائط"
        description="خيارات مقيدة للواجهة؛ يجب على الخادم فرض الحجم والنوع فعليًا."
      />

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold">
          الحد الأقصى للصور
          <Input
            type="number"
            min={1}
            max={20}
            disabled={readOnly}
            className="mt-1"
            value={value.maxImages}
            onChange={(e) =>
              setValue({
                ...value,
                maxImages: Number(e.target.value),
              })
            }
          />
        </label>

        <label className="text-sm font-semibold">
          حجم الصورة MB
          <Input
            type="number"
            min={1}
            max={25}
            disabled={readOnly}
            className="mt-1"
            value={value.maxImageMb}
            onChange={(e) =>
              setValue({
                ...value,
                maxImageMb: Number(e.target.value),
              })
            }
          />
        </label>

        <label className="text-sm font-semibold">
          حجم الفيديو MB
          <Input
            type="number"
            min={1}
            max={200}
            disabled={readOnly}
            className="mt-1"
            value={value.maxVideoMb}
            onChange={(e) =>
              setValue({
                ...value,
                maxVideoMb: Number(e.target.value),
              })
            }
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {value.allowedTypes.map((type) => (
          <Badge key={type}>{type}</Badge>
        ))}
      </div>

      {!readOnly && (
        <Button
          className="mt-4"
          disabled={!valid || mutation.isPending}
          onClick={() => setConfirm(true)}
        >
          مراجعة وحفظ
        </Button>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="تأكيد حدود الوسائط"
        description="سيتم تحديث حدود الرفع المعروضة للتطبيق. يجب أن يطبق الخادم الحدود نفسها لمنع التجاوز."
        confirmLabel="حفظ الحدود"
        onConfirm={save}
      />
    </Card>
  );
}

const emergencyCategoryOptions = [
  { value: 'VETERINARY', label: 'طوارئ بيطرية' },
  { value: 'RESCUE', label: 'طوارئ حيوانات' },
  { value: 'OTHER', label: 'جهة أخرى' },
] satisfies Array<{ value: EmergencyContactCategory; label: string }>;

const emergencyCategoryLabels: Record<EmergencyContactCategory, string> = {
  VETERINARY: 'طوارئ بيطرية',
  RESCUE: 'طوارئ حيوانات',
  OTHER: 'جهة أخرى',
};

export function EmergencyContactsManager({ settings, readOnly = false }: { settings: SystemSettings; readOnly?: boolean }) {
  const update = useUpdateEmergencyContact();
  const add = useAddEmergencyContact();
  const remove = useDeleteEmergencyContact();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [category, setCategory] = useState<EmergencyContactCategory>('VETERINARY');
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [deleting, setDeleting] = useState<EmergencyContact | null>(null);

  const saveEdit = async () => {
    if (!editing) {
      return;
    }

    try {
      await update.mutateAsync(editing);
      toast.success('تم تحديث جهة اتصال الطوارئ.');
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر تحديث جهة الاتصال.');
    }
  };

  return (
    <Card className="rounded-xl border-border/45 bg-white shadow-none">
      <SectionHeader
        title="جهات اتصال الطوارئ"
        description="أرقام موثوقة يمكن إظهارها داخل التطبيق للحالات العاجلة. يمكنك إضافة الجهة وتعديلها أو إيقاف ظهورها دون حذفها."
      />

      <div className="mt-4 grid gap-2.5 lg:grid-cols-2">
        {settings.emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-lg border border-border/45 px-3.5 py-3 transition-colors hover:bg-muted/25"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground">{contact.name}</p>
                  <Badge tone={contact.active ? 'success' : 'neutral'}>
                    {contact.active ? 'ظاهر في التطبيق' : 'متوقف'}
                  </Badge>
                </div>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {emergencyCategoryLabels[contact.category]}
                  {contact.governorate ? ` · ${contact.governorate}` : ''}
                </p>

                <p dir="ltr" className="mt-1 text-start text-[12px] font-medium text-foreground">
                  {contact.phone}
                </p>
              </div>

              {!readOnly && (
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={`تعديل ${contact.name}`}
                    onClick={() => setEditing(contact)}
                  >
                    <Pencil className="size-4" />
                  </IconButton>

                  <IconButton
                    label={`حذف ${contact.name}`}
                    onClick={() => setDeleting(contact)}
                  >
                    <Trash2 className="size-4 text-critical" />
                  </IconButton>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/35 pt-2.5">
              <span className="text-[11px] text-muted-foreground">حالة الظهور</span>

              <Switch
                checked={contact.active}
                onCheckedChange={(checked) =>
                  !readOnly &&
                  void update
                    .mutateAsync({
                      ...contact,
                      active: checked,
                    })
                    .catch(() => toast.error('تعذر تحديث حالة جهة الاتصال.'))
                }
                label={contact.active ? 'فعال' : 'غير فعال'}
              />
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-5 border-t border-border/40 pt-4">
          <p className="text-[13px] font-semibold">إضافة جهة اتصال</p>

          <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            <Input
              placeholder="اسم الجهة"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              dir="ltr"
              placeholder="رقم الهاتف"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <Select
              value={category}
              onValueChange={(value) => setCategory(value as EmergencyContactCategory)}
              options={emergencyCategoryOptions}
            />

            <Input
              placeholder="المحافظة (اختياري)"
              value={governorate}
              onChange={(event) => setGovernorate(event.target.value)}
            />

            <Button
              className="h-9 rounded-xl"
              disabled={
                add.isPending ||
                name.trim().length < 3 ||
                phone.trim().length < 6
              }
              onClick={async () => {
                try {
                  await add.mutateAsync({
                    name: name.trim(),
                    phone: phone.trim(),
                    category,
                    governorate: governorate.trim() || undefined,
                    active: true,
                  });

                  setName('');
                  setPhone('');
                  setGovernorate('');
                  setCategory('VETERINARY');
                  toast.success('تمت إضافة جهة اتصال الطوارئ.');
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'تعذر إضافة جهة الاتصال.');
                }
              }}
            >
              إضافة
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="تعديل جهة اتصال الطوارئ"
        description="حدّث المعلومات التي ستظهر داخل التطبيق."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              إلغاء
            </Button>

            <Button
              disabled={
                !editing ||
                update.isPending ||
                editing.name.trim().length < 3 ||
                editing.phone.trim().length < 6
              }
              onClick={() => void saveEdit()}
            >
              حفظ
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <label className="block text-[12px] font-medium">
              اسم الجهة
              <Input
                className="mt-1"
                value={editing.name}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    name: event.target.value,
                  })
                }
              />
            </label>

            <label className="block text-[12px] font-medium">
              رقم الهاتف
              <Input
                dir="ltr"
                className="mt-1"
                value={editing.phone}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    phone: event.target.value,
                  })
                }
              />
            </label>

            <label className="block text-[12px] font-medium">
              نوع الجهة

              <div className="mt-1">
                <Select
                  value={editing.category}
                  onValueChange={(value) =>
                    setEditing({
                      ...editing,
                      category: value as EmergencyContactCategory,
                    })
                  }
                  options={emergencyCategoryOptions}
                />
              </div>
            </label>

            <label className="block text-[12px] font-medium">
              المحافظة
              <Input
                className="mt-1"
                value={editing.governorate ?? ''}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    governorate: event.target.value || undefined,
                  })
                }
              />
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف جهة الاتصال؟"
        description={deleting ? `سيتم حذف ${deleting.name} من قائمة جهات الطوارئ.` : ''}
        confirmLabel="حذف"
        destructive
        onConfirm={async () => {
          if (!deleting) {
            return;
          }

          try {
            await remove.mutateAsync(deleting.id);
            toast.success('تم حذف جهة الاتصال.');
            setDeleting(null);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'تعذر حذف جهة الاتصال.');
          }
        }}
      />
    </Card>
  );
}

