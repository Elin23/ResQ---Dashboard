import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { AdvertisementFilters, CreateAdvertisementInput } from '../types';
import * as api from './advertisements.api';
import * as mock from './advertisements.mock';

export const getAdvertisements = (filters: AdvertisementFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdvertisements(filters, signal) : mock.getAdvertisements(filters);
export const getAdvertisementSummary = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdvertisementSummary(signal) : mock.getAdvertisementSummary();
export const getAdvertisementById = (id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdvertisementById(id, signal) : mock.getAdvertisementById(id);
export const getAdvertiserAdvertisementSummary = (type: string, id?: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdvertiserAdvertisementSummary(type, id, signal) : mock.getAdvertiserAdvertisementSummary(type, id);
export const createAdvertisement = (input: CreateAdvertisementInput, actor: AdminSession) => env.dataSource === 'api' ? api.createAdvertisement(input, actor) : mock.createAdvertisement(input, actor);

export async function activateAdvertisement(id: string, actor: AdminSession) {
  if (env.dataSource === 'api') return api.activateAdvertisement(id);
  await mock.activateAdvertisement(id, actor);
  return mock.getAdvertisementById(id);
}

export async function pauseAdvertisement(id: string, reason: string, actor: AdminSession) {
  if (env.dataSource === 'api') return api.pauseAdvertisement(id, reason);
  await mock.pauseAdvertisement(id, reason, actor);
  return mock.getAdvertisementById(id);
}

export const deleteAdvertisement = (id: string, reason: string, actor: AdminSession) => env.dataSource === 'api' ? api.deleteAdvertisement(id, reason) : mock.deleteAdvertisement(id, reason, actor);
