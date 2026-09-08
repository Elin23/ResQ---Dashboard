import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { AdoptionRequestFilters, RejectAdoptionInput } from '../types';
import * as api from './adoption-requests.api';
import * as mock from './adoption-requests.mock';

export const getAdoptionRequests = (filters: AdoptionRequestFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdoptionRequests(filters, signal) : mock.getAdoptionRequests(filters);
export const getAdoptionRequestById = (id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdoptionRequestById(id, signal) : mock.getAdoptionRequestById(id);
export const getAdoptionRequestSummary = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getAdoptionRequestSummary(signal) : mock.getAdoptionRequestSummary();

export async function approveAdoptionRequest(id: string, note: string | undefined, actor: AdminSession) {
  if (env.dataSource === 'api') return api.approveAdoptionRequest(id, note);
  await mock.approveAdoptionRequest(id, note, actor);
  return mock.getAdoptionRequestById(id);
}

export async function rejectAdoptionRequest(id: string, input: RejectAdoptionInput, actor: AdminSession) {
  if (env.dataSource === 'api') return api.rejectAdoptionRequest(id, input);
  await mock.rejectAdoptionRequest(id, input, actor);
  return mock.getAdoptionRequestById(id);
}

export const deleteAdoptionRequest = (id: string, reason: string, actor: AdminSession) => env.dataSource === 'api' ? api.deleteAdoptionRequest(id, reason) : mock.deleteAdoptionRequest(id, reason, actor);
export const addAdoptionNote = (id: string, note: string, actor: AdminSession) => env.dataSource === 'api' ? api.addAdoptionNote(id, note) : mock.addAdoptionNote(id, note, actor);
