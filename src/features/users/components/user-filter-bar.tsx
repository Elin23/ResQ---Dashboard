import { RotateCcw } from 'lucide-react';
import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';
import { accountStatusLabels, verificationLabels } from '../constants';
import { userAccountStatuses, userVerificationStatuses, type UserFilters } from '../types';

const accountStatusOptions = [
  { value: 'ALL', label: 'كل حالات الحساب' },
  ...userAccountStatuses.map((value) => ({
    value,
    label: accountStatusLabels[value],
  })),
];

const verificationOptions = [
  { value: 'ALL', label: 'كل حالات التوثيق' },
  ...userVerificationStatuses.map((value) => ({
    value,
    label: verificationLabels[value],
  })),
];

export function UserFilterBar({ filters, onChange, onClear, active }: { filters: UserFilters; governorates: string[]; onChange: (patch: Partial<UserFilters>) => void; onClear: () => void; active: boolean }) {
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

      <label className="min-w-[165px]">
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

      <label className="min-w-[165px]">
        <span className="sr-only">حالة التوثيق</span>
        <Select
          value={filters.verificationStatus ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              verificationStatus: value === 'ALL' ? undefined : (value as UserFilters['verificationStatus']),
              page: 1,
            })
          }
          options={verificationOptions}
        />
      </label>

      {/* Only show the reset action when at least one filter is active. */}
      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-3 text-[12px] font-normal text-muted-foreground hover:bg-primary/[0.04] hover:text-primary"
          onClick={onClear}
        >
          <RotateCcw className="size-4" strokeWidth={1.7} />
          مسح الفلاتر
        </Button>
      )}
    </FilterBar>
  );
}