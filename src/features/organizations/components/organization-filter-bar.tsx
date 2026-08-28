import { Button, DebouncedSearchInput, FilterBar, Input, Select } from '@/components/ui';
import { organizationServiceLabels } from '../constants';
import { organizationServiceKeys, organizationStatuses, organizationVerificationStatuses, type OrganizationFilters } from '../types';

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

export function OrganizationFilterBar({ filters, governorates, onChange, onClear, active }: { filters: OrganizationFilters; governorates: string[]; onChange: (patch: Partial<OrganizationFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      <DebouncedSearchInput
        aria-label="البحث في الجمعيات"
        value={filters.search}
        onValueChange={(value) =>
          onChange({
            search: value,
            page: 1,
          })
        }
        placeholder="رقم الجمعية، الاسم، الترخيص، الممثل…"
        className="min-w-64 flex-1"
      />

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
          ...organizationStatuses.map((value) => ({
            value,
            label: statusLabels[value],
          })),
        ]}
      />

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
          ...organizationVerificationStatuses.map((value) => ({
            value,
            label: verificationLabels[value],
          })),
        ]}
      />

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
        value={filters.service ?? 'ALL'}
        onValueChange={(value) =>
          onChange({
            service: value === 'ALL' ? undefined : (value as OrganizationFilters['service']),
            page: 1,
          })
        }
        options={[
          { value: 'ALL', label: 'كل الخدمات' },
          ...organizationServiceKeys.map((value) => ({
            value,
            label: organizationServiceLabels[value],
          })),
        ]}
      />

      <Select
        value={filters.activeReports ?? 'ALL'}
        onValueChange={(value) =>
          onChange({
            activeReports: value === 'ALL' ? undefined : (value as OrganizationFilters['activeReports']),
            page: 1,
          })
        }
        options={[
          { value: 'ALL', label: 'كل حالات البلاغات' },
          { value: 'YES', label: 'لديها بلاغات نشطة' },
          { value: 'NO', label: 'دون بلاغات نشطة' },
        ]}
      />

      {/* Date filters always reset the list to the first page. */}
      <label className="text-xs text-muted-foreground">
        من
        <Input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) =>
            onChange({
              dateFrom: event.target.value || undefined,
              page: 1,
            })
          }
        />
      </label>

      <label className="text-xs text-muted-foreground">
        إلى
        <Input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) =>
            onChange({
              dateTo: event.target.value || undefined,
              page: 1,
            })
          }
        />
      </label>

      {active && (
        <Button variant="ghost" onClick={onClear}>
          مسح الفلاتر
        </Button>
      )}
    </FilterBar>
  );
}