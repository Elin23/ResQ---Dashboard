import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { AlertTriangle, CalendarClock, Eye, Save, Send } from 'lucide-react';

import { Button, Card, Checkbox, ConfirmDialog, Input, Modal, SectionHeader, Select, Textarea } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';

import { ContentPreview } from './content-preview';
import { articleCategoryOptions, commonTags } from '../constants';
import { useSaveEditorial } from '../hooks';
import { editorialSchema } from '../schemas';
import type { ArticleCategory, ContentKind, EditorialInput } from '../types';
import { slugifyTitle } from '../utils';

function pathFor(kind: ContentKind) {
  return kind === 'ARTICLE'
    ? '/content/articles'
    : kind === 'SUCCESS_STORY'
      ? '/content/success-stories'
      : '/content/awareness';
}

export function EditorialEditor({ kind, id, initial }: { kind: ContentKind; id?: string; initial?: Partial<EditorialInput> }) {
  const navigate = useNavigate();
  const save = useSaveEditorial();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const form = useForm<EditorialInput>({
    resolver: zodResolver(editorialSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content: '',
      tags: [],
      audience: ['ALL'],
      ...initial,
    },
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  const values = watch();

  // Generate the slug from the title only while a custom slug has not been provided.
  useEffect(() => {
    if (!initial?.slug && values.title && !values.slug) {
      setValue('slug', slugifyTitle(values.title), { shouldDirty: true });
    }
  }, [values.title, values.slug, initial?.slug, setValue]);

  const run = (status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'SCHEDULED') =>
    handleSubmit((input) =>
      save.mutate(
        {
          kind:
            kind === 'ARTICLE'
              ? 'article'
              : kind === 'SUCCESS_STORY'
                ? 'story'
                : 'awareness',
          id,
          input,
          status,
        },
        {
          onSuccess: (item) => navigate(`${pathFor(kind)}/${item.id}`),
        },
      ),
    )();

  const exit = () => {
    if (isDirty) {
      setLeaveOpen(true);
      return;
    }

    navigate(pathFor(kind));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        <Card className="space-y-4">
          <SectionHeader
            title="المحتوى الأساسي"
            description="اكتب نصًا واضحًا ومنظمًا. تُحفظ المعاينة كنص آمن دون HTML خام."
          />

          <label className="block text-sm font-medium">
            العنوان
            <Input {...register('title')} className="mt-1" />
          </label>

          {errors.title && (
            <p className="text-sm text-critical">{errors.title.message}</p>
          )}

          <label className="block text-sm font-medium">
            الرابط المختصر
            <Input dir="ltr" {...register('slug')} className="mt-1 text-start" />
          </label>

          {errors.slug && (
            <p className="text-sm text-critical">{errors.slug.message}</p>
          )}

          <label className="block text-sm font-medium">
            الملخص
            <Textarea {...register('summary')} className="mt-1 min-h-20" />
          </label>

          <label className="block text-sm font-medium">
            المحتوى
            <Textarea
              {...register('content')}
              className="mt-1 min-h-72"
              placeholder="استخدم فقرات قصيرة وعناوين نصية واضحة وقوائم بشرطات عند الحاجة."
            />
          </label>

          {errors.content && (
            <p className="text-sm text-critical">{errors.content.message}</p>
          )}
        </Card>

        <Card className="space-y-4">
          <SectionHeader
            title="الصورة الرئيسية"
            description="رابط تجريبي قابل للاستبدال بخدمة رفع وسائط خلفية."
          />

          <label className="block text-sm font-medium">
            رابط الصورة
            <Input dir="ltr" {...register('coverImageUrl')} className="mt-1 text-start" />
          </label>

          <label className="block text-sm font-medium">
            النص البديل للصورة
            <Input {...register('coverAltText')} className="mt-1" />
          </label>
        </Card>

        {kind === 'ARTICLE' && (
          <Card className="space-y-4">
            <SectionHeader title="التصنيف والوسوم" />

            <label className="block text-sm font-medium">
              التصنيف
              <Select
                value={values.category ?? 'ANIMAL_CARE'}
                onValueChange={(value) =>
                  setValue('category', value as ArticleCategory, { shouldDirty: true })
                }
                options={articleCategoryOptions}
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium">الوسوم</p>

              <div className="flex flex-wrap gap-3">
                {commonTags.map((tag) => (
                  <Checkbox
                    key={tag}
                    label={tag}
                    checked={values.tags.includes(tag)}
                    onCheckedChange={(checked) =>
                      setValue(
                        'tags',
                        checked
                          ? [...values.tags, tag]
                          : values.tags.filter((item) => item !== tag),
                        { shouldDirty: true },
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {kind === 'SUCCESS_STORY' && (
          <Card className="space-y-4">
            <SectionHeader
              title="العلاقات التشغيلية"
              description="معرّفات مرجعية فقط؛ لا تُنسخ سجلات الوحدات الأخرى."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                البلاغ
                <Input {...register('reportId')} className="mt-1" placeholder="RQ-2026-00481" />
              </label>

              <label className="text-sm font-medium">
                الجمعية
                <Input {...register('organizationId')} className="mt-1" placeholder="ORG-001" />
              </label>
            </div>
          </Card>
        )}

        <Card className="space-y-4">
          <SectionHeader
            title="إعدادات محركات البحث"
            description="إعدادات خفيفة وليست أداة تحليل SEO."
          />

          <label className="block text-sm font-medium">
            عنوان محركات البحث
            <Input {...register('metaTitle')} className="mt-1" />
            <span className="mt-1 block text-xs text-muted-foreground">
              {values.metaTitle?.length ?? 0}/60
            </span>
          </label>

          <label className="block text-sm font-medium">
            وصف محركات البحث
            <Textarea {...register('metaDescription')} className="mt-1 min-h-20" />
            <span className="mt-1 block text-xs text-muted-foreground">
              {values.metaDescription?.length ?? 0}/160
            </span>
          </label>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="space-y-3">
          <SectionHeader title="النشر" />

          <Button className="w-full" variant="secondary" onClick={() => run('DRAFT')} disabled={save.isPending}>
            <Save className="size-4" />
            حفظ كمسودة
          </Button>

          <PermissionGuard permission="content.review">
            <Button className="w-full" variant="secondary" onClick={() => run('IN_REVIEW')}>
              <Send className="size-4" />
              إرسال للمراجعة
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="content.publish">
            <Button className="w-full" onClick={() => run('PUBLISHED')}>
              نشر الآن
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="content.schedule">
            <Button className="w-full" variant="secondary" onClick={() => setScheduleOpen(true)}>
              <CalendarClock className="size-4" />
              جدولة النشر
            </Button>
          </PermissionGuard>

          <Button className="w-full" variant="ghost" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" />
            معاينة
          </Button>

          <Button className="w-full" variant="ghost" onClick={exit}>
            رجوع
          </Button>

          {isDirty && (
            <div className="flex gap-2 rounded-md bg-pending/10 p-3 text-xs">
              <AlertTriangle className="size-4 shrink-0" />
              لديك تغييرات غير محفوظة.
            </div>
          )}
        </Card>
      </aside>

      <Modal open={previewOpen} onOpenChange={setPreviewOpen} title="معاينة المحتوى">
        <ContentPreview
          title={values.title}
          summary={values.summary}
          content={values.content}
          coverImageUrl={values.coverImageUrl}
          coverAltText={values.coverAltText}
          mode="phone"
        />
      </Modal>

      <Modal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        title="جدولة النشر"
        footer={
          <Button
            onClick={() => {
              setScheduleOpen(false);
              run('SCHEDULED');
            }}
          >
            تأكيد الجدولة
          </Button>
        }
      >
        <label className="block text-sm font-medium">
          تاريخ ووقت النشر
          <Input type="datetime-local" {...register('scheduledAt')} className="mt-1" />
        </label>

        {errors.scheduledAt && (
          <p className="mt-2 text-sm text-critical">
            {errors.scheduledAt.message}
          </p>
        )}
      </Modal>

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="مغادرة المحرر؟"
        description="لديك تغييرات غير محفوظة. ستفقد التعديلات إذا غادرت الآن."
        confirmLabel="مغادرة دون حفظ"
        destructive
        onConfirm={() => navigate(pathFor(kind))}
      />
    </div>
  );
}