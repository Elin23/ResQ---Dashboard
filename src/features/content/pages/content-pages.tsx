import { Link, useParams, useSearchParams } from 'react-router';
import { BookOpen, HelpCircle, Lightbulb, Plus, Star } from 'lucide-react';
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { PermissionGuard } from '@/features/auth/rbac';
import { ContentFilterBar } from '../components/content-filter-bar';
import { EditorialDetail } from '../components/editorial-detail';
import { EditorialEditor } from '../components/editorial-editor';
import { EditorialList } from '../components/editorial-list';
import { useArticles, useAwarenessContent, useContentOverview, useEditorialRecord, useSuccessStories } from '../hooks';
import type { Article, AwarenessContent, ContentKind, ContentListFilters, EditorialInput, SuccessStory } from '../types';

function useFilters() {
  const [params, setParams] = useSearchParams();

  const filters: ContentListFilters = {
    search: params.get('search') ?? '',
    status: (params.get('status') ?? undefined) as ContentListFilters['status'],
    category: params.get('category') ?? undefined,
    author: params.get('author') ?? undefined,
    tag: params.get('tag') ?? undefined,
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
    page: Number(params.get('page') ?? 1),
    pageSize: Number(params.get('pageSize') ?? 10),
  };

  // Keep active list filters in the URL and skip default values.
  const update = (patch: Partial<ContentListFilters>) => {
    const next = { ...filters, ...patch };
    const searchParams = new URLSearchParams();

    Object.entries(next).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        !(key === 'page' && value === 1) &&
        !(key === 'pageSize' && value === 10)
      ) {
        searchParams.set(key, String(value));
      }
    });

    setParams(searchParams);
  };

  return [filters, update] as const;
}

const configs = {
  ARTICLE: {
    title: 'المقالات',
    description: 'إدارة المحتوى التعليمي والإرشادي المنشور في تطبيق ResQ.',
    base: '/content/articles',
    newLabel: 'مقال جديد',
  },
  SUCCESS_STORY: {
    title: 'قصص النجاح',
    description: 'توثيق قصص الإنقاذ والتعافي والتبني المرتبطة بسجلات ResQ.',
    base: '/content/success-stories',
    newLabel: 'قصة نجاح جديدة',
  },
  AWARENESS: {
    title: 'محتوى التوعية',
    description: 'إدارة الرسائل التوعوية الموجهة للمجتمع والجهات المشاركة.',
    base: '/content/awareness',
    newLabel: 'محتوى توعوي جديد',
  },
} as const;

export function ContentLandingPage() {
  const query = useContentOverview();

  if (query.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-40" />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  const cards = [
    ['المقالات', query.data.articles, '/content/articles', BookOpen],
    ['قصص النجاح', query.data.stories, '/content/success-stories', Star],
    ['التوعية', query.data.awareness, '/content/awareness', Lightbulb],
    ['الأسئلة الشائعة', query.data.faq, '/content/faq', HelpCircle],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المحتوى"
        description="مساحة العمل التحريرية للمقالات وقصص النجاح والتوعية والأسئلة الشائعة."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(([label, metrics, path, Icon]) => (
          <Link key={path} to={path}>
            <Card className="h-full transition hover:bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{label}</h2>

                  <p className="mt-2 text-3xl font-bold">{metrics.total}</p>

                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span>{metrics.drafts} مسودة</span>
                    <span>{metrics.published} منشور</span>
                    <span>{metrics.scheduled} مجدول</span>
                  </div>
                </div>

                <span className="rounded-md bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function EditorialListPage({ kind }: { kind: ContentKind }) {
  const config = configs[kind];
  const [filters, setFilters] = useFilters();

  const articlesQuery = useArticles(filters);
  const storiesQuery = useSuccessStories(filters);
  const awarenessQuery = useAwarenessContent(filters);

  // Pick the correct query while keeping one shared list page.
  const query =
    kind === 'ARTICLE'
      ? articlesQuery
      : kind === 'SUCCESS_STORY'
        ? storiesQuery
        : awarenessQuery;

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[
          { label: 'المحتوى', href: '/content' },
          { label: config.title },
        ]}
        actions={
          <PermissionGuard permission="content.create">
            <Link to={`${config.base}/new`}>
              <Button>
                <Plus className="size-4" />
                {config.newLabel}
              </Button>
            </Link>
          </PermissionGuard>
        }
      />

      <ContentFilterBar
        filters={filters}
        onChange={setFilters}
        articles={kind === 'ARTICLE'}
      />

      {query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <EditorialList
          items={query.data?.items ?? []}
          loading={query.isLoading}
          total={query.data?.total ?? 0}
          pageCount={query.data?.pageCount ?? 1}
          page={filters.page}
          pageSize={filters.pageSize}
          onPageChange={(page, pageSize) => setFilters({ page, pageSize })}
          basePath={config.base}
          emptyTitle={
            filters.status === 'DRAFT'
              ? 'لا توجد مسودات حالياً.'
              : 'لا يوجد محتوى يطابق عوامل التصفية الحالية.'
          }
        />
      )}
    </div>
  );
}

function toInput(item: Article | SuccessStory | AwarenessContent): Partial<EditorialInput> {
  // Convert the stored content shape back into editor form values.
  return {
    title: item.title,
    slug: item.slug,
    summary:
      'excerpt' in item
        ? item.excerpt
        : 'summary' in item
          ? (item.summary ?? '')
          : '',
    content: item.content,
    coverImageUrl: item.coverImageUrl,
    coverAltText: item.coverAltText,
    category: 'category' in item ? item.category : undefined,
    tags: 'tags' in item ? item.tags : [],
    scheduledAt: item.scheduledAt,
    metaTitle: 'seo' in item ? item.seo?.metaTitle : undefined,
    metaDescription: 'seo' in item ? item.seo?.metaDescription : undefined,
    reportId: 'reportId' in item ? item.reportId : undefined,
    organizationId: 'organizationId' in item ? item.organizationId : undefined,
    audience: 'audience' in item ? item.audience : undefined,
  };
}

export function EditorialEditorPage({ kind, isNew = false }: { kind: ContentKind; isNew?: boolean }) {
  const params = useParams();

  const id =
    kind === 'ARTICLE'
      ? params.articleId
      : kind === 'SUCCESS_STORY'
        ? params.storyId
        : params.contentId;

  const query = useEditorialRecord(
    kind === 'ARTICLE'
      ? 'article'
      : kind === 'SUCCESS_STORY'
        ? 'story'
        : 'awareness',
    isNew ? '' : (id ?? ''),
  );

  // New content does not need an existing record, but edit mode does.
  if (!isNew && query.isLoading) {
    return <Skeleton className="h-[36rem]" />;
  }

  if (!isNew && (query.isError || !query.data)) {
    return (
      <ErrorState
        title="تعذر تحميل المحتوى"
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={isNew ? configs[kind].newLabel : `تعديل: ${query.data?.item.title ?? ''}`}
        breadcrumbs={[
          { label: 'المحتوى', href: '/content' },
          { label: configs[kind].title, href: configs[kind].base },
          { label: isNew ? 'جديد' : 'تعديل' },
        ]}
      />

      <EditorialEditor
        kind={kind}
        id={isNew ? undefined : id}
        initial={query.data ? toInput(query.data.item) : undefined}
      />
    </div>
  );
}

export function EditorialDetailsPage({ kind }: { kind: ContentKind }) {
  const params = useParams();

  const id =
    kind === 'ARTICLE'
      ? params.articleId
      : kind === 'SUCCESS_STORY'
        ? params.storyId
        : params.contentId;

  const query = useEditorialRecord(
    kind === 'ARTICLE'
      ? 'article'
      : kind === 'SUCCESS_STORY'
        ? 'story'
        : 'awareness',
    id ?? '',
  );

  if (query.isLoading) {
    return <Skeleton className="h-[34rem]" />;
  }

  if (query.isError) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  if (!query.data) {
    return (
      <EmptyState
        title="المحتوى غير موجود"
        description="قد يكون المعرّف غير صحيح أو تم نقله."
      />
    );
  }

  return (
    <EditorialDetail
      kind={kind}
      record={query.data}
    />
  );
}