import { env } from '@/config/env';
import * as api from './locations.api';
import * as mock from './settings.mock';

export type LocationActor = { id: string; name: string; roleLabel: string };

export function getLocationCatalog(options?: { includeInactive?: boolean; signal?: AbortSignal }) {
  return env.dataSource === 'api' ? api.getLocationCatalog(options) : mock.getLocationCatalog({ includeInactive: options?.includeInactive });
}
export function addGovernorate(name: string, actor: LocationActor) {
  return env.dataSource === 'api' ? api.addGovernorate(name) : mock.addGovernorate(name, actor);
}
export function updateGovernorate(id: string, patch: { name?: string; isActive?: boolean }, actor: LocationActor) {
  return env.dataSource === 'api' ? api.updateGovernorate(id, patch) : mock.updateGovernorate(id, patch, actor);
}
export function addRegion(input: { governorateId: string; name: string }, actor: LocationActor) {
  return env.dataSource === 'api' ? api.addRegion(input) : mock.addRegion(input, actor);
}
export function updateRegion(id: string, patch: { governorateId?: string; name?: string; isActive?: boolean }, actor: LocationActor) {
  return env.dataSource === 'api' ? api.updateRegion(id, patch) : mock.updateRegion(id, patch, actor);
}
