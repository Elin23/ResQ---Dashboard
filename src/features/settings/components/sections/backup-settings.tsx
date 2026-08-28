import { DatabaseBackup } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, SectionHeader, Select, Switch } from '@/components/ui';
import { useCreateSystemBackup, useUpdateBackupSettings } from '../../hooks';
import type { BackupFrequency, SystemSettings } from '../../types';
import { formatAdminDate } from '../../utils';

const backupFrequencyOptions = [
  { value: 'DAILY', label: 'يوميًا' },
  { value: 'WEEKLY', label: 'أسبوعيًا' },
  { value: 'MONTHLY', label: 'شهريًا' },
] satisfies Array<{ value: BackupFrequency; label: string }>;

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBackup(fileName: string, payload: string) {
  const url = URL.createObjectURL(
    new Blob([payload], {
      type: 'application/json;charset=utf-8',
    }),
  );

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function BackupSettingsManager({ settings, readOnly = false }: { settings: SystemSettings; readOnly?: boolean }) {
  const update = useUpdateBackupSettings();
  const create = useCreateSystemBackup();
  const [draft, setDraft] = useState(settings.backup);

  const changed =
    draft.automaticEnabled !== settings.backup.automaticEnabled ||
    draft.frequency !== settings.backup.frequency ||
    draft.retentionCount !== settings.backup.retentionCount ||
    draft.includeAuditLog !== settings.backup.includeAuditLog;

  const save = async () => {
    try {
      await update.mutateAsync(draft);
      toast.success('تم حفظ إعدادات النسخ الاحتياطي.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر حفظ إعدادات النسخ الاحتياطي.');
    }
  };

  const createNow = async () => {
    try {
      const backup = await create.mutateAsync();

      downloadBackup(backup.fileName, backup.payload);
      toast.success('تم إنشاء النسخة الاحتياطية وتنزيلها.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر إنشاء النسخة الاحتياطية.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-border/45 bg-white shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            title="النسخ الاحتياطي"
            description="إدارة الجدولة والاحتفاظ بالنسخ، مع إمكانية إنشاء نسخة يدوية وتنزيلها فورًا."
          />

          {!readOnly && (
            <Button
              className="h-9 shrink-0 rounded-xl"
              disabled={create.isPending}
              onClick={() => void createNow()}
            >
              <DatabaseBackup className="size-4" />
              {create.isPending ? 'جارٍ الإنشاء…' : 'إنشاء نسخة الآن'}
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border/45 p-3.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">النسخ التلقائي</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  إنشاء نسخة دورية حسب الجدول المحدد.
                </p>
              </div>

              <Switch
                checked={draft.automaticEnabled}
                onCheckedChange={(checked) =>
                  !readOnly &&
                  setDraft({
                    ...draft,
                    automaticEnabled: checked,
                  })
                }
                label={draft.automaticEnabled ? 'مفعل' : 'متوقف'}
              />
            </div>

            <label className="block text-[12px] font-medium text-foreground">
              تكرار النسخة

              <div className="mt-1">
                <Select
                  value={draft.frequency}
                  onValueChange={(value) =>
                    !readOnly &&
                    setDraft({
                      ...draft,
                      frequency: value as BackupFrequency,
                    })
                  }
                  options={backupFrequencyOptions}
                />
              </div>
            </label>

            <label className="block text-[12px] font-medium text-foreground">
              عدد النسخ المحتفظ بها
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={90}
                disabled={readOnly}
                value={draft.retentionCount}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    retentionCount: Math.min(
                      90,
                      Math.max(1, Number(event.target.value) || 1),
                    ),
                  })
                }
              />
            </label>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-medium">تضمين سجل النشاط</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  احتفظ بسجل التغييرات الإدارية ضمن النسخة.
                </p>
              </div>

              <Switch
                checked={draft.includeAuditLog}
                onCheckedChange={(checked) =>
                  !readOnly &&
                  setDraft({
                    ...draft,
                    includeAuditLog: checked,
                  })
                }
                label={draft.includeAuditLog ? 'مضمن' : 'غير مضمن'}
              />
            </div>

            {!readOnly && (
              <div className="flex gap-2 pt-1">
                <Button
                  className="h-9 rounded-xl"
                  disabled={!changed || update.isPending}
                  onClick={() => void save()}
                >
                  حفظ الإعدادات
                </Button>

                <Button
                  className="h-9 rounded-xl"
                  variant="secondary"
                  disabled={!changed}
                  onClick={() => setDraft(settings.backup)}
                >
                  إلغاء
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/45 p-3.5">
            <p className="text-[13px] font-medium">آخر نسخة</p>

            {settings.backup.lastBackupAt ? (
              <dl className="mt-3 space-y-2.5 text-[12px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">تاريخ الإنشاء</dt>
                  <dd className="font-medium">{formatAdminDate(settings.backup.lastBackupAt)}</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">أنشأها</dt>
                  <dd className="font-medium">{settings.backup.lastBackupBy?.name ?? 'النظام'}</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">الجدولة</dt>
                  <dd className="font-medium">
                    {settings.backup.automaticEnabled
                      ? backupFrequencyOptions.find(
                          (option) => option.value === settings.backup.frequency,
                        )?.label
                      : 'متوقفة'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-[12px] text-muted-foreground">
                لم يتم إنشاء نسخة احتياطية بعد.
              </p>
            )}

            {/* Mock backups represent the UI flow only; production backup enforcement belongs to the backend. */}
            <div className="mt-4 rounded-lg bg-muted/35 px-3 py-2.5 text-[11px] leading-5 text-muted-foreground">
              النسخة الحالية تجريبية داخل بيئة الـMock. عند ربط الـBackend يجب إنشاء النسخة الكاملة على الخادم وقاعدة البيانات وحمايتها وفق سياسة النسخ المعتمدة.
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl border-border/45 bg-white shadow-none">
        <SectionHeader
          title="سجل النسخ"
          description="آخر النسخ التي تم إنشاؤها وفق سياسة الاحتفاظ الحالية."
        />

        <div className="mt-4 overflow-hidden rounded-lg border border-border/45">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-muted/30 px-3 py-2 text-[11px] font-medium text-muted-foreground sm:grid-cols-[1.2fr_1fr_auto_auto]">
            <span>النسخة</span>
            <span className="hidden sm:block">بواسطة</span>
            <span>النوع</span>
            <span>الحجم</span>
          </div>

          {settings.backupHistory.length ? (
            settings.backupHistory.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-border/35 px-3 py-2.5 text-[12px] sm:grid-cols-[1.2fr_1fr_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{record.fileName}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatAdminDate(record.createdAt)}
                  </p>
                </div>

                <span className="hidden text-muted-foreground sm:block">
                  {record.createdBy.name}
                </span>

                <Badge tone={record.kind === 'MANUAL' ? 'info' : 'neutral'}>
                  {record.kind === 'MANUAL' ? 'يدوية' : 'تلقائية'}
                </Badge>

                <span dir="ltr" className="text-muted-foreground">
                  {formatBytes(record.sizeBytes)}
                </span>
              </div>
            ))
          ) : (
            <p className="p-4 text-[12px] text-muted-foreground">
              لا يوجد سجل نسخ بعد.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
