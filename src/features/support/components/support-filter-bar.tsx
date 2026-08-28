import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { supportPriorityLabels, supportStatusLabels } from '../constants';
import { supportTicketPriorities, supportTicketStatuses, type SupportFilters } from '../types';

export function SupportFilterBar({ filters, onChange, onClear, active }: { filters: SupportFilters; onChange: (patch: Partial<SupportFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <div className="space-y-2">
      <FilterBar>
        <DebouncedSearchInput
          value={filters.search}
          onValueChange={(value) => onChange({ search: value, page: 1 })}
          placeholder="رقم الطلب، الموضوع أو مقدم الطلب…"
          className="min-w-0 flex-1 sm:min-w-72"
        />

        <div className="w-full sm:w-auto sm:min-w-[170px]">
          <Select
            value={filters.status ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                status: value === 'ALL' ? undefined : (value as SupportFilters['status']),
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل الحالات' },
              ...supportTicketStatuses.map((value) => ({ value, label: supportStatusLabels[value] })),
            ]}
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[165px]">
          <Select
            value={filters.priority ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                priority: value === 'ALL' ? undefined : (value as SupportFilters['priority']),
                page: 1,
              })
            }
            options={[
              { value: 'ALL', label: 'كل الأولويات' },
              ...supportTicketPriorities.map((value) => ({ value, label: supportPriorityLabels[value] })),
            ]}
          />
        </div>

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

      {/* Quick queue shortcuts stay separate from the primary filters. */}
      <div className="flex flex-wrap gap-2 px-0.5">
        <Button
          size="sm"
          variant={filters.unassigned ? 'primary' : 'secondary'}
          className="h-8 rounded-lg px-3 text-[12px]"
          onClick={() =>
            onChange({
              unassigned: filters.unassigned ? undefined : true,
              assignee: undefined,
              page: 1,
            })
          }
        >
          غير مسندة
        </Button>

        <Button
          size="sm"
          variant={filters.assignee === 'me' ? 'primary' : 'secondary'}
          className="h-8 rounded-lg px-3 text-[12px]"
          onClick={() =>
            onChange({
              assignee: filters.assignee === 'me' ? undefined : 'me',
              unassigned: undefined,
              page: 1,
            })
          }
        >
          مسندة إليّ
        </Button>

        <Button
          size="sm"
          variant={filters.waiting === 'INTERNAL' ? 'primary' : 'secondary'}
          className="h-8 rounded-lg px-3 text-[12px]"
          onClick={() =>
            onChange({
              waiting: filters.waiting === 'INTERNAL' ? undefined : 'INTERNAL',
              page: 1,
            })
          }
        >
          بانتظار إجراء داخلي
        </Button>
      </div>
    </div>
  );
}
