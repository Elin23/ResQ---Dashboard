import { Download } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button, EmptyState, ErrorState, ExportMenuButton } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { usePermission } from '@/features/auth/rbac';
import { commitSearchParams, readEnumParam } from '@/lib/search-params';
import { ReportsFilterBar } from '../components/reports-filter-bar';
import { ReportsSummaryCards } from '../components/reports-summary';
import { ReportsTable } from '../components/reports-table';
import { animalTypeLabels, reportStatusLabels } from '../constants';
import { useReports, useReportsSummary } from '../hooks';
import { animalTypes, reportStatuses, type Report, type ReportFilters } from '../types';
import { hasActiveFilters } from '../utils';


function filtersFromParams(params: URLSearchParams): ReportFilters {
  return {
    search: params.get('q') ?? '',
    status: readEnumParam(params.get('status'), reportStatuses),
    animalType: readEnumParam(params.get('animal'), animalTypes),
    governorate: params.get('governorate') ?? undefined,
    organizationId: params.get('organization') ?? undefined,
    userId: params.get('userId') ?? undefined,
    dateFrom: params.get('from') ?? undefined,
    dateTo: params.get('to') ?? undefined,
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(params.get('pageSize')))
      ? Number(params.get('pageSize'))
      : 10,
    sortBy: readEnumParam(params.get('sort'), ['createdAt', 'updatedAt', 'status'] as const),
    sortDirection: params.get('direction') === 'asc' ? 'asc' : 'desc',
  };
}

function paramsFromFilters(filters: ReportFilters): URLSearchParams {
  const params = new URLSearchParams();

  const entries: Array<[string, string | number | undefined]> = [
    ['q', filters.search || undefined],
    ['status', filters.status],
    ['animal', filters.animalType],
    ['governorate', filters.governorate],
    ['organization', filters.organizationId],
    ['userId', filters.userId],
    ['from', filters.dateFrom],
    ['to', filters.dateTo],
    ['page', filters.page > 1 ? filters.page : undefined],
    ['pageSize', filters.pageSize !== 10 ? filters.pageSize : undefined],
    ['sort', filters.sortBy],
    ['direction', filters.sortBy && filters.sortDirection ? filters.sortDirection : undefined],
  ];

  // Keep only active filters and non-default table state in the URL.
  for (const [key, value] of entries) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  return params;
}

function downloadSelected(reports: Report[]) {
  const rows = [
    ['id', 'status', 'animal', 'governorate', 'city', 'organization'],
    ...reports.map((report) => [
      report.id,
      report.status,
      report.animalType,
      report.governorate,
      report.city ?? '',
      report.assignedOrganization?.name ?? '',
    ]),
  ];

  const csv = `\uFEFF${rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')}`;

  const url = URL.createObjectURL(
    new Blob([csv], {
      type: 'text/csv;charset=utf-8',
    }),
  );

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'resq-selected-reports.csv';
  anchor.click();

  URL.revokeObjectURL(url);

  toast.success('تم تصدير البلاغات المحددة');
}

export function ReportsPage() {
  const [params, setParams] = useSearchParams();

  const filters = filtersFromParams(params);
  const reportsQuery = useReports(filters);
  const summaryQuery = useReportsSummary();

  const [selected, setSelected] = useState<Report[]>([]);

  const canUpdate = usePermission('reports:update');
  const canAssign = usePermission('reports:assign');

  // Compatibility seam until the central RBAC model exposes reports:delete.
  const canDelete = usePermission('reports:reject');

  const updateFilters = useCallback(
    (patch: Partial<ReportFilters>) =>
      commitSearchParams(
        params,
        paramsFromFilters({
          ...filters,
          ...patch,
        }),
        setParams,
      ),
    [filters, params, setParams],
  );

  const clearFilters = () => {
    setParams(new URLSearchParams());
  };

  const onQueryChange = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      const nextSort =
        sort && ['createdAt', 'updatedAt', 'status'].includes(sort.id)
          ? (sort.id as ReportFilters['sortBy'])
          : undefined;

      if (
        state.pageIndex + 1 !== filters.page ||
        state.pageSize !== filters.pageSize ||
        nextSort !== filters.sortBy ||
        (nextSort && (sort?.desc ? 'desc' : 'asc')) !== filters.sortDirection
      ) {
        updateFilters({
          page: state.pageIndex + 1,
          pageSize: state.pageSize,
          sortBy: nextSort,
          sortDirection: nextSort
            ? sort?.desc
              ? 'desc'
              : 'asc'
            : undefined,
        });
      }
    },
    [
      filters.page,
      filters.pageSize,
      filters.sortBy,
      filters.sortDirection,
      updateFilters,
    ],
  );

  const onSelectionChange = useCallback(
    (rows: Report[]) => setSelected(rows),
    [],
  );

  if (reportsQuery.isError && !reportsQuery.data) {
    return (
      <ErrorState
        title="تعذر تحميل البلاغات"
        description={reportsQuery.error.message}
        onRetry={() => void reportsQuery.refetch()}
      />
    );
  }

  const data = reportsQuery.data;
  const exportRows = data?.items ?? [];
  const active = hasActiveFilters(filters);

  const empty = (
    <EmptyState
      title={
        active
          ? 'لا توجد بلاغات تطابق الفلاتر الحالية.'
          : 'لا توجد بلاغات مسجلة حتى الآن.'
      }
      description={
        active
          ? 'عدّل الفلاتر أو امسحها للوصول إلى نتائج أخرى.'
          : 'ستظهر البلاغات فور نشرها.'
      }
      action={
        active ? (
          <Button
            variant="secondary"
            className="h-9 rounded-xl"
            onClick={clearFilters}
          >
            مسح الفلاتر
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <span>الرئيسية</span>
            <span>/</span>
            <span>البلاغات</span>
          </div>

          <h1 className="text-[19px] font-semibold leading-6 tracking-tight text-foreground">
            إدارة البلاغات
          </h1>

          <p className="text-[12px] text-muted-foreground/75">
            البلاغات تظهر فور نشرها. دور الإدارة هو المتابعة، تغيير الجمعية عند الحاجة، والتدخل الاستثنائي فقط.
          </p>
        </div>

        <ExportMenuButton
          title="البلاغات"
          fileName="resq-reports"
          rows={exportRows}
          disabled={reportsQuery.isLoading}
          subtitle="تصدير النتائج الظاهرة حاليًا وفق الفلاتر المطبقة."
          columns={[
            {
              label: 'رقم البلاغ',
              value: (report: Report) => report.id,
            },
            {
              label: 'الحيوان',
              value: (report: Report) =>
                animalTypeLabels[report.animalType],
            },
            {
              label: 'الحالة',
              value: (report: Report) =>
                reportStatusLabels[report.status],
            },
            {
              label: 'المحافظة',
              value: (report: Report) => report.governorate,
            },
            {
              label: 'المدينة',
              value: (report: Report) => report.city ?? '',
            },
            {
              label: 'الجمعية',
              value: (report: Report) =>
                report.assignedOrganization?.name ?? 'غير مسند',
            },
            {
              label: 'تاريخ البلاغ',
              value: (report: Report) =>
                new Date(report.createdAt).toLocaleString('ar-SY-u-nu-latn'),
            },
          ]}
        />
      </div>

      <ReportsSummaryCards
        summary={summaryQuery.data}
        loading={summaryQuery.isLoading}
        onFilter={updateFilters}
      />

      <ReportsFilterBar
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        active={active}
      />

      <ReportsTable
        reports={data?.items ?? []}
        total={data?.total ?? 0}
        pageCount={data?.pageCount ?? 1}
        filters={filters}
        loading={reportsQuery.isLoading || (reportsQuery.isFetching && !data)}
        error={reportsQuery.isError ? reportsQuery.error.message : undefined}
        onRetry={() => void reportsQuery.refetch()}
        onQueryChange={onQueryChange}
        onSelectionChange={onSelectionChange}
        permissions={{
          update: canUpdate,
          assign: canAssign,
          delete: canDelete,
        }}
        emptyState={empty}
        selectionActions={(rows) => (
          <Button
            size="sm"
            variant="secondary"
            className="h-9 rounded-xl px-3 text-[12px] font-medium"
            onClick={() => downloadSelected(rows)}
          >
            <Download className="size-4" />
            تصدير المحدد
          </Button>
        )}
      />

      {selected.length > 0 && (
        <span className="sr-only">
          تم تحديد {selected.length} بلاغات
        </span>
      )}
    </div>
  );
}