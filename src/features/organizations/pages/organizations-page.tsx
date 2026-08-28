import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, ErrorState, ExportMenuButton, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams, readEnumParam } from '@/lib/search-params';
import { OrganizationFilterBar } from '../components/organization-filter-bar';
import { OrganizationSummaryCards } from '../components/organization-summary';
import { OrganizationsTable } from '../components/organizations-table';
import { verificationLabels } from '../constants';
import { useOrganizations, useOrganizationSummary } from '../hooks';
import { organizationServiceKeys, organizationStatuses, organizationVerificationStatuses, type Organization, type OrganizationFilters } from '../types';
import { hasOrganizationFilters } from '../utils';


function fromParams(p: URLSearchParams): OrganizationFilters {
  return {
    search: p.get('q') ?? '',
    status: readEnumParam(p.get('status'), organizationStatuses),
    verificationStatus: readEnumParam(p.get('verification'), organizationVerificationStatuses),
    governorate: p.get('governorate') ?? undefined,
    service: readEnumParam(p.get('service'), organizationServiceKeys),
    activeReports:
      p.get('activeReports') === 'YES'
        ? 'YES'
        : p.get('activeReports') === 'NO'
          ? 'NO'
          : undefined,
    dateFrom: p.get('from') ?? undefined,
    dateTo: p.get('to') ?? undefined,
    page: Math.max(1, Number(p.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(p.get('pageSize')))
      ? Number(p.get('pageSize'))
      : 10,
    sortBy: readEnumParam(p.get('sort'), ['createdAt', 'updatedAt', 'name', 'status'] as const),
    sortDirection: p.get('direction') === 'asc' ? 'asc' : 'desc',
  };
}

function toParams(f: OrganizationFilters) {
  const p = new URLSearchParams();

  const entries: Array<[string, string | number | undefined]> = [
    ['q', f.search || undefined],
    ['status', f.status],
    ['verification', f.verificationStatus],
    ['governorate', f.governorate],
    ['service', f.service],
    ['activeReports', f.activeReports],
    ['from', f.dateFrom],
    ['to', f.dateTo],
    ['page', f.page > 1 ? f.page : undefined],
    ['pageSize', f.pageSize !== 10 ? f.pageSize : undefined],
    ['sort', f.sortBy],
    ['direction', f.sortBy ? f.sortDirection : undefined],
  ];

  // Keep only meaningful filter values in the URL.
  for (const [k, v] of entries) {
    if (v !== undefined) {
      p.set(k, String(v));
    }
  }

  return p;
}

export function OrganizationsPage() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => fromParams(params),
    [params],
  );

  const query = useOrganizations(filters);
  const summary = useOrganizationSummary();

  const update = useCallback(
    (patch: Partial<OrganizationFilters>) =>
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

  const active = hasOrganizationFilters(filters);

  const onState = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      const next =
        sort &&
        ['createdAt', 'updatedAt', 'name', 'status'].includes(sort.id)
          ? (sort.id as OrganizationFilters['sortBy'])
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
          sortDirection: next
            ? sort?.desc
              ? 'desc'
              : 'asc'
            : undefined,
        });
      }
    },
    [filters, update],
  );

  if (query.isError && !query.data) {
    return (
      <ErrorState
        title="تعذر تحميل الجمعيات"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const emptyTitle =
    filters.status === 'PENDING_VERIFICATION'
      ? 'لا توجد جمعيات بانتظار المراجعة حاليًا.'
      : active
        ? 'لا توجد جمعيات تطابق عوامل التصفية الحالية.'
        : 'لا توجد جمعيات مسجلة حتى الآن.';

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الجمعيات"
        description="مراجعة الجمعيات واعتمادها ومتابعة نشاطها وعمليات الإنقاذ والتبني."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الجمعيات' },
        ]}
        actions={
          <ExportMenuButton
            title="الجمعيات"
            fileName="resq-organizations"
            rows={query.data?.items ?? []}
            disabled={query.isLoading}
            subtitle="تصدير النتائج الظاهرة حاليًا وفق الفلاتر المطبقة."
            columns={[
              {
                label: 'الجمعية',
                value: (item: Organization) => item.name,
              },
              {
                label: 'المحافظة',
                value: (item: Organization) => item.governorate,
              },
              {
                label: 'المدينة',
                value: (item: Organization) => item.city ?? '',
              },
              {
                label: 'حالة الحساب',
                value: (item: Organization) =>
                  item.status === 'ACTIVE'
                    ? 'نشطة'
                    : item.status === 'SUSPENDED'
                      ? 'معلقة'
                      : item.status === 'REJECTED'
                        ? 'مرفوضة'
                        : 'بانتظار التحقق',
              },
              {
                label: 'حالة التحقق',
                value: (item: Organization) =>
                  verificationLabels[item.verificationStatus],
              },
              {
                label: 'الهاتف',
                value: (item: Organization) => item.phone,
              },
              {
                label: 'تاريخ التسجيل',
                value: (item: Organization) =>
                  new Date(item.createdAt).toLocaleDateString('ar-SY-u-nu-latn'),
              },
            ]}
          />
        }
      />

      <OrganizationSummaryCards
        summary={summary.data}
        loading={summary.isLoading}
        onFilter={update}
      />

      <OrganizationFilterBar
        filters={filters}
        onChange={update}
        onClear={clear}
        active={active}
      />

      <OrganizationsTable
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
            description={
              active
                ? 'عدّل عوامل التصفية أو امسحها.'
                : 'ستظهر الجمعيات هنا عند بدء الانضمام.'
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
    </div>
  );
}