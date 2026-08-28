import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { adoptionPublisherTypeLabels, adoptionStatusLabels } from '../constants';
import { adoptionPublisherTypes, adoptionRequestStatuses, type AdoptionRequestFilters } from '../types';

export function AdoptionFilterBar({ filters, onChange, onClear, active }: { filters: AdoptionRequestFilters; onChange: (patch: Partial<AdoptionRequestFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      <DebouncedSearchInput
        aria-label="البحث في عروض التبني"
        placeholder="رقم العرض، الحيوان، الناشر أو الموقع…"
        value={filters.search}
        onValueChange={(value) => onChange({ search: value, page: 1 })}
        className="min-w-0 flex-1 sm:min-w-72"
      />

      <div className="w-full sm:w-auto sm:min-w-[180px]">
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status: value === 'ALL' ? undefined : (value as AdoptionRequestFilters['status']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الحالات' },
            ...adoptionRequestStatuses.map((value) => ({ value, label: adoptionStatusLabels[value] })),
          ]}
        />
      </div>

      <div className="w-full sm:w-auto sm:min-w-[165px]">
        <Select
          value={filters.publisherType ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              publisherType: value === 'ALL' ? undefined : (value as AdoptionRequestFilters['publisherType']),
              organizationId: undefined,
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الناشرين' },
            ...adoptionPublisherTypes.map((value) => ({ value, label: adoptionPublisherTypeLabels[value] })),
          ]}
        />
      </div>

      {/* Keep adoption review filters limited to the fields used during daily moderation. */}
      {active && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 rounded-xl px-3 text-[12px] font-medium text-muted-foreground hover:bg-primary/[0.04] hover:text-primary"
          onClick={onClear}
        >
          <RotateCcw className="size-4" strokeWidth={1.7} />
          مسح
        </Button>
      )}
    </FilterBar>
  );
}
