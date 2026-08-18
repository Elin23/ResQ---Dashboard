import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui';
import { DataTable, type DataTableQueryState } from '@/components/ui/data-table';
import { organizationServiceLabels } from '../constants';
import type { Organization, OrganizationFilters } from '../types';
import { OrganizationStatusBadge, VerificationBadge } from './organization-badges';
import { formatOrganizationDate } from '../utils';
export function OrganizationsTable({items,total,pageCount,filters,loading,error,onRetry,onQueryChange,emptyState}:{items:Organization[];total:number;pageCount:number;filters:OrganizationFilters;loading:boolean;error?:string;onRetry:()=>void;onQueryChange:(state:DataTableQueryState)=>void;emptyState:ReactNode}){const navigate=useNavigate();const columns=useMemo<Array<ColumnDef<Organization,unknown>>>(()=>[
{id:'organization',header:'الجمعية',enableSorting:false,cell:({row})=><div className="flex min-w-56 items-center gap-3"><Avatar name={row.original.name} src={row.original.logoUrl}/><div><p className="font-medium">{row.original.name}</p><p className="text-xs text-muted-foreground" dir="ltr">{row.original.id}</p></div></div>},
{accessorKey:'status',header:'الحالة',cell:({row})=><OrganizationStatusBadge status={row.original.status}/>},
{id:'verification',header:'التحقق',enableSorting:false,cell:({row})=><VerificationBadge status={row.original.verificationStatus}/>},
{accessorKey:'governorate',header:'المحافظة'},
{id:'services',header:'الخدمات',enableSorting:false,cell:({row})=>{const labels=row.original.services.map(s=>organizationServiceLabels[s.key]);return <span className="text-sm">{labels.slice(0,3).join('، ')}{labels.length>3?` +${labels.length-3}`:''}</span>}},
{id:'reports',header:'البلاغات النشطة',enableSorting:false,cell:({row})=><Badge tone={(row.original.statistics?.activeReports??0)>0?'info':'neutral'}>{row.original.statistics?.activeReports??0}</Badge>},
{id:'rating',header:'التقييم',enableSorting:false,cell:({row})=>row.original.statistics?.rating?<span>{row.original.statistics.rating.toFixed(1)} <span className="text-xs text-muted-foreground">({row.original.statistics.reviewsCount})</span></span>:<span className="text-muted-foreground">—</span>},
{accessorKey:'createdAt',header:'تاريخ التسجيل',cell:({row})=><span className="whitespace-nowrap text-sm">{formatOrganizationDate(row.original.createdAt)}</span>},
],[]);return <DataTable data={items} columns={columns} getRowId={o=>o.id} loading={loading} error={error} onRetry={onRetry} enableSearch={false} manualFiltering manualPagination manualSorting pageCount={pageCount} totalCount={total} state={{pageIndex:filters.page-1,pageSize:filters.pageSize,search:'',sorting:filters.sortBy?[{id:filters.sortBy,desc:filters.sortDirection!=='asc'}]:[]}} onStateChange={onQueryChange} onRowClick={o=>navigate(`/organizations/${o.id}`)} rowAriaLabel={o=>`فتح ملف ${o.name}`} rowActions={o=><DropdownMenu><DropdownMenuTrigger asChild><IconButton label={`إجراءات ${o.name}`}><MoreHorizontal className="size-4"/></IconButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>navigate(`/organizations/${o.id}`)}>عرض الملف</DropdownMenuItem><DropdownMenuItem onSelect={()=>navigate(`/reports?organization=${o.id}`)}>البلاغات المسندة</DropdownMenuItem><DropdownMenuItem onSelect={()=>navigate(`/adoption-requests?organizationId=${o.id}`)}>طلبات التبني</DropdownMenuItem></DropdownMenuContent></DropdownMenu>} emptyState={emptyState}/>;}
