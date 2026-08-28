import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { organizationStatuses, organizationVerificationStatuses, type OrganizationFilters } from '../types';

const statusLabels = {
  PENDING_VERIFICATION: 'تنتظر التحقق',
  ACTIVE: 'فعالة',
  SUSPENDED: 'معلقة',
  REJECTED: 'مرفوضة',
};

const verificationLabels = {
  NOT_REVIEWED: 'لم تُراجع',
  IN_REVIEW: 'قيد المراجعة',
  VERIFIED: 'تم التحقق',
  REJECTED: 'مرفوضة',
  MORE_INFO_REQUIRED: 'معلومات إضافية',
};

export function OrganizationFilterBar({ filters, onChange, onClear, active }: { filters: OrganizationFilters; onChange: (patch: Partial<OrganizationFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      <DebouncedSearchInput
        aria-label="البحث في الجمعيات"
        value={filters.search}
        onValueChange={(value) => onChange({ search: value, page: 1 })}
        placeholder="رقم الجمعية، الاسم، الترخيص أو الممثل…"
        className="min-w-0 flex-1 sm:min-w-72"
      />

      <div className="w-full sm:w-auto sm:min-w-[170px]">
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status: value === 'ALL' ? undefined : (value as OrganizationFilters['status']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الحالات' },
            ...organizationStatuses.map((value) => ({ value, label: statusLabels[value] })),
          ]}
        />
      </div>

      <div className="w-full sm:w-auto sm:min-w-[180px]">
        <Select
          value={filters.verificationStatus ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              verificationStatus: value === 'ALL' ? undefined : (value as OrganizationFilters['verificationStatus']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل حالات التحقق' },
            ...organizationVerificationStatuses.map((value) => ({ value, label: verificationLabels[value] })),
          ]}
        />
      </div>

      {/* Secondary organization filters remain supported by URLs without crowding the primary toolbar. */}
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
