import { Button, FilterBar, Input, Select } from '@/components/ui';

import { articleCategoryOptions, commonTags, contentStatusOptions } from '../constants';
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
      <Input
        aria-label="بحث"
        placeholder="بحث بالعنوان أو الرقم أو الرابط المختصر"
        value={filters.search}
        onChange={(event) =>
          onChange({
            search: event.target.value,
            page: 1,
          })
        }
        className="sm:max-w-xs"
      />

      <Select
        value={filters.status ?? 'ALL'}
        onValueChange={(value) =>
          onChange({
            status:
              value === 'ALL'
                ? undefined
                : (value as ContentListFilters['status']),
            page: 1,
          })
        }
        options={[
          { value: 'ALL', label: 'كل الحالات' },
          ...contentStatusOptions,
        ]}
      />

      {articles && (
        <>
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

          <Select
            value={filters.tag ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                tag: value === 'ALL' ? undefined : value,
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل الوسوم' },
              ...commonTags.map((value) => ({
                value,
                label: value,
              })),
            ]}
          />
        </>
      )}

      <Input
        aria-label="من تاريخ"
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={(event) =>
          onChange({
            dateFrom: event.target.value || undefined,
            page: 1,
          })
        }
        className="sm:w-auto"
      />

      <Input
        aria-label="إلى تاريخ"
        type="date"
        value={filters.dateTo ?? ''}
        onChange={(event) =>
          onChange({
            dateTo: event.target.value || undefined,
            page: 1,
          })
        }
        className="sm:w-auto"
      />

      {active && (
        <Button
          variant="ghost"
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
          مسح الفلاتر
        </Button>
      )}
    </FilterBar>
  );
}