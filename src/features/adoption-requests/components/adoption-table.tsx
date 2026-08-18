import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { adoptionAnimalSpeciesLabels } from '../constants';
import type { AdoptionRequest, AdoptionRequestFilters } from '../types';
import { formatAdoptionRelative } from '../utils';
import { AdoptionPublisherBadge, AdoptionStatusBadge } from './adoption-badges';

type AdoptionCell = { row: { original: AdoptionRequest } };

export function AdoptionRequestsTable({ items, total, pageCount, filters, loading, error, onRetry, onQueryChange, emptyState }: { items: AdoptionRequest[]; total: number; pageCount: number; filters: AdoptionRequestFilters; loading: boolean; error?: string; onRetry: () => void; onQueryChange: (state: DataTableQueryState) => void; emptyState: ReactNode }) {
  const navigate = useNavigate();
  const columns = useMemo<Array<ColumnDef<AdoptionRequest, unknown>>>(() => [
    { id: 'animal', header: 'العرض', enableSorting: false, cell: ({ row }: AdoptionCell) => <div className="flex min-w-48 items-center gap-3">{row.original.animal.imageUrls[0] ? <img src={row.original.animal.imageUrls[0]} alt="" className="size-10 rounded-lg object-cover" loading="lazy"/> : <span className="size-10 rounded-lg bg-muted"/>}<div className="min-w-0"><p className="truncate text-[13px] font-medium">{row.original.animal.name ?? adoptionAnimalSpeciesLabels[row.original.animal.species]}</p><p dir="ltr" className="mt-0.5 text-start text-[11px] text-muted-foreground">{row.original.id}</p></div></div> },
    { id: 'publisher', header: 'الناشر', enableSorting: false, cell: ({ row }: AdoptionCell) => <div className="min-w-36"><div className="flex items-center gap-2"><p className="truncate text-[12px] font-medium">{row.original.publisher.name}</p><AdoptionPublisherBadge type={row.original.publisher.type}/></div><p className="mt-0.5 text-[11px] text-muted-foreground">{row.original.publisher.city ?? '—'}</p></div> },
    { accessorKey: 'status', header: 'حالة النشر', cell: ({ row }: AdoptionCell) => <AdoptionStatusBadge status={row.original.status}/> },
    { id: 'applications', header: 'طلبات التبني', enableSorting: false, cell: ({ row }: AdoptionCell) => <div><p className="text-[12px] font-medium">{row.original.applicationsCount.toLocaleString('ar-SA-u-nu-latn')} طلب</p>{row.original.pendingApplicationsCount > 0 && <p className="mt-0.5 text-[11px] text-pending">{row.original.pendingApplicationsCount.toLocaleString('ar-SA-u-nu-latn')} بانتظار رد الناشر</p>}</div> },
    { id: 'location', header: 'الموقع', enableSorting: false, cell: ({ row }: AdoptionCell) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{row.original.location}</span> },
    { accessorKey: 'updatedAt', header: 'آخر تحديث', cell: ({ row }: AdoptionCell) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatAdoptionRelative(row.original.updatedAt)}</span> },
  ], []);
  return <DataTable data={items} columns={columns} getRowId={(row) => row.id} enableSearch={false} loading={loading} error={error} onRetry={onRetry} manualPagination manualSorting manualFiltering pageCount={pageCount} totalCount={total} state={{ pageIndex: filters.page - 1, pageSize: filters.pageSize, search: filters.search, sorting: filters.sortBy ? [{ id: filters.sortBy, desc: filters.sortDirection !== 'asc' }] : [] }} onStateChange={onQueryChange} onRowClick={(row) => navigate(`/adoption-requests/${row.id}`)} rowAriaLabel={(row) => `فتح عرض التبني ${row.id}`} rowActions={(row) => <DropdownMenu><DropdownMenuTrigger asChild><IconButton label={`إجراءات ${row.id}`}><MoreHorizontal className="size-4"/></IconButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => navigate(`/adoption-requests/${row.id}`)}><ExternalLink className="size-4"/>عرض التفاصيل</DropdownMenuItem>{row.publisher.type === 'USER' ? <DropdownMenuItem onSelect={() => navigate(`/users/${row.publisher.id}`)}>فتح ملف الناشر</DropdownMenuItem> : <DropdownMenuItem onSelect={() => navigate(`/organizations/${row.publisher.id}`)}>فتح الجمعية</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>} emptyState={emptyState}/>;
}
