import { RotateCcw } from 'lucide-react';

import { Button, DebouncedSearchInput, FilterBar, Select } from '@/components/ui';

import { notificationChannelLabels, notificationStatusLabels } from '../constants';
import { notificationChannels, notificationDeliveryStatuses, type BroadcastFilters } from '../types';

export function NotificationFilterBar({ filters, onChange, onClear, active }: { filters: BroadcastFilters; onChange: (patch: Partial<BroadcastFilters>) => void; onClear: () => void; active: boolean }) {
  return (
    <FilterBar>
      <DebouncedSearchInput
        aria-label="البحث في الإشعارات"
        placeholder="رقم الإشعار، العنوان أو النص…"
        value={filters.search}
        onValueChange={(value) => onChange({ search: value, page: 1 })}
        className="min-w-0 flex-1 sm:min-w-72"
      />

      <div className="w-full sm:w-auto sm:min-w-[170px]">
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status: value === 'ALL' ? undefined : (value as BroadcastFilters['status']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل الحالات' },
            ...notificationDeliveryStatuses.map((value) => ({ value, label: notificationStatusLabels[value] })),
          ]}
        />
      </div>

      <div className="w-full sm:w-auto sm:min-w-[160px]">
        <Select
          value={filters.channel ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              channel: value === 'ALL' ? undefined : (value as BroadcastFilters['channel']),
              page: 1,
            })
          }
          options={[
            { value: 'ALL', label: 'كل القنوات' },
            ...notificationChannels.map((value) => ({ value, label: notificationChannelLabels[value] })),
          ]}
        />
      </div>

      {/* Broadcast filters stay compact so the queue remains easy to scan. */}
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
