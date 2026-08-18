import { Input, Select } from '@/components/ui';
import { governorates } from '@/features/reports/constants';
import { adoptionAnimalSpecies, type AdoptionAnimalSpecies } from '@/features/adoption-requests/types';
import { adoptionAnimalSpeciesLabels } from '@/features/adoption-requests/constants';
import { organizationFixtures } from '@/features/organizations/services/organization-fixtures';
import { analyticsRangeOptions } from '../constants';
import type { AnalyticsFilters, AnalyticsRangePreset, ManagementReportKey } from '../types';

export function AnalyticsFilterPanel({ filters, onChange, context, reportKey }: {
  filters: AnalyticsFilters;
  onChange: (patch: Partial<AnalyticsFilters>) => void;
  context: 'reports' | 'analytics';
  reportKey?: ManagementReportKey;
}) {
  const showGovernorate = context === 'analytics' || reportKey === 'reports' || reportKey === 'rescue' || reportKey === 'organizations';
  const showOrganization = context === 'analytics' || reportKey === 'rescue' || reportKey === 'adoption' || reportKey === 'donations';
  const showSpecies = reportKey === 'reports' || reportKey === 'adoption';

  return <div dir="rtl" className="flex flex-wrap items-end justify-start gap-2 rounded-xl border border-border/45 bg-white p-3 print:hidden">
    <label className="min-w-[150px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">الفترة</span><Select value={filters.range} onValueChange={(value) => onChange({ range: value as AnalyticsRangePreset })} options={analyticsRangeOptions} /></label>
    {filters.range === 'custom' && <><label className="min-w-[145px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">من</span><Input className="h-9 rounded-xl text-[12px]" type="date" value={filters.from} onChange={(event) => onChange({ from: event.target.value })} /></label><label className="min-w-[145px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">إلى</span><Input className="h-9 rounded-xl text-[12px]" type="date" value={filters.to} onChange={(event) => onChange({ to: event.target.value })} /></label></>}
    {showGovernorate && <label className="min-w-[160px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">المحافظة</span><Select value={filters.governorate ?? 'ALL'} onValueChange={(value) => onChange({ governorate: value === 'ALL' ? undefined : value })} options={[{ value: 'ALL', label: 'كل المحافظات' }, ...governorates.map((value) => ({ value, label: value }))]} /></label>}
    {showOrganization && <label className="min-w-[180px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">الجمعية</span><Select value={filters.organizationId ?? 'ALL'} onValueChange={(value) => onChange({ organizationId: value === 'ALL' ? undefined : value })} options={[{ value: 'ALL', label: 'كل الجمعيات' }, ...organizationFixtures.filter((item) => item.status === 'ACTIVE').map((item) => ({ value: item.id, label: item.name }))]} /></label>}
    {showSpecies && <label className="min-w-[150px]"><span className="mb-1 block text-[11px] font-normal text-muted-foreground">نوع الحيوان</span><Select value={filters.species ?? 'ALL'} onValueChange={(value) => onChange({ species: value === 'ALL' ? undefined : value as AdoptionAnimalSpecies })} options={[{ value: 'ALL', label: 'كل الأنواع' }, ...adoptionAnimalSpecies.map((value) => ({ value, label: adoptionAnimalSpeciesLabels[value] }))]} /></label>}
  </div>;
}
