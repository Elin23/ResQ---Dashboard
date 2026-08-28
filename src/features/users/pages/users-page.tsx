import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, ErrorState, ExportMenuButton, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams, readEnumParam } from '@/lib/search-params';
import { UserFilterBar } from '../components/user-filter-bar';
import { UserSummaryCards } from '../components/user-summary';
import { UsersTable } from '../components/users-table';
import { accountStatusLabels, verificationLabels } from '../constants';
import { useUsers, useUserSummary } from '../hooks';
import { userAccountStatuses, userVerificationStatuses, type User, type UserFilters } from '../types';
import { hasUserFilters } from '../utils';


function fromParams(params: URLSearchParams): UserFilters {
  return {
    search: params.get('q') ?? '',
    accountStatus: readEnumParam(params.get('status'), userAccountStatuses),
    verificationStatus: readEnumParam(params.get('verification'), userVerificationStatuses),
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 10,
    sortBy: readEnumParam(params.get('sort'), ['createdAt', 'lastActiveAt', 'fullName', 'accountStatus'] as const),
    sortDirection: params.get('direction') === 'asc' ? 'asc' : 'desc',
  };
}

function toParams(filters: UserFilters) {
  const params = new URLSearchParams();

  const entries: Array<[string, string | number | undefined]> = [
    ['q', filters.search || undefined],
    ['status', filters.accountStatus],
    ['verification', filters.verificationStatus],
    ['page', filters.page > 1 ? filters.page : undefined],
    ['pageSize', filters.pageSize !== 10 ? filters.pageSize : undefined],
    ['sort', filters.sortBy],
    ['direction', filters.sortBy ? filters.sortDirection : undefined],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  return params;
}

export function UsersPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => fromParams(params), [params]);
  const query = useUsers(filters);
  const summary = useUserSummary();

  // Keep the users view shareable by reflecting filters in the URL.
  const update = useCallback(
    (patch: Partial<UserFilters>) =>
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

  const clear = () => setParams(new URLSearchParams());
  const active = hasUserFilters(filters);

  const onState = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      const next =
        sort && ['createdAt', 'lastActiveAt', 'fullName', 'accountStatus'].includes(sort.id)
          ? (sort.id as UserFilters['sortBy'])
          : undefined;

      if (
        state.pageIndex + 1 !== filters.page ||
        state.pageSize !== filters.pageSize ||
        next !== filters.sortBy ||
        (next && (sort?.desc ? 'desc' : 'asc')) !== filters.sortDirection
      ) {
        update({
          page: state.pageIndex + 1,
          pageSize: state.pageSize,
          sortBy: next,
          sortDirection: next ? (sort?.desc ? 'desc' : 'asc') : undefined,
        });
      }
    },
    [filters.page, filters.pageSize, filters.sortBy, filters.sortDirection, update],
  );

  if (query.isError && !query.data) {
    return (
      <ErrorState
        title="تعذر تحميل المستخدمين"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const emptyTitle =
    filters.accountStatus === 'SUSPENDED'
      ? 'لا توجد حسابات معلقة حاليًا.'
      : active
        ? 'لا يوجد مستخدمون يطابقون عوامل التصفية الحالية.'
        : 'لا يوجد مستخدمون مسجلون حتى الآن.';

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="إدارة المستخدمين"
        description="متابعة الحسابات وحالة التوثيق والنشاط المرتبط بالمنصة."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'المستخدمون' },
        ]}
        actions={
          <ExportMenuButton
            title="المستخدمون"
            fileName="resq-users"
            rows={query.data?.items ?? []}
            disabled={query.isLoading}
            subtitle="تصدير بيانات إدارية أساسية للنتائج الظاهرة حاليًا."
            columns={[
              {
                label: 'الاسم',
                value: (item: User) => item.fullName,
              },
              {
                label: 'المحافظة',
                value: (item: User) => item.governorate ?? '',
              },
              {
                label: 'المدينة',
                value: (item: User) => item.city ?? '',
              },
              {
                label: 'حالة الحساب',
                value: (item: User) => accountStatusLabels[item.accountStatus],
              },
              {
                label: 'التوثيق',
                value: (item: User) => verificationLabels[item.verificationStatus],
              },
              {
                label: 'تاريخ التسجيل',
                value: (item: User) =>
                  new Date(item.createdAt).toLocaleDateString('ar-SY-u-nu-latn'),
              },
            ]}
          />
        }
      />

      <UserSummaryCards
        summary={summary.data}
        loading={summary.isLoading}
        onFilter={update}
      />

      <UserFilterBar
        filters={filters}
        onChange={update}
        onClear={clear}
        active={active}
      />

      <UsersTable
        items={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        pageCount={query.data?.pageCount ?? 1}
        filters={filters}
        loading={query.isLoading || (query.isFetching && !query.data)}
        error={query.isError ? query.error.message : undefined}
        onRetry={() => void query.refetch()}
        onQueryChange={onState}
        emptyState={
          <EmptyState
            title={emptyTitle}
            description={active ? 'عدّل عوامل التصفية أو امسحها.' : 'ستظهر الحسابات المسجلة هنا.'}
            action={
              active ? (
                <Button variant="secondary" onClick={clear}>
                  مسح الفلاتر
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  );
}