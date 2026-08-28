import { useCallback, useMemo, useState } from 'react';
import { List, Map } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, ErrorState, ExportMenuButton, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams, readEnumParam } from '@/lib/search-params';
import { FeedingPointFilterBar } from '../components/feeding-point-filter-bar';
import { FeedingPointSummaryCards } from '../components/feeding-point-summary';
import { FeedingPointsMapView } from '../components/feeding-points-map-view';
import { FeedingPointsTable } from '../components/feeding-points-table';
import { creatorTypeLabels, feedingPointStatusLabels } from '../constants';
import { useFeedingPoints, useFeedingPointSummary } from '../hooks';
import { feedingPointCreatorTypes, feedingPointStatuses, type FeedingPointFilters, type FeedingPointListRow } from '../types';
import { hasFeedingPointFilters } from '../utils';


function fromParams(params: URLSearchParams): FeedingPointFilters {
  return {
    search: params.get('q') ?? '',
    status: readEnumParam(params.get('status'), feedingPointStatuses),
    creatorType: readEnumParam(params.get('creatorType'), feedingPointCreatorTypes),
    governorate: params.get('governorate') ?? undefined,
    pendingRefills: params.has('pendingRefills')
      ? params.get('pendingRefills') === 'true'
      : undefined,
    organizationId: params.get('organizationId') ?? undefined,
    hasOpenIssues: params.has('hasOpenIssues')
      ? params.get('hasOpenIssues') === 'true'
      : undefined,
    updatedFrom: params.get('updatedFrom') ?? undefined,
    updatedTo: params.get('updatedTo') ?? undefined,
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(params.get('pageSize')))
      ? Number(params.get('pageSize'))
      : 10,
    sortBy: (params.get('sortBy') as FeedingPointFilters['sortBy']) ?? 'updatedAt',
    sortDirection: params.get('sortDirection') === 'asc' ? 'asc' : 'desc',
  };
}

function toParams(filters: FeedingPointFilters) {
  const params = new URLSearchParams();

  const entries: Array<[string, string | number | boolean | undefined]> = [
    ['q', filters.search || undefined],
    ['status', filters.status],
    ['creatorType', filters.creatorType],
    ['governorate', filters.governorate],
    ['pendingRefills', filters.pendingRefills],
    ['organizationId', filters.organizationId],
    ['hasOpenIssues', filters.hasOpenIssues],
    ['updatedFrom', filters.updatedFrom],
    ['updatedTo', filters.updatedTo],
    ['page', filters.page > 1 ? filters.page : undefined],
    ['pageSize', filters.pageSize !== 10 ? filters.pageSize : undefined],
    ['sortBy', filters.sortBy && filters.sortBy !== 'updatedAt' ? filters.sortBy : undefined],
    ['sortDirection', filters.sortDirection === 'asc' ? 'asc' : undefined],
  ];

  // Keep only active or non-default values in the URL.
  for (const [key, value] of entries) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  return params;
}

export function FeedingPointsPage() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => fromParams(params), [params]);
  const [view, setView] = useState<'LIST' | 'MAP'>('LIST');

  const query = useFeedingPoints(filters);
  const summary = useFeedingPointSummary();

  // Sync all list filters with the current search parameters.
  const update = useCallback(
    (patch: Partial<FeedingPointFilters>) =>
      commitSearchParams(
        params,
        toParams({
          ...filters,
          ...patch,
        }),
        setParams,
      ),
    [filters, params, setParams],
  );

  const clear = () => {
    setParams(new URLSearchParams());
  };

  const active = hasFeedingPointFilters(filters);

  const onState = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      update({
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
        sortBy: (sort?.id as FeedingPointFilters['sortBy']) ?? filters.sortBy,
        sortDirection: sort?.desc ? 'desc' : 'asc',
      });
    },
    [filters.sortBy, update],
  );

  const emptyTitle =
    filters.status === 'PENDING'
      ? 'لا توجد طلبات نقاط جديدة بانتظار المراجعة.'
      : filters.pendingRefills
        ? 'لا توجد تعبئات بانتظار التحقق.'
        : active
          ? 'لا توجد نقاط تطابق عوامل التصفية الحالية.'
          : 'لا توجد نقاط إطعام مسجلة حتى الآن.';

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="نقاط الإطعام"
        description="مراجعة طلبات إضافة النقاط والتحقق من عمليات إعادة التعبئة وإدارة النقاط المنشورة."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'نقاط الإطعام' },
        ]}
        actions={
          <ExportMenuButton
            title="نقاط الإطعام"
            fileName="resq-feeding-points"
            rows={query.data?.items ?? []}
            disabled={query.isLoading}
            subtitle="تصدير النتائج الظاهرة حاليًا وفق الفلاتر المطبقة."
            columns={[
              {
                label: 'النقطة',
                value: (item: FeedingPointListRow) => item.name ?? item.id,
              },
              {
                label: 'الحالة',
                value: (item: FeedingPointListRow) =>
                  feedingPointStatusLabels[item.status],
              },
              {
                label: 'المحافظة',
                value: (item: FeedingPointListRow) =>
                  item.location.governorate,
              },
              {
                label: 'المدينة',
                value: (item: FeedingPointListRow) =>
                  item.location.city ?? '',
              },
              {
                label: 'أضيفت بواسطة',
                value: (item: FeedingPointListRow) =>
                  `${item.createdBy.name} — ${creatorTypeLabels[item.createdBy.type]}`,
              },
              {
                label: 'تعبئات بانتظار التحقق',
                value: (item: FeedingPointListRow) => item.pendingRefillsCount,
              },
              {
                label: 'آخر تحديث',
                value: (item: FeedingPointListRow) =>
                  new Date(item.updatedAt).toLocaleString('ar-SY-u-nu-latn'),
              },
            ]}
          />
        }
      />

      <FeedingPointSummaryCards
        summary={summary.data}
        loading={summary.isLoading}
        onFilter={update}
      />

      {/* Keep the list/map switch in its own bounded surface so it never competes with header actions. */}
      <div className="flex w-full min-w-0 items-center rounded-2xl border border-border/45 bg-white p-1.5 shadow-sm">
        <div className="grid w-full min-w-0 grid-cols-2 gap-1" role="tablist" aria-label="طريقة عرض نقاط الإطعام">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'LIST'}
            onClick={() => setView('LIST')}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
              view === 'LIST'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-primary/[0.05] hover:text-foreground'
            }`}
          >
            <List className="size-4 shrink-0" strokeWidth={1.8} />
            <span className="truncate">القائمة</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={view === 'MAP'}
            onClick={() => setView('MAP')}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
              view === 'MAP'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-primary/[0.05] hover:text-foreground'
            }`}
          >
            <Map className="size-4 shrink-0" strokeWidth={1.8} />
            <span className="truncate">الخريطة</span>
          </button>
        </div>
      </div>

      <FeedingPointFilterBar
        filters={filters}
        onChange={update}
        onClear={clear}
        active={active}
      />

      {query.isError ? (
        <ErrorState
          description={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : view === 'MAP' ? (
        <FeedingPointsMapView items={query.data?.items ?? []} />
      ) : (
        <FeedingPointsTable
          items={query.data?.items ?? []}
          total={query.data?.total ?? 0}
          pageCount={query.data?.pageCount ?? 1}
          filters={filters}
          loading={query.isLoading || (query.isFetching && !query.data)}
          onRetry={() => void query.refetch()}
          onQueryChange={onState}
          emptyState={
            <EmptyState
              title={emptyTitle}
              description={
                active
                  ? 'عدّل عوامل التصفية أو امسحها.'
                  : 'ستظهر هنا طلبات إضافة نقاط الإطعام عند تقديمها.'
              }
              action={
                active ? (
                  <Button
                    variant="secondary"
                    onClick={clear}
                  >
                    مسح الفلاتر
                  </Button>
                ) : undefined
              }
            />
          }
        />
      )}
    </div>
  );
}