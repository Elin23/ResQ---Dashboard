import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowDown, ArrowUp, Edit3, Plus } from 'lucide-react';

import { Button, Card, EmptyState, ErrorState, Input, Modal, PageHeader, Select, Switch, Textarea } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';

import { faqCategories } from '../constants';
import { useFaqItems, useMoveFaq, useSaveFaq, useToggleFaq } from '../hooks';
import { faqSchema } from '../schemas';
import type { FaqItem } from '../types';

interface FaqForm {
  question: string;
  answer: string;
  category: string;
}

export function FaqPage() {
  const query = useFaqItems();
  const save = useSaveFaq();
  const toggle = useToggleFaq();
  const move = useMoveFaq();

  const [editing, setEditing] = useState<FaqItem | undefined>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const form = useForm<FaqForm>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'عام',
    },
  });

  // Reuse the same modal for both creating and editing FAQ items.
  const show = (item?: FaqItem) => {
    setEditing(item);

    form.reset(
      item
        ? {
            question: item.question,
            answer: item.answer,
            category: item.category,
          }
        : {
            question: '',
            answer: '',
            category: 'عام',
          },
    );

    setOpen(true);
  };

  const submit = form.handleSubmit((values) =>
    save.mutate(
      {
        ...values,
        id: editing?.id,
      },
      {
        onSuccess: () => setOpen(false),
      },
    ),
  );

  if (query.isError) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  // Search across the question, answer, and category.
  const items = (query.data ?? []).filter((item) =>
    `${item.question} ${item.answer} ${item.category}`.includes(search),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="الأسئلة الشائعة"
        description="إدارة الأسئلة والإجابات وترتيب ظهورها للمستخدمين."
        breadcrumbs={[
          { label: 'المحتوى', href: '/content' },
          { label: 'الأسئلة الشائعة' },
        ]}
        actions={
          <PermissionGuard permission="faq.update">
            <Button onClick={() => show()}>
              <Plus className="size-4" />
              إضافة سؤال
            </Button>
          </PermissionGuard>
        }
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="البحث في الأسئلة الشائعة"
        className="max-w-md"
      />

      {items.length === 0 ? (
        <EmptyState title="لا توجد أسئلة شائعة ضمن هذا القسم." />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      #{item.order}
                    </span>
                  </div>

                  <h2 className="mt-1 font-bold">
                    {item.question}
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </div>

                <PermissionGuard permission="faq.update">
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={item.active}
                      onCheckedChange={(active) =>
                        toggle.mutate({
                          id: item.id,
                          active,
                        })
                      }
                      label={item.active ? 'نشط' : 'غير نشط'}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => show(item)}
                    >
                      <Edit3 className="size-4" />
                      تعديل
                    </Button>

                    <Button
                      aria-label="تحريك للأعلى"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() =>
                        move.mutate({
                          id: item.id,
                          direction: 'up',
                        })
                      }
                    >
                      <ArrowUp className="size-4" />
                    </Button>

                    <Button
                      aria-label="تحريك للأسفل"
                      variant="ghost"
                      size="sm"
                      disabled={index === items.length - 1}
                      onClick={() =>
                        move.mutate({
                          id: item.id,
                          direction: 'down',
                        })
                      }
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'تعديل سؤال شائع' : 'إضافة سؤال شائع'}
        footer={
          <Button onClick={submit}>
            حفظ
          </Button>
        }
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            السؤال
            <Input {...form.register('question')} className="mt-1" />
          </label>

          <label className="block text-sm font-medium">
            الإجابة
            <Textarea {...form.register('answer')} className="mt-1" />
          </label>

          <label className="block text-sm font-medium">
            التصنيف
            <Select
              value={form.watch('category')}
              onValueChange={(value) =>
                form.setValue('category', value, { shouldDirty: true })
              }
              options={faqCategories.map((value) => ({
                value,
                label: value,
              }))}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}