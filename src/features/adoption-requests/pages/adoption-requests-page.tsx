import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, ErrorState, ExportMenuButton, PageHeader } from '@/components/ui';
import type { DataTableQueryState } from '@/components/ui/data-table';
import { commitSearchParams } from '@/lib/search-params';
import { AdoptionFilterBar } from '../components/adoption-filter-bar';
import { AdoptionSummaryCards } from '../components/adoption-summary';
import { AdoptionRequestsTable } from '../components/adoption-table';
import { useAdoptionRequests, useAdoptionRequestSummary } from '../hooks';
import { adoptionOrganizationOptions } from '../services/adoption-requests.mock';
import { adoptionAnimalSpecies, adoptionPublisherTypes, adoptionRequestStatuses, type AdoptionRequest, type AdoptionRequestFilters } from '../types';
import { hasAdoptionFilters } from '../utils';
import { adoptionAnimalSpeciesLabels, adoptionPublisherTypeLabels, adoptionStatusLabels } from '../constants';

const valid = <T extends string>(value: string | null, options: readonly T[]): T | undefined => value && options.includes(value as T) ? value as T : undefined;

function fromParams(params: URLSearchParams): AdoptionRequestFilters {
  return {
    search: params.get('q') ?? '',
    status: valid(params.get('status'), adoptionRequestStatuses),
    species: valid(params.get('species'), adoptionAnimalSpecies),
    publisherType: valid(params.get('publisherType'), adoptionPublisherTypes),
    organizationId: params.get('organization') ?? undefined,
    city: params.get('city') ?? undefined,
    userId: params.get('userId') ?? undefined,
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    pageSize: [10, 20, 50].includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 10,
    sortBy: valid(params.get('sort'), ['submittedAt', 'updatedAt', 'status'] as const),
    sortDirection: params.get('direction') === 'asc' ? 'asc' : 'desc',
  };
}

function toParams(filters: AdoptionRequestFilters) {
  const params = new URLSearchParams();
  const entries: Array<[string, string | number | undefined]> = [
    ['q', filters.search || undefined], ['status', filters.status], ['species', filters.species], ['publisherType', filters.publisherType], ['organization', filters.organizationId], ['city', filters.city], ['userId', filters.userId], ['page', filters.page > 1 ? filters.page : undefined], ['pageSize', filters.pageSize !== 10 ? filters.pageSize : undefined], ['sort', filters.sortBy], ['direction', filters.sortBy ? filters.sortDirection : undefined],
  ];
  for (const [key, value] of entries) if (value !== undefined) params.set(key, String(value));
  return params;
}

export function AdoptionRequestsPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => fromParams(params), [params]);
  const query = useAdoptionRequests(filters);
  const summary = useAdoptionRequestSummary();
  const organizations = useMemo(() => adoptionOrganizationOptions, []);
  const update = useCallback((patch: Partial<AdoptionRequestFilters>) => commitSearchParams(params, toParams({ ...filters, ...patch }), setParams), [filters, params, setParams]);
  const clear = () => setParams(new URLSearchParams());
  const onState = useCallback((state: DataTableQueryState) => {
    const sort = state.sorting[0];
    const next = sort && ['submittedAt', 'updatedAt', 'status'].includes(sort.id) ? sort.id as AdoptionRequestFilters['sortBy'] : undefined;
    if (state.pageIndex + 1 !== filters.page || state.pageSize !== filters.pageSize || next !== filters.sortBy || (next && (sort?.desc ? 'desc' : 'asc')) !== filters.sortDirection) update({ page: state.pageIndex + 1, pageSize: state.pageSize, sortBy: next, sortDirection: next ? sort?.desc ? 'desc' : 'asc' : undefined });
  }, [filters.page, filters.pageSize, filters.sortBy, filters.sortDirection, update]);
  if (query.isError && !query.data) return <ErrorState title="تعذر تحميل عروض التبني" description={query.error.message} onRetry={() => void query.refetch()}/>;
  const active = hasAdoptionFilters(filters);
  const empty = <EmptyState title={filters.status === 'PENDING_REVIEW' ? 'لا توجد عروض جديدة بانتظار المراجعة.' : active ? 'لا توجد عروض تطابق الفلاتر الحالية.' : 'لا توجد عروض تبني حتى الآن.'} description={active ? 'جرّب تعديل الفلاتر أو مسحها.' : 'ستظهر هنا طلبات نشر الحيوانات للتبني التي يرسلها المستخدمون والجمعيات.'} action={active ? <Button variant="secondary" onClick={clear}>مسح الفلاتر</Button> : undefined}/>;
  return <div className="space-y-5"><PageHeader title="عروض التبني" description="مراجعة طلبات نشر الحيوانات للتبني، ثم متابعة طلبات المتبنين ورد الناشر بعد النشر." breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'عروض التبني' }]} actions={<ExportMenuButton title="عروض التبني" fileName="resq-adoption-offers" rows={query.data?.items ?? []} disabled={query.isLoading} subtitle="تصدير النتائج الظاهرة حاليًا وفق الفلاتر المطبقة." columns={[{ label:'الرقم', value:(item:AdoptionRequest)=>item.id },{ label:'الحيوان', value:(item:AdoptionRequest)=>item.animal.name ?? adoptionAnimalSpeciesLabels[item.animal.species] },{ label:'النوع', value:(item:AdoptionRequest)=>adoptionAnimalSpeciesLabels[item.animal.species] },{ label:'الناشر', value:(item:AdoptionRequest)=>item.publisher.name },{ label:'نوع الناشر', value:(item:AdoptionRequest)=>adoptionPublisherTypeLabels[item.publisher.type] },{ label:'الحالة', value:(item:AdoptionRequest)=>adoptionStatusLabels[item.status] },{ label:'طلبات التبني', value:(item:AdoptionRequest)=>item.applicationsCount },{ label:'الموقع', value:(item:AdoptionRequest)=>item.location },{ label:'تاريخ الطلب', value:(item:AdoptionRequest)=>new Date(item.submittedAt).toLocaleString('ar-SY-u-nu-latn') }]} />}/><AdoptionSummaryCards summary={summary.data} loading={summary.isLoading} onFilter={update}/><AdoptionFilterBar filters={filters} organizations={organizations} onChange={update} onClear={clear} active={active}/><AdoptionRequestsTable items={query.data?.items ?? []} total={query.data?.total ?? 0} pageCount={query.data?.pageCount ?? 1} filters={filters} loading={query.isLoading || query.isFetching && !query.data} error={query.isError ? query.error.message : undefined} onRetry={() => void query.refetch()} onQueryChange={onState} emptyState={empty}/></div>;
}
