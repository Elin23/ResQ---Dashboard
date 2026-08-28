import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ErrorState, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { PermissionGuard, usePermission } from '@/features/auth/rbac';
import { commitSearchParams } from '@/lib/search-params';
import { AuditDetailModal, AuditExportButton, AuditFilterBar, AuditSummaryStrip, AuditTable } from '../components/audit-components';
import { useAuditEvents, useAuditFilterOptions, useAuditSummary } from '../hooks';
import { getAuditExportEvents } from '../services/audit-log.mock';
import { auditActions, auditActorTypes, auditResourceTypes, type AuditEvent, type AuditFilters } from '../types';
import { auditCsv, downloadTextFile } from '../utils';

const valid = <T extends string>(value: string | null, values: readonly T[]): T | undefined =>
  value && values.includes(value as T) ? (value as T) : undefined;

function read(params: URLSearchParams): AuditFilters {
  return {
    search: params.get('q') ?? '',
    actorId: params.get('actorId') ?? undefined,
    actorRole: params.get('actorRole') ?? undefined,
    actorType: valid(params.get('actorType'), auditActorTypes),
    action: valid(params.get('action'), auditActions),
    resourceType: valid(params.get('resourceType'), auditResourceTypes),
    resourceId: params.get('resourceId') ?? undefined,
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
    sensitive: params.get('sensitive') === 'true' ? true : undefined,
    page: Number(params.get('page') ?? 1) || 1,
    pageSize: Number(params.get('pageSize') ?? 20) || 20,
    sortDirection: params.get('sortDirection') === 'asc' ? 'asc' : 'desc',
  };
}

function toParams(filters: AuditFilters) {
  const params = new URLSearchParams();

  // Keep the current audit filters synced with the URL.
  if (filters.search) {
    params.set('q', filters.search);
  }

  for (const key of ['actorId', 'actorRole', 'actorType', 'action', 'resourceType', 'resourceId', 'from', 'to'] as const) {
    if (filters[key]) {
      params.set(key, String(filters[key]));
    }
  }

  if (filters.sensitive) {
    params.set('sensitive', 'true');
  }

  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }

  if (filters.pageSize !== 20) {
    params.set('pageSize', String(filters.pageSize));
  }

  if (filters.sortDirection === 'asc') {
    params.set('sortDirection', 'asc');
  }

  return params;
}

export function AuditLogPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => read(params), [params]);

  const query = useAuditEvents(filters);
  const summary = useAuditSummary({ from: filters.from, to: filters.to });
  const options = useAuditFilterOptions();

  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const canTechnical = usePermission('audit.technical.read');

  const update = useCallback(
    (patch: Partial<AuditFilters>) =>
      commitSearchParams(
        params,
        toParams({ ...filters, ...patch }),
        setParams,
      ),
    [filters, params, setParams],
  );

  const onStateChange = useCallback(
    (state: DataTableQueryState) => {
      const sort = state.sorting[0];

      update({
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
        sortDirection: sort?.desc === false ? 'asc' : 'desc',
      });
    },
    [update],
  );

  const exportRows = async () => {
    const rows = await getAuditExportEvents(filters);

    // Technical fields are included only when the current admin can view them.
    downloadTextFile(
      `resq-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      auditCsv(rows, canTechnical),
      'text/csv;charset=utf-8',
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل النشاط الإداري"
        description="تتبع الإجراءات الإدارية والتغييرات المهمة التي حدثت داخل منصة ResQ."
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'سجل النشاط' },
        ]}
        actions={
          <PermissionGuard permission="audit.export">
            <AuditExportButton
              onExport={() => void exportRows()}
              disabled={query.isLoading}
            />
          </PermissionGuard>
        }
      />

      <AuditSummaryStrip
        summary={summary.data}
        loading={summary.isLoading}
        onSensitive={() => update({ sensitive: true, page: 1 })}
      />

      <AuditFilterBar
        filters={filters}
        options={options.data}
        onChange={update}
        onClear={() => setParams(new URLSearchParams())}
      />

      {query.isError ? (
        <ErrorState
          title="تعذر تحميل سجل النشاط"
          description="تعذر جلب أحداث التدقيق. لم يتم عرض تفاصيل الخطأ الخلفي حفاظًا على أمان السجل."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <AuditTable
          items={query.data?.items ?? []}
          total={query.data?.total ?? 0}
          pageCount={query.data?.pageCount ?? 1}
          filters={filters}
          loading={query.isLoading || Boolean(query.isFetching && !query.data)}
          onStateChange={onStateChange}
          onOpen={setSelected}
        />
      )}

      <AuditDetailModal
        event={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}