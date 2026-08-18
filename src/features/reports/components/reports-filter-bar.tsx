import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';
import type { AnimalType, ReportFilters, ReportStatus } from '../types';
import { animalTypeLabels, governorates, reportStatusLabels } from '../constants';

const statusOptions = [
  { value: 'ALL', label: 'كل الحالات' },
  ...Object.entries(reportStatusLabels).map(([value, label]) => ({ value, label })),
];

const animalOptions = [
  { value: 'ALL', label: 'كل الحيوانات' },
  ...Object.entries(animalTypeLabels).map(([value, label]) => ({ value, label })),
];

const governorateOptions = [
  { value: 'ALL', label: 'كل المحافظات' },
  ...governorates.map((value) => ({ value, label: value })),
];

export function ReportsFilterBar({
  filters,
  organizations,
  onChange,
  onClear,
  active,
}: {
  filters: ReportFilters;
  organizations: Array<{ id: string; name: string }>;
  onChange: (patch: Partial<ReportFilters>) => void;
  onClear: () => void;
  active: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div>
      <FilterBar>
        <label className="min-w-[240px] flex-1">
          <span className="sr-only">البحث في البلاغات</span>
          <DebouncedSearchInput
            value={filters.search}
            onValueChange={(value) => onChange({ search: value, page: 1 })}
            placeholder="رقم البلاغ، الحيوان، الموقع…"
          />
        </label>

        <label>
          <span className="sr-only">الحالة</span>
          <Select
            value={filters.status ?? 'ALL'}
            onValueChange={(value) =>
              onChange({ status: value === 'ALL' ? undefined : (value as ReportStatus), page: 1 })
            }
            options={statusOptions}
          />
        </label>

        <label>
          <span className="sr-only">نوع الحيوان</span>
          <Select
            value={filters.animalType ?? 'ALL'}
            onValueChange={(value) =>
              onChange({ animalType: value === 'ALL' ? undefined : (value as AnimalType), page: 1 })
            }
            options={animalOptions}
          />
        </label>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 rounded-xl px-3 text-[12px] font-medium"
          onClick={() => setMoreOpen((current) => !current)}
          aria-expanded={moreOpen}
        >
          <SlidersHorizontal className="size-4" />
          فلاتر إضافية
        </Button>

        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-3 text-[12px] font-medium"
            onClick={onClear}
          >
            <RotateCcw className="size-4" />
            مسح
          </Button>
        )}
      </FilterBar>

      {moreOpen && (
        <div className="mt-2 grid gap-2 border-t border-border/35 pt-2 sm:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="sr-only">المحافظة</span>
            <Select
              value={filters.governorate ?? 'ALL'}
              onValueChange={(value) =>
                onChange({ governorate: value === 'ALL' ? undefined : value, page: 1 })
              }
              options={governorateOptions}
            />
          </label>

          <label>
            <span className="sr-only">الجمعية</span>
            <Select
              value={filters.organizationId ?? 'ALL'}
              onValueChange={(value) =>
                onChange({ organizationId: value === 'ALL' ? undefined : value, page: 1 })
              }
              options={[
                { value: 'ALL', label: 'كل الجمعيات' },
                { value: 'UNASSIGNED', label: 'بدون جمعية' },
                ...organizations.map((organization) => ({
                  value: organization.id,
                  label: organization.name,
                })),
              ]}
            />
          </label>
        </div>
      )}
    </div>
  );
}
