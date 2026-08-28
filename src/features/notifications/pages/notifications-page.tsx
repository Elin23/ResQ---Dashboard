import { useCallback, useMemo } from 'react';
import { FilePlus2, Layers3 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { Button, Card, EmptyState, ErrorState, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { PermissionGuard } from '@/features/auth/rbac';
import { commitSearchParams, readEnumParam } from '@/lib/search-params';
import { BroadcastsTable } from '../components/broadcasts-table';
import { NotificationFilterBar } from '../components/notification-filter-bar';
import { NotificationSummaryCards } from '../components/notification-summary';
import { useBroadcastNotifications, useNotificationSummary } from '../hooks';
import { notificationChannels, notificationDeliveryStatuses, type BroadcastFilters } from '../types';


function read(params: URLSearchParams): BroadcastFilters {
  return {
    search: params.get('q') ?? '',
    status: readEnumParam(params.get('status'), notificationDeliveryStatuses),
    channel: readEnumParam(params.get('channel'), notificationChannels),
    audienceType: (['EVERYONE', 'USER', 'ORGANIZATION'] as const).find(
      (value) => value === params.get('audienceType'),
    ),
    creator: params.get('creator') ?? undefined,
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
    page: Number(params.get('page') ?? 1) || 1,
    pageSize: Number(params.get('pageSize') ?? 10) || 10,
    sortBy:
      (['createdAt', 'updatedAt', 'scheduledAt', 'sentAt'] as const).find(
        (value) => value === params.get('sortBy'),
      ) ?? 'updatedAt',
    sortDirection: params.get('sortDirection') === 'asc' ? 'asc' : 'desc',
  };
}

function params(filters: BroadcastFilters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('q', filters.search);
  }

  // Keep only active filters and non-default table state in the URL.
  for (const key of ['status', 'channel', 'audienceType', 'creator', 'dateFrom', 'dateTo'] as const) {
    if (filters[key]) {
      params.set(key, String(filters[key]));
    }
  }

  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }

  if (filters.pageSize !== 10) {
    params.set('pageSize', String(filters.pageSize));
  }

  if (filters.sortBy && filters.sortBy !== 'updatedAt') {
    params.set('sortBy', filters.sortBy);
  }

  if (filters.sortDirection === 'asc') {
    params.set('sortDirection', 'asc');
  }

  return params;
}

export function NotificationsPage() {
  const [p, setP] = useSearchParams();

  const filters = useMemo(() => read(p), [p]);
  const query = useBroadcastNotifications(filters);
  const summary = useNotificationSummary();

  const active = Boolean(
    filters.search ||
      filters.status ||
      filters.channel ||
      filters.audienceType ||
      filters.creator ||
      filters.dateFrom ||
      filters.dateTo,
  );

  const update = useCallback(
    (patch: Partial<BroadcastFilters>) =>
      commitSearchParams(
        p,
        params({
          ...filters,
          ...patch,
        }),
        setP,
      ),
    [filters, p, setP],
  );

  const clear = () => {
    setP(new URLSearchParams());
  };

  const onState = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      update({
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
        sortBy: (sort?.id as BroadcastFilters['sortBy']) ?? filters.sortBy,
        sortDirection: sort?.desc ? 'desc' : 'asc',
      });
    },
    [filters.sortBy, update],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الإشعارات"
        description="إدارة رسائل البث اليدوية ومراقبة التسليم والقوالب التلقائية بشكل منفصل."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الإشعارات' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <PermissionGuard permission="notifications.templates.read">
              <Link to="/notifications/templates">
                <Button variant="secondary">
                  <Layers3 className="size-4" />
                  القوالب التلقائية
                </Button>
              </Link>
            </PermissionGuard>

            <PermissionGuard permission="notifications.create">
              <Link to="/notifications/new">
                <Button>
                  <FilePlus2 className="size-4" />
                  إنشاء إشعار
                </Button>
              </Link>
            </PermissionGuard>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <p className="font-bold">
            رسائل البث الإدارية
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            رسائل يكتبها المشرف ويحدد جمهورها وموعدها. تتطلب صلاحيات إنشاء/إرسال/جدولة منفصلة.
          </p>
        </Card>

        <Card>
          <p className="font-bold">
            الإشعارات التلقائية
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            قوالب لأحداث المنتج مثل تحديث البلاغ أو قبول التبني. تشغيلها الفعلي مسؤولية الخادم وليس لوحة الإدارة.
          </p>
        </Card>
      </div>

      <NotificationSummaryCards
        summary={summary.data}
        loading={summary.isLoading}
        onFilter={(status) =>
          update({
            status: status as BroadcastFilters['status'],
            page: 1,
          })
        }
      />

      <NotificationFilterBar
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
      ) : (
        <BroadcastsTable
          items={query.data?.items ?? []}
          total={query.data?.total ?? 0}
          pageCount={query.data?.pageCount ?? 1}
          filters={filters}
          loading={query.isLoading || Boolean(query.isFetching && !query.data)}
          onQueryChange={onState}
          emptyState={
            <EmptyState
              title={
                filters.status === 'SCHEDULED'
                  ? 'لا توجد إشعارات مجدولة.'
                  : filters.status === 'DRAFT'
                    ? 'لا توجد مسودات.'
                    : active
                      ? 'لا توجد إشعارات تطابق عوامل التصفية الحالية.'
                      : 'لا توجد إشعارات مرسلة حتى الآن.'
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