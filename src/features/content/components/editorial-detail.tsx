import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Archive, Edit3, RotateCcw } from 'lucide-react';

import { Button, Card, ConfirmDialog, PageHeader, SectionHeader, Textarea } from '@/components/ui';
import { OperationalTimeline } from '@/components/ui/operational-timeline';
import { PermissionGuard } from '@/features/auth/rbac';

import { ContentPreview } from './content-preview';
import { ContentStatusBadge } from './content-status-badge';
import { useAddEditorialNote, useChangeContentStatus } from '../hooks';
import type { Article, AwarenessContent, ContentKind, EditorialRecord, SuccessStory } from '../types';
import { formatEditorialDate } from '../utils';

export function EditorialDetail({ kind, record }: { kind: ContentKind; record: EditorialRecord<Article | SuccessStory | AwarenessContent> }) {
  const item = record.item;
  const navigate = useNavigate();

  const change = useChangeContentStatus();
  const addNote = useAddEditorialNote();

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [note, setNote] = useState('');

  const base =
    kind === 'ARTICLE'
      ? '/content/articles'
      : kind === 'SUCCESS_STORY'
        ? '/content/success-stories'
        : '/content/awareness';

  // Backend mutations use lowercase content names instead of the UI content kind.
  const mutationKind =
    kind === 'ARTICLE'
      ? 'article'
      : kind === 'SUCCESS_STORY'
        ? 'story'
        : 'awareness';

  const summary =
    'excerpt' in item
      ? item.excerpt
      : 'summary' in item
        ? item.summary
        : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title}
        description={`${item.id} · آخر تحديث ${formatEditorialDate(item.updatedAt)}`}
        breadcrumbs={[
          { label: 'المحتوى', href: '/content' },
          {
            label:
              kind === 'ARTICLE'
                ? 'المقالات'
                : kind === 'SUCCESS_STORY'
                  ? 'قصص النجاح'
                  : 'التوعية',
            href: base,
          },
          { label: item.id },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <ContentStatusBadge status={item.status} />

            <PermissionGuard permission="content.update">
              <Button variant="secondary" onClick={() => navigate(`${base}/${item.id}/edit`)}>
                <Edit3 className="size-4" />
                تعديل
              </Button>
            </PermissionGuard>

            {item.status === 'PUBLISHED' && (
              <PermissionGuard permission="content.archive">
                <Button variant="secondary" onClick={() => setArchiveOpen(true)}>
                  <Archive className="size-4" />
                  أرشفة
                </Button>
              </PermissionGuard>
            )}

            {item.status === 'ARCHIVED' && (
              <PermissionGuard permission="content.update">
                <Button
                  variant="secondary"
                  onClick={() =>
                    change.mutate({
                      kind: mutationKind,
                      id: item.id,
                      status: 'DRAFT',
                    })
                  }
                >
                  <RotateCcw className="size-4" />
                  إعادة إلى مسودة
                </Button>
              </PermissionGuard>
            )}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <ContentPreview
            title={item.title}
            summary={summary}
            content={item.content}
            coverImageUrl={item.coverImageUrl}
            coverAltText={item.coverAltText}
          />

          <Card>
            <SectionHeader title="النشاط التحريري" />

            <div className="mt-4">
              <OperationalTimeline
                items={record.timeline.map((event) => ({
                  id: event.id,
                  title: event.title,
                  actor: event.actor,
                  timestampLabel: formatEditorialDate(event.timestamp),
                  details: event.details,
                  tone: event.tone,
                }))}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeader
              title="الملاحظات التحريرية الداخلية"
              description="لا تظهر هذه الملاحظات في المحتوى العام."
            />

            <PermissionGuard permission="content.review">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="اكتب ملاحظة للمراجعين…"
              />

              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() =>
                  addNote.mutate(
                    {
                      id: item.id,
                      note,
                    },
                    {
                      onSuccess: () => setNote(''),
                    },
                  )
                }
              >
                إضافة ملاحظة
              </Button>
            </PermissionGuard>

            <div className="space-y-2">
              {record.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد ملاحظات داخلية.
                </p>
              ) : (
                record.notes.map((noteItem) => (
                  <div key={noteItem.id} className="rounded-md bg-muted p-3 text-sm">
                    <p>{noteItem.note}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {noteItem.adminName} · {formatEditorialDate(noteItem.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <SectionHeader title="المراجعات الأخيرة" />

            <div className="space-y-2">
              {record.revisions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد مراجعات محفوظة بعد.
                </p>
              ) : (
                record.revisions.slice(0, 5).map((revision) => (
                  <div key={revision.id} className="flex justify-between gap-3 text-sm">
                    <span>{revision.summary ?? 'تحديث المحتوى'}</span>

                    <span className="text-xs text-muted-foreground">
                      {formatEditorialDate(revision.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="space-y-3">
            <SectionHeader title="معلومات النشر" />

            <p className="text-sm">
              الحالة: <ContentStatusBadge status={item.status} />
            </p>

            <p className="text-sm text-muted-foreground">
              الكاتب: {item.author.name}
            </p>

            <p className="text-sm text-muted-foreground">
              نُشر: {formatEditorialDate(item.publishedAt)}
            </p>

            <p className="text-sm text-muted-foreground">
              مجدول: {formatEditorialDate(item.scheduledAt)}
            </p>
          </Card>

          {kind === 'SUCCESS_STORY' && (
            <Card className="space-y-2">
              <SectionHeader title="العلاقات" />

              {'reportId' in item && item.reportId && (
                <Link className="block text-sm text-primary hover:underline" to={`/reports/${item.reportId}`}>
                  البلاغ: {item.reportId}
                </Link>
              )}

              {'organizationId' in item && item.organizationId && (
                <Link className="block text-sm text-primary hover:underline" to={`/organizations/${item.organizationId}`}>
                  الجمعية: {item.organizationId}
                </Link>
              )}
            </Card>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="أرشفة المحتوى"
        description="سيبقى المحتوى محفوظًا في السجل ولكنه لن يبقى منشورًا."
        confirmLabel="أرشفة"
        onConfirm={() =>
          change.mutate({
            kind: mutationKind,
            id: item.id,
            status: 'ARCHIVED',
          })
        }
      />
    </div>
  );
}