import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { articleCategoryOptions, contentStatusOptions } from '../constants';
import type { ContentListFilters } from '../types';

export function ContentFilterBar({ filters, onChange, articles = false }: { filters: ContentListFilters; onChange: (patch: Partial<ContentListFilters>) => void; articles?: boolean }) {
  const active = Boolean(
    filters.search ||
      filters.status ||
      filters.category ||
      filters.author ||
      filters.tag ||
      filters.dateFrom ||
      filters.dateTo,
  );

  return (
    <FilterBar>
      <DebouncedSearchInput
        aria-label="البحث في المحتوى"
        placeholder="العنوان، الرقم أو الرابط المختصر…"
        value={filters.search}
        onValueChange={(value) => onChange({ search: value, page: 1 })}
        className="min-w-0 flex-1 sm:min-w-72"
      />

      <div className="w-full sm:w-auto sm:min-w-[170px]">
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status: value === 'ALL' ? undefined : (value as ContentListFilters['status']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الحالات' },
            ...contentStatusOptions,
          ]}
        />
      </div>

      {articles && (
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <Select
            value={filters.category ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                category: value === 'ALL' ? undefined : value,
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل التصنيفات' },
              ...articleCategoryOptions,
            ]}
          />
        </div>
      )}

      {/* Content filters stay limited to publishing state and article category. */}
      {active && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 rounded-xl px-3 text-[12px] font-medium text-muted-foreground hover:bg-primary/[0.04] hover:text-primary"
          onClick={() =>
            onChange({
              search: '',
              status: undefined,
              category: undefined,
              author: undefined,
              tag: undefined,
              dateFrom: undefined,
              dateTo: undefined,
              page: 1,
            })
          }
        >
          <RotateCcw className="size-4" strokeWidth={1.7} />
          مسح
        </Button>
      )}
    </FilterBar>
  );
}
