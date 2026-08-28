import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button, DebouncedSearchInput, FilterBar, Select,} from '@/components/ui';

import { adoptionAnimalSpecies, adoptionPublisherTypes, adoptionRequestStatuses, type AdoptionRequestFilters,} from '../types';

import {adoptionAnimalSpeciesLabels,adoptionPublisherTypeLabels,adoptionStatusLabels,} from '../constants';

export function AdoptionFilterBar({ filters, organizations, onChange, onClear, active,
}: {
  filters: AdoptionRequestFilters;
  organizations: Array<{
    id: string;
    name: string;
  }>;
  onChange: (patch: Partial<AdoptionRequestFilters>) => void;
  onClear: () => void;
  active: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="space-y-2">
      <FilterBar>
        <DebouncedSearchInput
          aria-label="البحث في عروض التبني"
          placeholder="رقم العرض، الحيوان، الناشر أو الموقع…"
          value={filters.search}
          onValueChange={(value) =>
            onChange({
              search: value,
              page: 1,
            })
          }
          className="min-w-64 flex-1"
        />

        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              status:
                value === 'ALL'
                  ? undefined
                  : (value as AdoptionRequestFilters['status']),
              page: 1,
            })
          }
          options={[
            {
              value: 'ALL',
              label: 'كل الحالات',
            },
            ...adoptionRequestStatuses.map((value) => ({
              value,
              label: adoptionStatusLabels[value],
            })),
          ]}
        />

        <Select
          value={filters.publisherType ?? 'ALL'}
          onValueChange={(value) =>
            onChange({
              publisherType:
                value === 'ALL'
                  ? undefined
                  : (value as AdoptionRequestFilters['publisherType']),
              organizationId: undefined,
              page: 1,
            })
          }
          options={[
            {
              value: 'ALL',
              label: 'كل الناشرين',
            },
            ...adoptionPublisherTypes.map((value) => ({
              value,
              label: adoptionPublisherTypeLabels[value],
            })),
          ]}
        />

        <Button
          variant="secondary"
          size="sm"
          className="h-9 rounded-xl"
          onClick={() =>
            setMoreOpen((current) => !current)
          }
        >
          <SlidersHorizontal className="size-4" />
          {moreOpen ? 'إخفاء' : 'فلاتر إضافية'}
        </Button>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl"
            onClick={onClear}
          >
            <RotateCcw className="size-4" />
            مسح
          </Button>
        )}
      </FilterBar>

      {moreOpen && (
        <div className="grid gap-2 rounded-xl border border-border/45 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            value={filters.species ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                species:
                  value === 'ALL'
                    ? undefined
                    : (value as AdoptionRequestFilters['species']),
                page: 1,
              })
            }
            options={[
              {
                value: 'ALL',
                label: 'كل الحيوانات',
              },
              ...adoptionAnimalSpecies.map((value) => ({
                value,
                label: adoptionAnimalSpeciesLabels[value],
              })),
            ]}
          />

          <Select
            value={filters.organizationId ?? 'ALL'}
            onValueChange={(value) =>
              onChange({
                organizationId:
                  value === 'ALL'
                    ? undefined
                    : value,

                // Choosing an organization means the publisher must be an organization.
                publisherType:
                  value === 'ALL'
                    ? filters.publisherType
                    : 'ORGANIZATION',

                page: 1,
              })
            }
            options={[
              {
                value: 'ALL',
                label: 'كل الجمعيات',
              },
              ...organizations.map((organization) => ({
                value: organization.id,
                label: organization.name,
              })),
            ]}
          />
        </div>
      )}
    </div>
  );
}