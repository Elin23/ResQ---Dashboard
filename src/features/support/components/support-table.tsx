import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { supportCategoryLabels } from '../constants';
import type { SupportFilters, SupportTicket } from '../types';
import { formatSupportRelative } from '../utils';
import { SupportPriorityBadge, SupportStatusBadge } from './support-badges';

export function SupportTable({ items, total, pageCount, filters, loading, onQueryChange, emptyState }: { items: SupportTicket[]; total: number; pageCount: number; filters: SupportFilters; loading: boolean; onQueryChange: (s: DataTableQueryState) => void; emptyState: ReactNode }) {
  const nav = useNavigate();

  const columns = useMemo<Array<ColumnDef<SupportTicket, unknown>>>(
    () => [
      {
        accessorKey: 'id',
        header: 'رقم التذكرة',
        cell: ({ row }) => <span dir="ltr" className="font-medium">{row.original.id}</span>,
      },
      {
        accessorKey: 'subject',
        header: 'الموضوع',
        cell: ({ row }) => (
          <div className="min-w-56">
            <p className="font-medium">{row.original.subject}</p>
            {row.original.relatedResource && (
              <p className="text-xs text-muted-foreground">
                مرتبط بـ {row.original.relatedResource.id}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'requester',
        header: 'مقدم الطلب',
        cell: ({ row }) => (
          <div>
            <p>{row.original.requester.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.requester.type === 'USER' ? 'مستخدم' : 'جمعية'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'التصنيف',
        cell: ({ row }) => supportCategoryLabels[row.original.category],
      },
      {
        id: 'priority',
        header: 'الأولوية',
        cell: ({ row }) => <SupportPriorityBadge priority={row.original.priority} />,
      },
      {
        id: 'status',
        header: 'الحالة',
        cell: ({ row }) => <SupportStatusBadge status={row.original.status} />,
      },
      {
        id: 'assignee',
        header: 'المسؤول',
        cell: ({ row }) => row.original.assignee?.name ?? 'غير مسندة',
      },
      {
        accessorKey: 'updatedAt',
        header: 'آخر تحديث',
        cell: ({ row }) => <span className="whitespace-nowrap">{formatSupportRelative(row.original.updatedAt)}</span>,
      },
      {
        id: 'waiting',
        header: 'وقت الانتظار',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {['RESOLVED', 'CLOSED'].includes(row.original.status) ? '—' : formatSupportRelative(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  // Keep table state controlled by the support filters.
  return (
    <DataTable
      data={items}
      columns={columns}
      getRowId={(x) => x.id}
      loading={loading}
      enableSearch={false}
      manualFiltering
      manualPagination
      manualSorting
      pageCount={pageCount}
      totalCount={total}
      state={{
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize,
        search: '',
        sorting: filters.sortBy ? [{ id: filters.sortBy, desc: filters.sortDirection !== 'asc' }] : [],
      }}
      onStateChange={onQueryChange}
      onRowClick={(x) => nav(`/support/${x.id}`)}
      rowAriaLabel={(x) => `فتح تذكرة ${x.id}`}
      rowActions={(x) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label={`إجراءات ${x.id}`}>
              <MoreHorizontal className="size-4" />
            </IconButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => nav(`/support/${x.id}`)}>
              عرض المحادثة
            </DropdownMenuItem>

            {x.relatedResource && (
              <DropdownMenuItem onSelect={() => nav(`/support/${x.id}`)}>
                مراجعة المورد المرتبط
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      emptyState={emptyState}
    />
  );
}