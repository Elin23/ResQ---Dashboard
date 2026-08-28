import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, Checkbox, Input, Modal, SectionHeader, Switch, Textarea } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';
import { notificationChannelLabels } from '../constants';
import { useUpdateNotificationTemplate } from '../hooks';
import type { SystemNotificationTemplate } from '../types';

function renderExample(text: string, template: SystemNotificationTemplate) {
  let result = text;

  // Replace template variables with their sample values for the preview.
  for (const variable of template.availableVariables) {
    result = result.replaceAll(`{{${variable.key}}}`, variable.example);
  }

  return result;
}

function TemplateEditor({ template, open, onOpenChange }: { template: SystemNotificationTemplate; open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useUpdateNotificationTemplate(template.key);

  const [title, setTitle] = useState(template.titleTemplate);
  const [body, setBody] = useState(template.bodyTemplate);
  const [channels, setChannels] = useState(template.channels);
  const [enabled, setEnabled] = useState(template.enabled);

  // Reset the editor whenever a different template is selected.
  useEffect(() => {
    setTitle(template.titleTemplate);
    setBody(template.bodyTemplate);
    setChannels(template.channels);
    setEnabled(template.enabled);
  }, [template]);

  const save = () =>
    mutation.mutate(
      {
        titleTemplate: title,
        bodyTemplate: body,
        channels,
        enabled,
      },
      {
        onSuccess: () => {
          toast.success('تم تحديث قالب الإشعار');
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(
            error.message.startsWith('UNKNOWN_TEMPLATE_VARIABLE')
              ? 'يتضمن القالب متغيرًا غير معروف.'
              : 'تعذر تحديث القالب',
          ),
      },
    );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`تعديل قالب: ${template.name}`}
      description="المتغيرات نصية فقط ولا تنفذ أي تعليمات أو شيفرة."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>

          <Button
            onClick={save}
            disabled={mutation.isPending || !title.trim() || !body.trim()}
          >
            حفظ القالب
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold">
          العنوان
          <Input
            className="mt-1.5"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold">
          النص
          <Textarea
            className="mt-1.5"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            القنوات
          </legend>

          <div className="flex gap-4">
            <Checkbox
              label="داخل التطبيق"
              checked={channels.includes('IN_APP')}
              onCheckedChange={(value) =>
                setChannels(
                  value === true
                    ? channels.includes('IN_APP')
                      ? channels
                      : [...channels, 'IN_APP']
                    : channels.filter((item) => item !== 'IN_APP'),
                )
              }
            />

            <Checkbox
              label="إشعار دفع"
              checked={channels.includes('PUSH')}
              onCheckedChange={(value) =>
                setChannels(
                  value === true
                    ? channels.includes('PUSH')
                      ? channels
                      : [...channels, 'PUSH']
                    : channels.filter((item) => item !== 'PUSH'),
                )
              }
            />
          </div>
        </fieldset>

        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          label="القالب فعال"
        />

        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm font-semibold">
            المتغيرات المتاحة
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {template.availableVariables.length ? (
              template.availableVariables.map((variable) => (
                <Badge key={variable.key}>
                  {`{{${variable.key}}}`} · {variable.label}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                لا توجد متغيرات لهذا القالب.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">
            معاينة بالقيم التجريبية
          </p>

          <p className="mt-2 font-bold">
            {renderExample(title, template)}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {renderExample(body, template)}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export function NotificationTemplatesList({ templates }: { templates: SystemNotificationTemplate[] }) {
  const [selected, setSelected] = useState<SystemNotificationTemplate>();

  // Keep template cards ordered consistently for easier scanning.
  const sorted = useMemo(
    () => [...templates].sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [templates],
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="القوالب التلقائية"
        description="قوالب يستهلكها الخادم عند وقوع أحداث المنتج؛ لا ترسلها صفحة الإدارة مباشرة."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {sorted.map((template) => (
          <Card key={template.key}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">
                    {template.name}
                  </p>

                  {template.required && (
                    <Badge tone="info">
                      قالب أساسي
                    </Badge>
                  )}

                  {!template.enabled && (
                    <Badge>
                      معطل
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {template.description}
                </p>

                <p className="mt-3 text-sm font-semibold">
                  {template.titleTemplate}
                </p>

                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {template.bodyTemplate}
                </p>

                <div className="mt-3 flex gap-1">
                  {template.channels.map((channel) => (
                    <Badge key={channel}>
                      {notificationChannelLabels[channel]}
                    </Badge>
                  ))}
                </div>
              </div>

              <PermissionGuard permission="notifications.templates.update">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelected(template)}
                >
                  تعديل
                </Button>
              </PermissionGuard>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <TemplateEditor
          template={selected}
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) {
              setSelected(undefined);
            }
          }}
        />
      )}
    </div>
  );
}