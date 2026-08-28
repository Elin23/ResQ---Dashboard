import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyState, IconButton } from '@/components/ui';
import { DataTable } from '@/components/ui/data-table';

import { ContentStatusBadge } from './content-status-badge';
import type { Article, AwarenessContent, SuccessStory } from '../types';
import { formatEditorialDate } from '../utils';

type Item = Article | SuccessStory | AwarenessContent;

export function EditorialList({ items, loading, total, pageCount, page, pageSize, onPageChange, basePath, emptyTitle }: { items: Item[]; loading: boolean; total: number; pageCount: number; page: number; pageSize: number; onPageChange: (page: number, pageSize: number) => void; basePath: string; emptyTitle: string }) {
  const navigate = useNavigate();

  // Keep the table columns stable between renders.
  const columns = useMemo<Array<ColumnDef<Item, unknown>>>(
    () => [
      {
        header: 'المحتوى',
        cell: ({ row }) => (
          <div>
            <p className="text-[12px] font-medium">
              {row.original.title}
            </p>

            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {row.original.id} · {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        header: 'الحالة',
        cell: ({ row }) => (
          <ContentStatusBadge status={row.original.status} />
        ),
      },
      {
        header: 'الكاتب',
        cell: ({ row }) => (
          <span className="text-[12px]">
            {row.original.author.name}
          </span>
        ),
      },
      {
        header: 'النشر / الجدولة',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[12px] text-muted-foreground">
            {formatEditorialDate(
              row.original.publishedAt ?? row.original.scheduledAt,
            )}
          </span>
        ),
      },
      {
        header: 'آخر تحديث',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[12px] text-muted-foreground">
            {formatEditorialDate(row.original.updatedAt)}
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
      loading={loading}
      enableSearch={false}
      manualPagination
      pageCount={pageCount}
      totalCount={total}
      state={{
        pageIndex: page - 1,
        pageSize,
        search: '',
        sorting: [],
      }}
      onStateChange={(state) =>
        onPageChange(state.pageIndex + 1, state.pageSize)
      }
      onRowClick={(item) =>
        navigate(`${basePath}/${item.id}`)
      }
      rowAriaLabel={(item) => `فتح ${item.title}`}
      rowActions={(item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label={`إجراءات ${item.title}`}>
              <MoreHorizontal className="size-4" />
            </IconButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() =>
                navigate(`${basePath}/${item.id}`)
              }
            >
              <ExternalLink className="size-4" />
              عرض التفاصيل
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      emptyState={
        <EmptyState
          title={emptyTitle}
          description="لا يوجد محتوى يطابق عوامل التصفية الحالية."
        />
      }
    />
  );
}