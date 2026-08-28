import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { feedingPointStatusLabels } from '../constants';
import { feedingPointStatuses, type FeedingPointFilters, type FeedingPointStatus } from '../types';

export function FeedingPointFilterBar({ filters, onChange, onClear, active }: { filters: FeedingPointFilters; onChange: (patch: Partial<FeedingPointFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      {/* Grid sizing keeps list/map filters inside their parent on every breakpoint. */}
      <div className="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,1fr)_minmax(0,12rem)_minmax(0,12rem)_auto] xl:items-center">
        <label className="min-w-0 sm:col-span-2 xl:col-span-1">
          <span className="sr-only">البحث في نقاط الإطعام</span>
          <DebouncedSearchInput
            className="w-full min-w-0"
            value={filters.search}
            onValueChange={(value) => onChange({ search: value, page: 1 })}
            placeholder="اسم النقطة، رقمها أو الموقع…"
          />
        </label>

        <div className="min-w-0">
          <Select
            className="w-full"
            value={filters.status ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                status: value === 'ALL' ? undefined : (value as FeedingPointStatus),
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل حالات النقاط' },
              ...feedingPointStatuses.map((value) => ({ value, label: feedingPointStatusLabels[value] })),
            ]}
          />
        </div>

        <div className="min-w-0">
          <Select
            className="w-full"
            value={filters.pendingRefills === undefined ? 'ALL' : filters.pendingRefills ? 'YES' : 'NO'}
            onValueChange={(value) =>
              onChange({
                pendingRefills: value === 'ALL' ? undefined : value === 'YES',
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل التعبئات' },
              { value: 'YES', label: 'تنتظر التحقق' },
              { value: 'NO', label: 'دون تعبئات معلقة' },
            ]}
          />
        </div>

        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-full min-w-0 rounded-xl px-3 text-[12px] font-medium text-muted-foreground hover:bg-primary/[0.04] hover:text-primary sm:w-auto xl:shrink-0"
            onClick={onClear}
          >
            <RotateCcw className="size-4" strokeWidth={1.7} />
            مسح
          </Button>
        )}
      </div>
    </FilterBar>
  );
}
