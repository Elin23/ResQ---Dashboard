import { useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ExternalLink, MoreHorizontal, Search, RotateCcw } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyState, ErrorState, IconButton, Input, Select, Skeleton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams } from '@/lib/search-params';
import { donationCampaignStatuses, type DonationCampaign, type DonationCampaignFilters, type DonationCampaignStatus } from '../types';
import { donationCampaignStatusLabels } from '../constants';
import { useDonationCampaigns, useDonationSummary } from '../hooks';
import { DonationCampaignStatusBadge } from '../components/donation-badges';
import { formatDonationDate, formatMoney } from '../utils';
import type { ColumnDef } from '@tanstack/react-table';

function read(params: URLSearchParams): DonationCampaignFilters {
  const status = params.get('status');
  return {
    search: params.get('q') ?? '',
    status: status && donationCampaignStatuses.includes(status as DonationCampaignStatus) ? status as DonationCampaignStatus : undefined,
    organizationId: params.get('organizationId') ?? undefined,
    dateFrom: params.get('from') ?? undefined,
    dateTo: params.get('to') ?? undefined,
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 10,
    sortBy: (params.get('sort') as DonationCampaignFilters['sortBy']) ?? 'updatedAt',
    sortDirection: params.get('direction') === 'asc' ? 'asc' : 'desc',
  };
}

function write(filters: DonationCampaignFilters): URLSearchParams {
  const params = new URLSearchParams();
  const entries: Array<[string, string | number | undefined]> = [['q', filters.search || undefined], ['status', filters.status], ['organizationId', filters.organizationId], ['from', filters.dateFrom], ['to', filters.dateTo], ['page', filters.page > 1 ? filters.page : undefined], ['pageSize', filters.pageSize !== 10 ? filters.pageSize : undefined], ['sort', filters.sortBy], ['direction', filters.sortDirection]];
  for (const [key, value] of entries) if (value !== undefined) params.set(key, String(value));
  return params;
}

function Summary({ loading, pending, published, donors, amount }: { loading: boolean; pending: number; published: number; donors: number; amount: string }) {
  const items = [['بانتظار المراجعة', pending], ['حملات منشورة', published], ['المتبرعون بالأرشيف', donors], ['إجمالي التبرعات', amount]];
  return <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{items.map(([label, value]) => loading ? <Skeleton key={label} className="h-[86px] rounded-xl" /> : <div key={label} className="h-[86px] rounded-xl border border-border/45 bg-white p-3.5"><p className="text-[12px] text-muted-foreground">{label}</p><p className="mt-2 text-[22px] font-medium leading-none text-foreground">{value}</p></div>)}</div>;
}

export function DonationsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const filters = useMemo(() => read(params), [params]);
  const query = useDonationCampaigns(filters);
  const summary = useDonationSummary();
  const update = useCallback((patch: Partial<DonationCampaignFilters>) => commitSearchParams(params, write({ ...filters, ...patch }), setParams), [filters, params, setParams]);
  const clear = () => setParams(new URLSearchParams());
  const active = Boolean(filters.search || filters.status || filters.organizationId || filters.dateFrom || filters.dateTo);
  const columns = useMemo<Array<ColumnDef<DonationCampaign, unknown>>>(() => [
    { accessorKey: 'title', header: 'الحملة', cell: ({ row }) => <div className="min-w-52"><p className="text-[12px] font-medium">{row.original.title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{row.original.id}</p></div> },
    { id: 'publisher', header: 'صاحب الحملة', enableSorting: false, cell: ({ row }) => <div><p className="text-[12px] font-medium">{row.original.publisher.name}</p><p className="text-[11px] text-muted-foreground">مستخدم</p></div> },
    { id: 'beneficiary', header: 'الجمعية المستفيدة', enableSorting: false, cell: ({ row }) => <span className="text-[12px]">{row.original.beneficiaryOrganization.name}</span> },
    { accessorKey: 'status', header: 'حالة النشر', cell: ({ row }) => <DonationCampaignStatusBadge status={row.original.status} /> },
    { accessorKey: 'raisedAmountMinor', header: 'الأرشيف', cell: ({ row }) => <div><p className="whitespace-nowrap text-[12px] font-medium">{formatMoney(row.original.raisedAmountMinor, row.original.currency)}</p><p className="text-[11px] text-muted-foreground">{row.original.donorCount} متبرع</p></div> },
    { accessorKey: 'submittedAt', header: 'تاريخ الطلب', cell: ({ row }) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDonationDate(row.original.submittedAt)}</span> },
  ], []);
  const onStateChange = useCallback((state: DataTableQueryState) => { const sort = state.sorting[0]; update({ page: state.pageIndex + 1, pageSize: state.pageSize, sortBy: (sort?.id as DonationCampaignFilters['sortBy']) ?? filters.sortBy, sortDirection: sort?.desc ? 'desc' : 'asc' }); }, [filters.sortBy, update]);
  if (query.isError && !query.data) return <ErrorState title="تعذر تحميل حملات التبرع" description={query.error.message} onRetry={() => void query.refetch()} />;
  return <div className="space-y-4" dir="rtl">
    <div><div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70"><span>الرئيسية</span><span>/</span><span>التبرعات</span></div><h1 className="mt-1 text-[19px] font-medium leading-6">أرشيف حملات التبرع</h1><p className="mt-0.5 text-[12px] text-muted-foreground/75">راجع طلبات نشر حملات التبرع قبل ظهورها، ثم تابع الأرشيف العام دون الوصول إلى بيانات الدفع أو معلومات المتبرعين الخاصة.</p></div>
    <Summary loading={summary.isLoading} pending={summary.data?.pending ?? 0} published={summary.data?.publishedCampaigns ?? 0} donors={summary.data?.donorCount ?? 0} amount={summary.data?.total.map((item) => formatMoney(item.amountMinor, item.currency)).join(' + ') || '0 ل.س'} />
    <div className="flex flex-col gap-2 rounded-xl border border-border/45 bg-white p-2.5 md:flex-row md:items-center">
      <label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-9 rounded-xl pe-9 text-[12px]" value={filters.search} onChange={(event) => update({ search: event.target.value, page: 1 })} placeholder="ابحث باسم الحملة، الناشر أو الجمعية…" /></label>
      <Select value={filters.status ?? 'ALL'} onValueChange={(value) => update({ status: value === 'ALL' ? undefined : value as DonationCampaignStatus, page: 1 })} options={[{ value: 'ALL', label: 'كل حالات النشر' }, ...donationCampaignStatuses.filter((status) => status !== 'DELETED').map((value) => ({ value, label: donationCampaignStatusLabels[value] }))]} />
      {active && <Button variant="ghost" size="sm" className="h-9 rounded-xl text-[12px]" onClick={clear}><RotateCcw className="size-4" />مسح الفلاتر</Button>}
    </div>
    <DataTable data={query.data?.items ?? []} columns={columns} loading={query.isLoading || (query.isFetching && !query.data)} enableSearch={false} manualPagination manualFiltering manualSorting pageCount={query.data?.pageCount ?? 1} totalCount={query.data?.total ?? 0} state={{ pageIndex: filters.page - 1, pageSize: filters.pageSize, search: filters.search, sorting: filters.sortBy ? [{ id: filters.sortBy, desc: filters.sortDirection !== 'asc' }] : [] }} onStateChange={onStateChange} onRowClick={(campaign) => navigate(`/donations/${campaign.id}`)} rowAriaLabel={(campaign) => `فتح حملة ${campaign.title}`} rowActions={(campaign) => <DropdownMenu><DropdownMenuTrigger asChild><IconButton label={`إجراءات ${campaign.title}`}><MoreHorizontal className="size-4" /></IconButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => navigate(`/donations/${campaign.id}`)}><ExternalLink className="size-4" />عرض التفاصيل</DropdownMenuItem></DropdownMenuContent></DropdownMenu>} emptyState={<EmptyState title={active ? 'لا توجد حملات تطابق الفلاتر الحالية.' : 'لا توجد حملات تبرع في الأرشيف.'} />} />
  </div>;
}
