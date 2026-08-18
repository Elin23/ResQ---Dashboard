import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Clipboard, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Avatar,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { animalTypeLabels } from '../constants';
import type { Report, ReportFilters } from '../types';
import { formatRelativeTime } from '../utils';
import { ReportStatusBadge } from './report-badges';
import { ReportWorkflowDialog, type ReportWorkflow } from './report-workflow-dialogs';

export interface ReportActionPermissions {
  update: boolean;
  assign: boolean;
  delete: boolean;
}

function RowActions({
  report,
  permissions,
}: {
  report: Report;
  permissions: ReportActionPermissions;
}) {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<ReportWorkflow | null>(null);

  const copyId = async () => {
    await navigator.clipboard.writeText(report.id);
    toast.success('تم نسخ رقم البلاغ');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label={`إجراءات ${report.id}`} className="size-8 rounded-lg">
            <MoreHorizontal className="size-4" />
          </IconButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => navigate(`/reports/${report.id}`)}>
            عرض التفاصيل
          </DropdownMenuItem>

          {permissions.assign && report.status !== 'CLOSED' && (
            <DropdownMenuItem onSelect={() => setWorkflow('assign')}>
              {report.assignedOrganization ? 'تغيير الجمعية' : 'تعيين جمعية'}
            </DropdownMenuItem>
          )}

          {permissions.update && (
            <DropdownMenuItem onSelect={() => setWorkflow('status-override')}>
              تجاوز إداري للحالة
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onSelect={() => void copyId()}>
            <Clipboard className="size-4" />
            نسخ رقم البلاغ
          </DropdownMenuItem>

          {permissions.delete && (
            <DropdownMenuItem className="text-critical" onSelect={() => setWorkflow('delete')}>
              <Trash2 className="size-4" />
              حذف البلاغ
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {workflow && (
        <ReportWorkflowDialog
          report={report}
          workflow={workflow}
          open
          onOpenChange={(open) => {
            if (!open) setWorkflow(null);
          }}
        />
      )}
    </>
  );
}

export function ReportsTable({
  reports,
  total,
  pageCount,
  filters,
  loading,
  error,
  onRetry,
  onQueryChange,
  onSelectionChange,
  selectionActions,
  permissions,
  emptyState,
}: {
  reports: Report[];
  total: number;
  pageCount: number;
  filters: ReportFilters;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onQueryChange: (state: DataTableQueryState) => void;
  onSelectionChange: (reports: Report[]) => void;
  selectionActions: (reports: Report[]) => ReactNode;
  permissions: ReportActionPermissions;
  emptyState: ReactNode;
}) {
  const navigate = useNavigate();

  const columns = useMemo<Array<ColumnDef<Report, unknown>>>(
    () => [
      {
        id: 'report',
        header: 'البلاغ',
        enableSorting: false,
        cell: ({ row }) => {
          const report = row.original;
          const image = report.media[0];
          return (
            <div className="flex min-w-[230px] items-center gap-2.5">
              {image?.type === 'IMAGE' ? (
                <img
                  src={image.thumbnailUrl ?? image.url}
                  alt=""
                  className="size-9 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <Avatar name={animalTypeLabels[report.animalType]} size="sm" />
              )}

              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-[12px] font-medium text-foreground">{report.title}</p>
                  <span dir="ltr" className="shrink-0 text-[10px] text-muted-foreground/60">
                    {report.id}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                  {animalTypeLabels[report.animalType]}
                  {report.animalDescription ? ` · ${report.animalDescription}` : ''}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) =>
          row.original.status ? (
            <ReportStatusBadge status={row.original.status} />
          ) : (
            <Badge tone="neutral">بانتظار جمعية</Badge>
          ),
      },
      {
        id: 'organization',
        header: 'الجمعية',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.assignedOrganization ? (
            <span className="block max-w-[180px] truncate text-[12px] text-foreground">
              {row.original.assignedOrganization.name}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground">بدون جمعية</span>
          ),
      },
      {
        id: 'location',
        header: 'الموقع',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block max-w-[170px] truncate text-[12px] text-muted-foreground">
            {row.original.governorate}
            {row.original.city ? ` — ${row.original.city}` : ''}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'آخر تحديث',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[11px] text-muted-foreground/75">
            {formatRelativeTime(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const sorting: SortingState = filters.sortBy
    ? [{ id: filters.sortBy, desc: filters.sortDirection !== 'asc' }]
    : [];

  const getReportRowId = useCallback((report: Report) => report.id, []);

  return (
    <DataTable
      data={reports}
      columns={columns}
      getRowId={getReportRowId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      enableSearch={false}
      enableRowSelection
      manualPagination
      manualFiltering
      manualSorting
      pageCount={pageCount}
      totalCount={total}
      state={{
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize,
        search: '',
        sorting,
      }}
      onStateChange={onQueryChange}
      onRowClick={(report) => navigate(`/reports/${report.id}`)}
      rowAriaLabel={(report) => `فتح تفاصيل البلاغ ${report.id}`}
      onSelectionChange={onSelectionChange}
      selectionActions={selectionActions}
      rowActions={(report) => <RowActions report={report} permissions={permissions} />}
      emptyState={emptyState}
    />
  );
}
