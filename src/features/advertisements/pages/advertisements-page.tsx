import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CircleCheck, CircleDollarSign, ExternalLink, FilePenLine, MoreHorizontal, PauseCircle, Plus, RotateCcw, Search } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyState, ErrorState, ExportMenuButton, IconButton, Input, Select } from '@/components/ui';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/summary-card';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams } from '@/lib/search-params';
import { advertisementStatuses, type Advertisement, type AdvertisementFilters, type AdvertisementStatus } from '../types';
import { advertisementPaymentMethodLabels, advertisementPlacementConfig, advertisementStatusLabels } from '../constants';
import { useAdvertisements, useAdvertisementSummary } from '../hooks';
import { AdvertisementStatusBadge } from '../components/advertisement-badges';
import { AdvertisementCreateDialog } from '../components/advertisement-create-dialog';
import { formatAdvertisementDate, formatAdvertisementMoney } from '../utils';

function read(params: URLSearchParams): AdvertisementFilters {
  const status = params.get('status');

  return {
    search: params.get('q') ?? '',
    status:
      status && advertisementStatuses.includes(status as AdvertisementStatus)
        ? (status as AdvertisementStatus)
        : undefined,
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(params.get('pageSize')))
      ? Number(params.get('pageSize'))
      : 10,
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  };
}

function write(filters: AdvertisementFilters) {
  const params = new URLSearchParams();

  // Keep only active filters in the URL.
  if (filters.search) params.set('q', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.pageSize !== 10) params.set('pageSize', String(filters.pageSize));

  return params;
}

function Summary({ loading, active, paused, draft, unpaid }: { loading: boolean; active: number; paused: number; draft: number; unpaid: number }) {
  const items = [
    { key: 'active', label: 'منشورة', value: active, icon: CircleCheck, tone: 'success' as const },
    { key: 'paused', label: 'متوقفة', value: paused, icon: PauseCircle, tone: 'pending' as const },
    { key: 'draft', label: 'مسودات', value: draft, icon: FilePenLine, tone: 'neutral' as const },
    { key: 'unpaid', label: 'غير مسددة', value: unpaid, icon: CircleDollarSign, tone: 'critical' as const },
  ];

  // Advertisement totals use the same KPI presentation as the rest of the dashboard.
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) =>
        loading ? (
          <SummaryCardSkeleton key={item.key} />
        ) : (
          <SummaryCard
            key={item.key}
            label={item.label}
            value={item.value.toLocaleString('ar-SA-u-nu-latn')}
            icon={item.icon}
            tone={item.tone}
          />
        ),
      )}
    </div>
  );
}

export function AdvertisementsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);

  const filters = useMemo(() => read(params), [params]);
  const query = useAdvertisements(filters);
  const summary = useAdvertisementSummary();

  const update = useCallback(
    (patch: Partial<AdvertisementFilters>) =>
      commitSearchParams(
        params,
        write({ ...filters, ...patch }),
        setParams,
      ),
    [filters, params, setParams],
  );

  const clear = () => {
    setParams(new URLSearchParams());
  };

  const activeFilters = Boolean(filters.search || filters.status);

  // Keep columns stable so the table does not rebuild them on every render.
  const columns = useMemo<Array<ColumnDef<Advertisement, unknown>>>(
    () => [
      {
        id: 'ad',
        header: 'الإعلان',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex min-w-60 items-center gap-3">
            <img
              src={row.original.creative.imageUrl}
              alt=""
              className="size-10 rounded-lg object-cover"
            />

            <div>
              <p className="text-[12px] font-medium">
                {row.original.publicationTitle}
              </p>

              <p className="text-[11px] text-muted-foreground">
                {row.original.id}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'owner',
        header: 'صاحب الإعلان',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <p className="text-[12px] font-medium">
              {row.original.ownerName}
            </p>

            <p
              dir="ltr"
              className="text-left text-[11px] text-muted-foreground"
            >
              {row.original.ownerPhone}
            </p>
          </div>
        ),
      },
      {
        id: 'financial',
        header: 'الاتفاق المالي',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <p className="text-[12px] font-medium">
              {formatAdvertisementMoney(row.original.agreedAmountMinor)}
            </p>

            <p className="text-[11px] text-muted-foreground">
              {advertisementPaymentMethodLabels[row.original.paymentMethod]}
            </p>

            <p className={`text-[11px] ${row.original.paid ? 'text-success' : 'text-pending'}`}>
              {row.original.paid ? 'تم التسديد' : 'غير مسدد'}
            </p>
          </div>
        ),
      },
      {
        id: 'placement',
        header: 'مكان النشر',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-[12px]">
            {advertisementPlacementConfig[row.original.placement].label}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <AdvertisementStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'آخر تحديث',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
            {formatAdvertisementDate(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const onStateChange = useCallback(
    (state: DataTableQueryState) => {
      update({
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
      });
    },
    [update],
  );

  if (query.isError && !query.data) {
    return (
      <ErrorState
        title="تعذر تحميل الإعلانات"
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div
      className="space-y-4"
      dir="rtl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <span>الرئيسية</span>
            <span>/</span>
            <span>الإعلانات</span>
          </div>

          <h1 className="mt-1 text-[19px] font-medium leading-6">
            إدارة الإعلانات
          </h1>

          <p className="mt-0.5 text-[12px] text-muted-foreground/75">
            سجل الاتفاق المالي ومحتوى الإعلان ثم انشره أو أوقفه من نفس السجل.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ExportMenuButton
            title="الإعلانات"
            fileName="resq-advertisements"
            rows={query.data?.items ?? []}
            disabled={query.isLoading}
            subtitle="تصدير البيانات الإدارية والمالية للإعلانات الظاهرة حاليًا."
            columns={[
              {
                label: 'الإعلان',
                value: (item: Advertisement) => item.publicationTitle,
              },
              {
                label: 'صاحب الإعلان',
                value: (item: Advertisement) => item.ownerName,
              },
              {
                label: 'المبلغ المتفق عليه',
                value: (item: Advertisement) =>
                  formatAdvertisementMoney(item.agreedAmountMinor),
              },
              {
                label: 'طريقة الدفع',
                value: (item: Advertisement) =>
                  advertisementPaymentMethodLabels[item.paymentMethod],
              },
              {
                label: 'التسديد',
                value: (item: Advertisement) =>
                  item.paid ? 'تم التسديد' : 'غير مسدد',
              },
              {
                label: 'رقم الحوالة',
                value: (item: Advertisement) =>
                  item.paymentMethod === 'TRANSFER'
                    ? item.transferReference ?? ''
                    : '',
              },
              {
                label: 'مكان النشر',
                value: (item: Advertisement) =>
                  advertisementPlacementConfig[item.placement].label,
              },
              {
                label: 'الحالة',
                value: (item: Advertisement) =>
                  advertisementStatusLabels[item.status],
              },
              {
                label: 'آخر تحديث',
                value: (item: Advertisement) =>
                  formatAdvertisementDate(item.updatedAt),
              },
            ]}
          />

          <Button
            className="h-9 rounded-xl px-3 text-[12px]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            إضافة إعلان
          </Button>
        </div>
      </div>

      <Summary
        loading={summary.isLoading}
        active={summary.data?.active ?? 0}
        paused={summary.data?.paused ?? 0}
        draft={summary.data?.draft ?? 0}
        unpaid={summary.data?.unpaid ?? 0}
      />

      <div className="flex flex-col gap-2 rounded-xl border border-border/45 bg-white p-2.5 md:flex-row md:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="h-9 rounded-xl pe-9 text-[12px]"
            value={filters.search}
            onChange={(event) =>
              update({
                search: event.target.value,
                page: 1,
              })
            }
            placeholder="ابحث باسم الإعلان، صاحبه أو رقم الحوالة…"
          />
        </label>

        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            update({
              status:
                value === 'ALL'
                  ? undefined
                  : (value as AdvertisementStatus),
              page: 1,
            })
          }
          options={[
            {
              value: 'ALL',
              label: 'كل الحالات',
            },
            ...advertisementStatuses
              .filter(
                (value) =>
                  !['DELETED', 'PENDING_REVIEW', 'REJECTED'].includes(value),
              )
              .map((value) => ({
                value,
                label: advertisementStatusLabels[value],
              })),
          ]}
        />

        {activeFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl text-[12px]"
            onClick={clear}
          >
            <RotateCcw className="size-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      <DataTable
        data={query.data?.items ?? []}
        columns={columns}
        loading={query.isLoading || (query.isFetching && !query.data)}
        enableSearch={false}
        manualPagination
        manualFiltering
        manualSorting
        pageCount={query.data?.pageCount ?? 1}
        totalCount={query.data?.total ?? 0}
        state={{
          pageIndex: filters.page - 1,
          pageSize: filters.pageSize,
          search: filters.search,
          sorting: [],
        }}
        onStateChange={onStateChange}
        onRowClick={(advertisement) =>
          navigate(`/advertisements/${advertisement.id}`)
        }
        rowAriaLabel={(advertisement) =>
          `فتح الإعلان ${advertisement.publicationTitle}`
        }
        rowActions={(advertisement) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label={`إجراءات ${advertisement.publicationTitle}`}>
                <MoreHorizontal className="size-4" />
              </IconButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() =>
                  navigate(`/advertisements/${advertisement.id}`)
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
            title={
              activeFilters
                ? 'لا توجد إعلانات تطابق الفلاتر الحالية.'
                : 'لا توجد إعلانات مسجلة بعد.'
            }
          />
        }
      />

      <AdvertisementCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/advertisements/${id}`)}
      />
    </div>
  );
}