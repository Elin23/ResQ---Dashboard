import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { accountStatusLabels } from '../constants';
import { userAccountStatuses, type UserFilters } from '../types';

const accountStatusOptions = [
  { value: 'ALL', label: 'كل حالات الحساب' },
  ...userAccountStatuses.map((value) => ({
    value,
    label: accountStatusLabels[value],
  })),
];



export function UserFilterBar({ filters, onChange, onClear, active }: { filters: UserFilters; onChange: (patch: Partial<UserFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      <label className="min-w-0 flex-1 sm:min-w-72">
        <span className="sr-only">البحث في المستخدمين</span>
        <DebouncedSearchInput
          value={filters.search}
          onValueChange={(value) => onChange({ search: value, page: 1 })}
          placeholder="الاسم، رقم المستخدم، الهاتف أو البريد…"
        />
      </label>

      <label className="w-full sm:w-auto sm:min-w-[170px]">
        <span className="sr-only">حالة الحساب</span>
        <Select
          value={filters.accountStatus ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              accountStatus: value === 'ALL' ? undefined : (value as UserFilters['accountStatus']),
              page: 1,
            })
          }
          options={accountStatusOptions}
        />
      </label>


      {/* Keep the users queue focused on the three filters used most often. */}
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
