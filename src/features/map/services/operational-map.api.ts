import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type { CreateMapListingInput, MapDirectoryData, MapEntity, MapEntityType, MapListingRequest, MapListingReviewStatus, MapListingStatus } from '../types';

type JsonRecord = Record<string, unknown>;
const rec = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (...values: unknown[]): string | undefined => values.find((value) => typeof value === 'string' && value.trim()) as string | undefined;
const num = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};
const ident = (...values: unknown[]): string => String(values.find((value) => value !== null && value !== undefined && String(value).trim()) ?? '');
const iso = () => new Date().toISOString();
const unwrap = (payload: unknown): unknown => {
  const body = rec(payload);
  return body.data ?? body.result ?? body.value ?? payload;
};

function entityType(value: unknown): MapEntityType {
  const raw = String(value ?? '').trim().toUpperCase().replace(/[ -]+/g, '_');
  if (raw.includes('FEED')) return 'FEEDING_POINT';
  if (raw.includes('ORG') || raw.includes('ASSOCIATION') || raw.includes('SHELTER')) return 'ORGANIZATION';
  if (raw.includes('CLINIC') || raw.includes('CLINC') || raw.includes('VET')) return 'VET_CLINIC';
  if (raw.includes('PHARM') || raw.includes('MEDICALWAREHOUSE') || raw.includes('MEDICAL_WAREHOUSE')) return 'ANIMAL_PHARMACY';
  if (raw.includes('HOTEL')) return 'CAT_HOTEL';
  if (raw.includes('CAFE')) return 'CAT_CAFE';
  if (raw.includes('ZOO')) return 'ZOO';
  return 'PET_SUPPLIES';
}
function reviewStatus(value: unknown): MapListingReviewStatus {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('REJECT') || raw === '3') return 'REJECTED';
  if (raw.includes('APPROV') || raw.includes('PUBLISH') || raw.includes('ACTIVE') || raw === '2') return 'APPROVED';
  return 'PENDING';
}
function listingStatus(value: unknown): MapListingStatus {
  if (value === false) return 'INACTIVE';
  if (value === true) return 'ACTIVE';
  const raw = String(value ?? '').toUpperCase();
  return raw.includes('INACTIVE') || raw.includes('NOTACTIVE') || raw.includes('DISABL') || raw.includes('PAUSE') || raw === '0' || raw === '3' ? 'INACTIVE' : 'ACTIVE';
}

function sourceOf(item: JsonRecord, type: MapEntityType) {
  const raw = String(item.source ?? item.listingSource ?? item.sourceType ?? '').toUpperCase();

  // Explicit request provenance must win over the place type. A request can itself
  // be for an organization or feeding point, and classifying by `type` first hid
  // those records from the dashboard review queue.
  if (raw.includes('PLACE_REQUEST') || raw.includes('REQUEST') || raw.includes('USER')) return 'USER_REQUEST' as const;
  if (raw.includes('ORGANIZATION_AUTO')) return 'ORGANIZATION_AUTO' as const;
  if (raw.includes('FEEDING_POINT_AUTO')) return 'FEEDING_POINT_AUTO' as const;
  if (raw.includes('FOOD_POINT')) return 'FEEDING_POINT_AUTO' as const;
  if (raw === 'PLACE' || raw === 'ADMIN') return 'ADMIN' as const;

  if (item.requesterId) return 'USER_REQUEST' as const;
  if (type === 'ORGANIZATION') return 'ORGANIZATION_AUTO' as const;
  if (type === 'FEEDING_POINT') return 'FEEDING_POINT_AUTO' as const;
  return 'ADMIN' as const;
}
function normalizeEntity(value: unknown): MapEntity {
  const item = rec(value);
  const location = rec(item.location);
  const governorate = rec(item.governorate ?? location.governorate);
  const area = rec(item.area ?? item.region ?? location.area ?? location.region);
  const owner = rec(item.owner ?? item.user ?? item.requester ?? item.organization);
  const type = entityType(item.type ?? item.placeType ?? item.entityType ?? item.category);
  const source = sourceOf(item, type);
  const sourceId = ident(item.sourceId, item.entityId, item.placeRequestId, item.placeId, item.listingId, item.id);
  const status = listingStatus(item.status ?? item.listingStatus ?? item.isActive);
  const review = source === 'USER_REQUEST'
    ? reviewStatus(
        item.reviewStatus ??
        item.approvalStatus ??
        item.requestStatus ??
        item.status ??
        (item.isApproved === true ? 'APPROVED' : undefined),
      )
    : (type === 'ORGANIZATION' || type === 'FEEDING_POINT')
      ? 'APPROVED'
      : reviewStatus(
          item.reviewStatus ??
          item.approvalStatus ??
          item.requestStatus ??
          (item.isApproved === true ? 'APPROVED' : undefined) ??
          item.status,
        );
  const openingTime = str(item.openingTime, item.openTime);
  const closingTime = str(item.closingTime, item.closeTime);
  return {
    id: ident(item.mapId, item.id, `${type}:${sourceId}`),
    sourceId,
    type,
    coordinates: {
      latitude: num(item.latitude, item.lat, location.latitude) ?? 0,
      longitude: num(item.longitude, item.lng, item.lon, location.longitude) ?? 0,
    },
    title: str(item.name, item.title, item.placeName, item.organizationName) ?? 'مكان',
    subtitle: str(item.subtitle, item.referenceNumber, item.code),
    governorate: str(item.governorateName, governorate.nameAr, governorate.name, location.governorateName) ?? '',
    city: str(item.areaName, item.regionName, area.nameAr, area.name, location.city),
    address: str(item.address, location.address) ?? '',
    updatedAt: str(item.updatedAt, item.lastModificationTime, item.createdAt, item.creationTime) ?? iso(),
    metadata: {
      source,
      reviewStatus: review,
      status,
      description: str(item.description, item.details),
      phone: str(item.phone, item.contactPhone, owner.phone, owner.phoneNumber),
      email: str(item.email, item.contactEmail, owner.email),
      website: str(item.website, item.websiteUrl),
      openingHours: str(item.openingHours) ?? (openingTime || closingTime ? `${openingTime ?? '—'} - ${closingTime ?? '—'}` : undefined),
      ownerName: str(item.ownerName, item.requesterName, owner.name, owner.fullName, owner.organizationName),
      ownerType: source === 'ADMIN' ? 'ADMIN' : source === 'ORGANIZATION_AUTO' ? 'ORGANIZATION' : source === 'FEEDING_POINT_AUTO' ? 'SYSTEM' : 'USER',
      imageUrl: resolveMediaUrl(str(item.imageUrl, item.coverImageUrl, item.photoUrl)) || undefined,
      rejectionReason: str(item.rejectionReason, item.rejectReason, item.reason),
      submittedAt: str(item.submittedAt, item.createdAt, item.creationTime),
    },
  };
}
function asRequest(entity: MapEntity): MapListingRequest {
  return {
    ...entity,
    metadata: {
      ...entity.metadata,
      source: 'USER_REQUEST',
      ownerType: 'USER',
      reviewStatus: entity.metadata.reviewStatus,
    },
  };
}
function normalizeDirectory(payload: unknown): MapDirectoryData {
  const raw = unwrap(payload);
  const body = rec(raw);
  const explicitEntities = arr(body.entities ?? body.items ?? body.listings ?? body.places);
  const explicitRequests = arr(body.requests ?? body.pendingRequests ?? body.listingRequests);
  const combined = explicitEntities.length ? explicitEntities.map(normalizeEntity) : arr(raw).map(normalizeEntity);
  const requestEntities = explicitRequests.map(normalizeEntity);

  const requests = [
    ...requestEntities,
    ...combined.filter((entity) => entity.metadata.source === 'USER_REQUEST' && entity.metadata.reviewStatus !== 'APPROVED'),
  ].map(asRequest);
  const requestIds = new Set(requests.map((item) => item.id));
  const entities = combined.filter((entity) => entity.metadata.reviewStatus === 'APPROVED' && entity.metadata.source !== 'USER_REQUEST' && !requestIds.has(entity.id));

  return {
    entities,
    requests,
    generatedAt: str(body.generatedAt, body.updatedAt) ?? iso(),
  };
}

export async function getOperationalMapData(signal?: AbortSignal): Promise<MapDirectoryData> {
  return normalizeDirectory(await apiClient.get<unknown>('/api/dashboard/map/entities', signal));
}

function toTimeSpan(value?: string) {
  const clean = value?.trim();
  if (!clean) return undefined;
  return /^\d{1,2}:\d{2}$/.test(clean) ? `${clean}:00` : clean;
}
function parseHours(value?: string) {
  if (!value) return { openingTime: undefined, closingTime: undefined };
  const [openingTime, closingTime] = value.split(/\s*[-–—]\s*/u, 2);
  return { openingTime: toTimeSpan(openingTime), closingTime: toTimeSpan(closingTime) };
}

export async function createMapListing(input: CreateMapListingInput) {
  const hours = parseHours(input.openingHours);
  const payload = await apiClient.post<unknown>('/api/dashboard/map/listings', {
    placeType: input.type,
    governorateId: Number(input.governorateId),
    areaId: input.regionId ? Number(input.regionId) : 0,
    name: input.title,
    description: input.description ?? null,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    phone: input.phone?.trim() ?? '', 
    email: input.email ?? null,
    website: input.website ?? null,
    openingTime: hours.openingTime ?? null,
    closingTime: hours.closingTime ?? null,
  });
  const raw = unwrap(payload);
  return Object.keys(rec(raw)).length ? normalizeEntity(raw) : undefined;
}
export async function approveMapListing(id: string) {
  return apiClient.post(`/api/dashboard/map/listings/${encodeURIComponent(id)}/approve`);
}
export async function rejectMapListing(id: string, reason: string) {
  return apiClient.post(`/api/dashboard/map/listings/${encodeURIComponent(id)}/reject`, { reason });
}
export async function setMapListingStatus(id: string, status: MapListingStatus) {
  return apiClient.patch(`/api/dashboard/map/listings/${encodeURIComponent(id)}/status`, { status });
}
export async function toggleMapListing(id: string) {
  const data = await getOperationalMapData();
  const item = data.entities.find((entity) => entity.id === id || entity.sourceId === id);
  const target: MapListingStatus = item?.metadata.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  return setMapListingStatus(id, target);
}
export async function deleteMapListing(id: string) {
  return apiClient.delete(`/api/dashboard/map/listings/${encodeURIComponent(id)}`);
}
