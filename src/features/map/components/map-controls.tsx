import { Checkbox, DebouncedSearchInput, Select } from '@/components/ui';

import { mapLayerConfigs, syrianGovernorates } from '../constants';
import type { MapFilters, MapLayerKey } from '../types';

export function MapControls({ filters, onFilters, layers, onLayer }: { filters: MapFilters; onFilters: (next: MapFilters) => void; layers: Set<MapLayerKey>; onLayer: (key: MapLayerKey, visible: boolean) => void }) {
  return (
    <div className="space-y-4 rounded-xl border border-border/45 bg-white p-3.5">
      <div>
        <p className="text-[13px] font-semibold">
          البحث والتصفية
        </p>

        <p className="mt-0.5 text-[11px] text-muted-foreground">
          ابحث عن مكان أو خدمة ثم فعّل الفئات التي تهمك.
        </p>
      </div>

      <div className="space-y-2.5">
        <DebouncedSearchInput
          value={filters.search}
          onValueChange={(value) =>
            onFilters({
              ...filters,
              search: value,
            })
          }
          placeholder="اسم مكان، خدمة، محافظة…"
        />

        <Select
          value={filters.governorate ?? 'ALL'}
          onValueChange={(value) =>
            onFilters({
              ...filters,
              governorate: value === 'ALL' ? undefined : value,
            })
          }
          options={[
            { value: 'ALL', label: 'كل المحافظات' },
            ...syrianGovernorates.map((value) => ({
              value,
              label: value,
            })),
          ]}
        />
      </div>

      {/* Layer visibility is controlled independently from the search filters. */}
      <div className="border-t border-border/35 pt-3">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground">
          الفئات الظاهرة
        </p>

        <div className="grid gap-2">
          {mapLayerConfigs.map((layer) => (
            <Checkbox
              key={layer.key}
              checked={layers.has(layer.key)}
              onCheckedChange={(value) =>
                onLayer(layer.key, value === true)
              }
              label={layer.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}