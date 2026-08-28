import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { animalTypeLabels, reportStatusLabels } from '../constants';
import type { AnimalType, ReportFilters, ReportStatus } from '../types';

const statusOptions = [
  { value: 'ALL', label: 'كل الحالات' },
  ...Object.entries(reportStatusLabels).map(([value, label]) => ({ value, label })),
];

const animalOptions = [
  { value: 'ALL', label: 'كل الحيوانات' },
  ...Object.entries(animalTypeLabels).map(([value, label]) => ({ value, label })),
];

export function ReportsFilterBar({ filters, onChange, onClear, active }: { filters: ReportFilters; onChange: (patch: Partial<ReportFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      <label className="min-w-0 flex-1 sm:min-w-72">
        <span className="sr-only">البحث في البلاغات</span>
        <DebouncedSearchInput
          value={filters.search}
          onValueChange={(value) => onChange({ search: value, page: 1 })}
          placeholder="رقم البلاغ، الحيوان أو الموقع…"
        />
      </label>

      <label className="w-full sm:w-auto sm:min-w-[170px]">
        <span className="sr-only">الحالة</span>
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status: value === 'ALL' ? undefined : (value as ReportStatus),
              page: 1,
            })
          }
          options={statusOptions}
        />
      </label>

      <label className="w-full sm:w-auto sm:min-w-[165px]">
        <span className="sr-only">نوع الحيوان</span>
        <Select
          value={filters.animalType ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              animalType: value === 'ALL' ? undefined : (value as AnimalType),
              page: 1,
            })
          }
          options={animalOptions}
        />
      </label>

      {/* Report filtering stays intentionally compact for faster operational scanning. */}
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
