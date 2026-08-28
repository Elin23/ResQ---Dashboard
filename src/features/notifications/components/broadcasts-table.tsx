import { useMemo, type ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, Eye, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { NotificationStatusBadge } from './notification-badges';
import { notificationChannelLabels } from '../constants';
import type { BroadcastFilters, BroadcastNotification } from '../types';
import { formatDateTime, summarizeAudience } from '../utils';

export function BroadcastsTable({ items, total, pageCount, filters, loading, onQueryChange, emptyState }: { items: BroadcastNotification[]; total: number; pageCount: number; filters: BroadcastFilters; loading: boolean; onQueryChange: (state: DataTableQueryState) => void; emptyState: ReactNode }) {
  const navigate = useNavigate();

  // Keep the broadcast table columns stable between renders.
  const columns = useMemo<Array<ColumnDef<BroadcastNotification, unknown>>>(
    () => [
      {
        accessorKey: 'title',
        header: 'الإشعار',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.original.title}
            </p>

            <p className="text-xs text-muted-foreground">
              {row.original.id}
            </p>
          </div>
        ),
      },
      {
        id: 'audience',
        header: 'الجمهور',
        cell: ({ row }) => (
          <span className="max-w-52 text-sm">
            {summarizeAudience(row.original.audience)}
          </span>
        ),
      },
      {
        id: 'channels',
        header: 'القنوات',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.channels.map((channel) => (
              <Badge key={channel}>
                {notificationChannelLabels[channel]}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <NotificationStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: 'scheduledAt',
        header: 'وقت الجدولة',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDateTime(row.original.scheduledAt)}
          </span>
        ),
      },
      {
        accessorKey: 'sentAt',
        header: 'وقت الإرسال',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDateTime(row.original.sentAt)}
          </span>
        ),
      },
      {
        id: 'reach',
        header: 'الوصول',
        cell: ({ row }) => (
          <span>
            {row.original.statistics?.sentCount ?? '—'}
          </span>
        ),
      },
      {
        id: 'creator',
        header: 'المنشئ',
        cell: ({ row }) => (
          <span>
            {row.original.createdBy.name}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      loading={loading}
      enableSearch={false}
      manualPagination
      manualFiltering
      manualSorting
      pageCount={pageCount}
      totalCount={total}
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
      onRowClick={(row) => navigate(`/notifications/${row.id}`)}
      rowAriaLabel={(row) => `فتح تفاصيل الإشعار ${row.id}`}
      emptyState={emptyState}
      rowActions={(row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label={`إجراءات ${row.id}`}>
              <MoreHorizontal className="size-4" />
            </IconButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => navigate(`/notifications/${row.id}`)}>
              <Eye className="size-4" />
              عرض التفاصيل
            </DropdownMenuItem>

            {/* Copy the broadcast ID for support or audit references. */}
            <DropdownMenuItem onSelect={() => void navigator.clipboard.writeText(row.id)}>
              <Copy className="size-4" />
              نسخ رقم الإشعار
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}