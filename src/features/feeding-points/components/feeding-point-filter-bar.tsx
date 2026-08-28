import { useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';
import { creatorTypeLabels, feedingPointStatusLabels } from '../constants';
import { feedingPointCreatorTypes, feedingPointStatuses, type FeedingPointCreatorType, type FeedingPointFilters, type FeedingPointStatus } from '../types';

export function FeedingPointFilterBar({ filters, governorates, onChange, onClear, active }: { filters: FeedingPointFilters; governorates: string[]; onChange: (patch: Partial<FeedingPointFilters>) => void; onClear: () => void; active: boolean }) {
  const [moreOpen, setMoreOpen] = useState(false);

  // Keep the most common filters visible and move the optional ones below.
  return (
    <div className="space-y-2">
      <FilterBar>
        <label className="min-w-56 flex-1">
          <span className="sr-only">البحث</span>
          <DebouncedSearchInput
            value={filters.search}
            onValueChange={(value) => onChange({ search: value, page: 1 })}
            placeholder="اسم النقطة، رقمها أو الموقع…"
          />
        </label>

        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status: value === 'ALL' ? undefined : (value as FeedingPointStatus),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل حالات النقاط' },
            ...feedingPointStatuses.map((value) => ({
              value,
              label: feedingPointStatusLabels[value],
            })),
          ]}
        />

        <Select
          value={
            filters.pendingRefills === undefined
              ? 'ALL'
              : filters.pendingRefills
                ? 'YES'
                : 'NO'
          }
          onValueChange={(value) =>
            onChange({
              pendingRefills: value === 'ALL' ? undefined : value === 'YES',
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل التعبئات' },
            { value: 'YES', label: 'تعبئات تنتظر التحقق' },
            { value: 'NO', label: 'دون تعبئات معلقة' },
          ]}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMoreOpen((value) => !value)}
        >
          <SlidersHorizontal className="size-4" />
          {moreOpen ? 'إخفاء المزيد' : 'فلاتر إضافية'}
        </Button>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            <RotateCcw className="size-4" />
            مسح
          </Button>
        )}
      </FilterBar>

      {moreOpen && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border/45 bg-white p-2.5">
          <Select
            value={filters.governorate ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                governorate: value === 'ALL' ? undefined : value,
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل المحافظات' },
              ...governorates.map((value) => ({
                value,
                label: value,
              })),
            ]}
          />

          <Select
            value={filters.creatorType ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                creatorType:
                  value === 'ALL'
                    ? undefined
                    : (value as FeedingPointCreatorType),
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل مقدمي الطلب' },
              ...feedingPointCreatorTypes.map((value) => ({
                value,
                label: creatorTypeLabels[value],
              })),
            ]}
          />

          <Select
            value={
              filters.hasOpenIssues === undefined
                ? 'ALL'
                : filters.hasOpenIssues
                  ? 'YES'
                  : 'NO'
            }
            onValueChange={(value) =>
              onChange({
                hasOpenIssues: value === 'ALL' ? undefined : value === 'YES',
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل حالات المشكلات' },
              { value: 'YES', label: 'مشكلات مفتوحة' },
              { value: 'NO', label: 'دون مشكلات' },
            ]}
          />
        </div>
      )}
    </div>
  );
}