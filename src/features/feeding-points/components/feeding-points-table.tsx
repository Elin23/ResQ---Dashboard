import { useMemo, type ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MapPin, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { FeedingPointStatusBadge } from './feeding-point-badges';
import { creatorTypeLabels } from '../constants';
import type { FeedingPointFilters, FeedingPointListRow } from '../types';
import { formatFeedingPointRelative } from '../utils';

export function FeedingPointsTable({ items, total, pageCount, filters, loading, error, onRetry, onQueryChange, emptyState }: { items: FeedingPointListRow[]; total: number; pageCount: number; filters: FeedingPointFilters; loading: boolean; error?: string; onRetry: () => void; onQueryChange: (state: DataTableQueryState) => void; emptyState: ReactNode }) {
  const navigate = useNavigate();

  // Keep the table columns stable between renders.
  const columns = useMemo<Array<ColumnDef<FeedingPointListRow, unknown>>>(
    () => [
      {
        accessorKey: 'id',
        header: 'النقطة',
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium text-foreground">
              {row.original.name ?? row.original.id}
            </p>
            <p dir="ltr" className="mt-0.5 text-[11px] text-muted-foreground">
              {row.original.id}
            </p>
          </div>
        ),
      },
      {
        id: 'creator',
        header: 'مقدم الطلب',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-32">
            <p className="text-[12px] font-medium">
              {row.original.createdBy.name}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {creatorTypeLabels[row.original.createdBy.type]}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'حالة النقطة',
        cell: ({ row }) => (
          <FeedingPointStatusBadge status={row.original.status} />
        ),
      },
      {
        id: 'refills',
        header: 'إعادة التعبئة',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.pendingRefillsCount > 0 ? (
            <Badge tone="pending">
              {row.original.pendingRefillsCount} تنتظر التحقق
            </Badge>
          ) : row.original.lastVerifiedRefillAt ? (
            <span className="whitespace-nowrap text-[12px] text-muted-foreground">
              مؤكدة {formatFeedingPointRelative(row.original.lastVerifiedRefillAt)}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground">
              لا توجد تعبئة مؤكدة
            </span>
          ),
      },
      {
        id: 'location',
        header: 'الموقع',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-36">
            <p className="text-[12px] font-medium">
              {row.original.location.governorate}
              {row.original.location.city ? ` — ${row.original.location.city}` : ''}
            </p>
            <p className="mt-0.5 max-w-48 truncate text-[11px] text-muted-foreground">
              {row.original.location.address}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'آخر نشاط',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[12px] text-muted-foreground">
            {formatFeedingPointRelative(
              row.original.latestRefillReportAt ?? row.original.updatedAt,
            )}
          </span>
        ),
      },
    ],
    [],
  );

  // Row actions provide both the internal details page and the external map location.
  const rowActions = (row: FeedingPointListRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={`إجراءات ${row.id}`}>
          <MoreHorizontal className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/feeding-points/${row.id}`)}>
          <ExternalLink className="size-4" />
          عرض التفاصيل
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() =>
            window.open(
              `https://www.google.com/maps?q=${row.location.latitude},${row.location.longitude}`,
              '_blank',
              'noopener,noreferrer',
            )
          }
        >
          <MapPin className="size-4" />
          فتح الموقع
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      loading={loading}
      error={error}
      onRetry={onRetry}
      enableSearch={false}
      rowActions={rowActions}
      onRowClick={(row) => navigate(`/feeding-points/${row.id}`)}
      rowAriaLabel={(row) => `فتح نقطة الإطعام ${row.id}`}
      emptyState={emptyState}
      totalCount={total}
      pageCount={pageCount}
      manualPagination
      manualFiltering
      manualSorting
      state={{
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize,
        search: filters.search,
        sorting: filters.sortBy
          ? [
              {
                id: filters.sortBy,
                desc: filters.sortDirection !== 'asc',
              },
            ]
          : [],
      }}
      onStateChange={onQueryChange}
    />
  );
}