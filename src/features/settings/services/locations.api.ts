import { apiClient } from '@/services/api/client';
import type { GovernorateRecord, LocationCatalog, RegionRecord } from '../types';

type JsonRecord = Record<string, unknown>;
const rec = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (...values: unknown[]): string | undefined => values.find((value) => typeof value === 'string' && value.trim()) as string | undefined;
const ident = (...values: unknown[]): string => String(values.find((value) => value !== undefined && value !== null && String(value).trim()) ?? '');
const bool = (...values: unknown[]): boolean | undefined => values.find((value) => typeof value === 'boolean') as boolean | undefined;
const now = () => new Date().toISOString();
const unwrap = (payload: unknown): unknown => {
  const root = rec(payload);
  return root.data ?? root.result ?? root.value ?? payload;
};

function governorate(value: unknown): GovernorateRecord {
  const row = rec(value);
  const createdAt = str(row.createdAt, row.creationTime) ?? now();
  return {
    id: ident(row.id, row.governorateId),
    name: str(row.name, row.nameAr, row.label) ?? '',
    nameEn: str(row.nameEn),
    isActive: bool(row.isActive, row.active) ?? true,
    createdAt,
    updatedAt: str(row.updatedAt, row.lastModificationTime) ?? createdAt,
  };
}

function region(value: unknown): RegionRecord {
  const row = rec(value);
  const createdAt = str(row.createdAt, row.creationTime) ?? now();
  return {
    id: ident(row.id, row.regionId, row.areaId),
    governorateId: ident(row.governorateId, rec(row.governorate).id),
    name: str(row.name, row.nameAr, row.label) ?? '',
    nameEn: str(row.nameEn),
    isActive: bool(row.isActive, row.active) ?? true,
    createdAt,
    updatedAt: str(row.updatedAt, row.lastModificationTime) ?? createdAt,
  };
}

function normalizeCatalog(payload: unknown, includeInactive: boolean): LocationCatalog {
  const raw = unwrap(payload);
  const body = rec(raw);

  // The dashboard endpoint returns an array of governorates with nested `regions`.
  // Older adapters only handled a flat object, which caused selected regions to lose
  // their governorate id and made the map form reject valid approved areas.
  const rawGovernorates = Array.isArray(raw)
    ? raw
    : arr(body.governorates ?? body.governorateList ?? body.items);

  const governorates = rawGovernorates.map(governorate);

  const nestedRegions = rawGovernorates.flatMap((entry) => {
    const gov = rec(entry);
    const governorateId = ident(gov.id, gov.governorateId);
    return arr(gov.regions ?? gov.areas).map((value) => ({
      ...rec(value),
      governorateId: ident(rec(value).governorateId, governorateId),
    }));
  });

  const flatRegions = arr(body.regions ?? body.areas ?? body.areaList);
  const regions = [...flatRegions, ...nestedRegions]
    .map(region)
    .filter((item, index, all) => item.id && all.findIndex((other) => other.id === item.id) === index);

  return {
    governorates: includeInactive ? governorates : governorates.filter((item) => item.isActive),
    regions: includeInactive ? regions : regions.filter((item) => item.isActive),
  };
}

export async function getLocationCatalog(options?: { includeInactive?: boolean; signal?: AbortSignal }): Promise<LocationCatalog> {
  const includeInactive = options?.includeInactive ?? false;
  const suffix = includeInactive ? '?includeInactive=true' : '';
  const payload = await apiClient.get<unknown>(`/api/dashboard/locations${suffix}`, options?.signal);
  return normalizeCatalog(payload, includeInactive);
}

export async function addGovernorate(name: string) {
  return apiClient.post('/api/dashboard/locations/governorates', { name, nameEn: '', isActive: true });
}

export async function updateGovernorate(id: string, patch: { name?: string; isActive?: boolean }) {
  const catalog = await getLocationCatalog({ includeInactive: true });
  const current = catalog.governorates.find((item) => item.id === id);
  if (!current) throw new Error('المحافظة غير موجودة أو تم حذفها.');
  return apiClient.patch(`/api/dashboard/locations/governorates/${encodeURIComponent(id)}`, {
    name: patch.name ?? current.name,
    nameEn: current.nameEn ?? null,
    isActive: patch.isActive ?? current.isActive,
  });
}


export async function addRegion(input: { governorateId: string; name: string }) {
  return apiClient.post('/api/dashboard/locations/regions', { governorateId: Number(input.governorateId), name: input.name, nameEn: '', isActive: true });
}

export async function updateRegion(id: string, patch: { governorateId?: string; name?: string; isActive?: boolean }) {
  const catalog = await getLocationCatalog({ includeInactive: true });
  const current = catalog.regions.find((item) => item.id === id);
  if (!current) throw new Error('المنطقة غير موجودة أو تم حذفها.');
  return apiClient.patch(`/api/dashboard/locations/regions/${encodeURIComponent(id)}`, {
    governorateId: Number(patch.governorateId ?? current.governorateId),
    name: patch.name ?? current.name,
    nameEn: current.nameEn ?? null,
    isActive: patch.isActive ?? current.isActive,
  });
}
