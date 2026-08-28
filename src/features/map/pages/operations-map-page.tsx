import { LocateFixed, MapPinned, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { MapCanvas } from '@/components/map/MapCanvas';
import { MapProvider } from '@/components/map/MapProvider';
import { Button, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui';
import { useAnyPermission, usePermission } from '@/features/auth/rbac';

import { MapAddListingDialog } from '../components/map-add-listing-dialog';
import { MapControls } from '../components/map-controls';
import { MapEntityList } from '../components/map-entity-list';
import { MapEntityPanel } from '../components/map-entity-panel';
import { MapManageView } from '../components/map-manage-view';
import { MapRequestsView } from '../components/map-requests-view';
import { mapLayerConfigs } from '../constants';
import { useOperationalMapData } from '../hooks';
import type { MapFilters, MapLayerKey } from '../types';
import { matchesSearch } from '../utils';

type View = 'MAP' | 'REQUESTS' | 'MANAGE';

export function OperationsMapPage() {
  const query = useOperationalMapData();
  const canCreate = usePermission('map.create');
  const canReview = usePermission('map.review');
  const canManage = useAnyPermission(['map.update', 'map.delete']);

  const [view, setView] = useState<View>('MAP');
  const [addOpen, setAddOpen] = useState(false);
  const [fitNonce, setFitNonce] = useState(0);
  const [filters, setFilters] = useState<MapFilters>({ search: '' });
  const [layers, setLayers] = useState<Set<MapLayerKey>>(
    () => new Set(mapLayerConfigs.filter((item) => item.defaultVisible).map((item) => item.key)),
  );
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    if ((view === 'REQUESTS' && !canReview) || (view === 'MANAGE' && !canManage)) {
      setView('MAP');
    }
  }, [canManage, canReview, view]);

  // Apply public visibility, layer, location, and search filters before rendering the map.
  const visible = useMemo(
    () =>
      (query.data?.entities ?? []).filter(
        (entity) =>
          entity.metadata.status === 'ACTIVE' &&
          layers.has(entity.type) &&
          (!filters.governorate || entity.governorate === filters.governorate) &&
          matchesSearch(entity, filters.search),
      ),
    [query.data, filters, layers],
  );

  const selected = useMemo(() => visible.find((item) => item.id === selectedId), [visible, selectedId]);

  const toggle = useCallback((key: MapLayerKey, show: boolean) => {
    setLayers((current) => {
      const next = new Set(current);

      if (show) {
        next.add(key);
      } else {
        next.delete(key);
      }

      return next;
    });
  }, []);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="دليل الخريطة" description="خريطة عامة للأماكن والخدمات المهمة للمهتمين بالحيوانات." />
        <Skeleton className="h-[42rem] rounded-xl" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title="تعذر تحميل دليل الخريطة"
        description="يمكن إعادة المحاولة دون إعادة تحميل الصفحة."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const tabs: Array<{ key: View; label: string }> = [
    { key: 'MAP', label: 'الخريطة العامة' },
    ...(canReview
      ? [
          {
            key: 'REQUESTS' as const,
            label: `طلبات الظهور (${query.data?.requests.filter((item) => item.metadata.reviewStatus === 'PENDING').length ?? 0})`,
          },
        ]
      : []),
    ...(canManage ? [{ key: 'MANAGE' as const, label: 'إدارة الأماكن' }] : []),
  ];

  return (
    <div dir="rtl" className="space-y-6 pb-6">
      <PageHeader
        title="دليل الخريطة"
        description="أماكن وخدمات موثوقة للمهتمين بالحيوانات؛ الجمعيات ونقاط الإطعام تظهر تلقائيًا، وطلبات المستخدمين تخضع لمراجعة الإدارة."
        actions={
          <>
            <Button variant="secondary" onClick={() => void query.refetch()}>
              <RefreshCw className="size-4" />
              تحديث
            </Button>

            {canCreate && (
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                إضافة مكان
              </Button>
            )}
          </>
        }
      />

      {tabs.length > 1 && (
        <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/45 bg-white p-1" role="tablist" aria-label="أقسام دليل الخريطة">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={view === tab.key}
              onClick={() => setView(tab.key)}
              className={`h-8 shrink-0 rounded-lg px-3 text-[12px] font-medium transition-colors ${view === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {view === 'MAP' && (
        <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside>
            <MapControls filters={filters} onFilters={setFilters} layers={layers} onLayer={toggle} />
          </aside>

          <main className="min-w-0 space-y-3">
            <div className="rounded-xl border border-border/45 bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold">{visible.length.toLocaleString('ar-SA-u-nu-latn')} مكانًا ظاهرًا</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">اضغط على أي علامة لعرض بياناتها.</p>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!visible.length}
                  onClick={() => {
                    setSelectedId(undefined);
                    setFitNonce((value) => value + 1);
                  }}
                >
                  <LocateFixed className="size-4" />
                  إظهار الكل
                </Button>
              </div>

              {visible.length ? (
                <MapProvider>
                  <MapCanvas
                    entities={visible}
                    selectedId={selected?.id}
                    onSelect={(entity) => setSelectedId(entity.id)}
                    fitNonce={fitNonce}
                    focusEntity={selected}
                  />
                </MapProvider>
              ) : (
                <div className="py-10">
                  <EmptyState title="لا توجد أماكن مطابقة" description="غيّر البحث أو المحافظة أو فعّل فئات إضافية." />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/45 bg-white p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <MapPinned className="size-4 text-primary" />
                <p className="text-[13px] font-semibold">الأماكن الظاهرة</p>
              </div>

              {visible.length ? (
                <MapEntityList entities={visible} selectedId={selected?.id} onSelect={(entity) => setSelectedId(entity.id)} />
              ) : (
                <p className="py-4 text-center text-[11px] text-muted-foreground">لا توجد أماكن ضمن الفلاتر الحالية.</p>
              )}
            </div>
          </main>

          <aside className="xl:sticky xl:top-24">
            <MapEntityPanel entity={selected} />
          </aside>
        </div>
      )}

      {view === 'REQUESTS' && canReview && <MapRequestsView requests={query.data?.requests ?? []} />}
      {view === 'MANAGE' && canManage && <MapManageView entities={query.data?.entities ?? []} />}

      {canCreate && <MapAddListingDialog open={addOpen} onOpenChange={setAddOpen} />}
    </div>
  );
}
