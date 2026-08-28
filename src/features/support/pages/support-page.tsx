import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, ErrorState, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams } from '@/lib/search-params';
import { SupportFilterBar } from '../components/support-filter-bar';
import { SupportSummaryCards } from '../components/support-summary';
import { SupportTable } from '../components/support-table';
import { useSupportSummary, useSupportTickets } from '../hooks';
import { supportRequesterTypes, supportTicketCategories, supportTicketPriorities, supportTicketStatuses, type SupportFilters } from '../types';

const valid = <T extends string>(v: string | null, opts: readonly T[]): T | undefined =>
  v && opts.includes(v as T) ? (v as T) : undefined;

function read(p: URLSearchParams): SupportFilters {
  return {
    search: p.get('q') ?? '',
    status: valid(p.get('status'), supportTicketStatuses),
    priority: valid(p.get('priority'), supportTicketPriorities),
    category: valid(p.get('category'), supportTicketCategories),
    requesterType: valid(p.get('requesterType'), supportRequesterTypes),
    assignee: p.get('assignee') ?? undefined,
    unassigned: p.get('unassigned') === 'true' ? true : undefined,
    userId: p.get('userId') ?? undefined,
    organizationId: p.get('organizationId') ?? undefined,
    dateFrom: p.get('dateFrom') ?? undefined,
    dateTo: p.get('dateTo') ?? undefined,
    waiting: (['USER', 'INTERNAL'] as const).find((v) => v === p.get('waiting')),
    page: Number(p.get('page') ?? 1) || 1,
    pageSize: Number(p.get('pageSize') ?? 10) || 10,
    sortBy: (['createdAt', 'updatedAt', 'priority', 'status'] as const).find((v) => v === p.get('sortBy')) ?? 'updatedAt',
    sortDirection: p.get('sortDirection') === 'asc' ? 'asc' : 'desc',
  };
}

function params(f: SupportFilters) {
  const p = new URLSearchParams();

  if (f.search) {
    p.set('q', f.search);
  }

  for (const k of ['status', 'priority', 'category', 'requesterType', 'assignee', 'userId', 'organizationId', 'dateFrom', 'dateTo', 'waiting'] as const) {
    if (f[k]) {
      p.set(k, String(f[k]));
    }
  }

  if (f.unassigned) {
    p.set('unassigned', 'true');
  }

  if (f.page > 1) {
    p.set('page', String(f.page));
  }

  if (f.pageSize !== 10) {
    p.set('pageSize', String(f.pageSize));
  }

  if (f.sortBy && f.sortBy !== 'updatedAt') {
    p.set('sortBy', f.sortBy);
  }

  if (f.sortDirection === 'asc') {
    p.set('sortDirection', 'asc');
  }

  return p;
}

export function SupportPage() {
  const [p, setP] = useSearchParams();
  const filters = useMemo(() => read(p), [p]);
  const q = useSupportTickets(filters);
  const summary = useSupportSummary();

  const active = Boolean(
    filters.search ||
      filters.status ||
      filters.priority ||
      filters.category ||
      filters.requesterType ||
      filters.assignee ||
      filters.unassigned ||
      filters.userId ||
      filters.organizationId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.waiting,
  );

  // Keep support filters synchronized with the URL.
  const update = useCallback(
    (patch: Partial<SupportFilters>) =>
      commitSearchParams(p, params({ ...filters, ...patch }), setP),
    [filters, p, setP],
  );

  const clear = () => setP(new URLSearchParams());

  const onState = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      update({
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
        sortBy: (sort?.id as SupportFilters['sortBy']) ?? filters.sortBy,
        sortDirection: sort?.desc ? 'desc' : 'asc',
      });
    },
    [filters.sortBy, update],
  );

  const summaryFilter = (key: string) => {
    if (key === 'URGENT') {
      update({
        priority: 'URGENT',
        status: undefined,
        page: 1,
      });
    } else if (key === 'UNASSIGNED') {
      update({
        unassigned: true,
        assignee: undefined,
        status: undefined,
        page: 1,
      });
    } else {
      update({
        status: key as SupportFilters['status'],
        priority: undefined,
        unassigned: undefined,
        page: 1,
      });
    }
  };

  let empty = 'لا توجد تذاكر دعم حتى الآن.';

  if (filters.unassigned) {
    empty = 'لا توجد تذاكر غير مسندة حاليًا.';
  } else if (filters.priority === 'URGENT') {
    empty = 'لا توجد تذاكر عاجلة حاليًا.';
  } else if (active) {
    empty = 'لا توجد تذاكر تطابق عوامل التصفية الحالية.';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مركز الدعم"
        description="متابعة طلبات الدعم والشكاوى وتوزيعها ومعالجتها حتى الإغلاق."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الدعم' },
        ]}
      />

      <SupportSummaryCards
        summary={summary.data}
        loading={summary.isLoading}
        onFilter={summaryFilter}
      />

      <SupportFilterBar
        filters={filters}
        onChange={update}
        onClear={clear}
        active={active}
      />

      {q.isError ? (
        <ErrorState
          title="تعذر تحميل تذاكر الدعم"
          description={q.error.message}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <SupportTable
          items={q.data?.items ?? []}
          total={q.data?.total ?? 0}
          pageCount={q.data?.pageCount ?? 1}
          filters={filters}
          loading={q.isLoading || Boolean(q.isFetching && !q.data)}
          onQueryChange={onState}
          emptyState={
            <EmptyState
              title={empty}
              action={
                active ? (
                  <Button variant="secondary" onClick={clear}>
                    مسح عوامل التصفية
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