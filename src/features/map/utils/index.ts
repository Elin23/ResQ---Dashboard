import type { MapCoordinates, MapEntity } from '../types';

// Calculate the straight-line distance between two map coordinates.
export function distanceKm(a: MapCoordinates, b: MapCoordinates) {
  const r = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * r * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number) {
  return km < 1
    ? `${Math.round(km * 1000)} م تقريبًا`
    : `${km.toFixed(km < 10 ? 1 : 0)} كم تقريبًا`;
}

// Auto-generated entities link back to their original module.
export function entityRoute(entity: MapEntity) {
  if (entity.type === 'ORGANIZATION') {
    return `/organizations/${entity.sourceId}`;
  }

  if (entity.type === 'FEEDING_POINT') {
    return `/feeding-points/${entity.sourceId}`;
  }

  return `/map?entityType=${entity.type}&entityId=${entity.sourceId}`;
}

// Search across the main location and ownership fields shown in the directory.
export function matchesSearch(entity: MapEntity, search: string) {
  const q = search.trim().toLocaleLowerCase('ar');

  if (!q) {
    return true;
  }

  return `${entity.sourceId} ${entity.title} ${entity.subtitle ?? ''} ${entity.governorate} ${entity.city ?? ''} ${entity.address} ${entity.metadata.ownerName ?? ''}`
    .toLocaleLowerCase('ar')
    .includes(q);
}