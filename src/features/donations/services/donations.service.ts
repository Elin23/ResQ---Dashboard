import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { DonationArchiveAnalyticsFilters, DonationCampaignFilters } from '../types';
import * as api from './donations.api';
import * as mock from './donations.mock';

export const getDonationCampaigns = (filters: DonationCampaignFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getDonationCampaigns(filters, signal) : mock.getDonationCampaigns(filters);
export const getDonationSummary = (filters?: Partial<DonationCampaignFilters>, signal?: AbortSignal) => env.dataSource === 'api' ? api.getDonationSummary(filters, signal) : mock.getDonationSummary(filters);
export const getDonationCampaignById = (id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getDonationCampaignById(id, signal) : mock.getDonationCampaignById(id);

export async function approveDonationCampaign(id: string, actor: AdminSession) {
  if (env.dataSource === 'api') return api.approveDonationCampaign(id);
  await mock.approveDonationCampaign(id, actor);
  return mock.getDonationCampaignById(id);
}

export async function rejectDonationCampaign(id: string, reason: string, actor: AdminSession) {
  if (env.dataSource === 'api') return api.rejectDonationCampaign(id, reason);
  await mock.rejectDonationCampaign(id, reason, actor);
  return mock.getDonationCampaignById(id);
}

export const deleteDonationCampaign = (id: string, reason: string, actor: AdminSession) => env.dataSource === 'api' ? api.deleteDonationCampaign(id, reason) : mock.deleteDonationCampaign(id, reason, actor);
export const getDonations = (filters: DonationArchiveAnalyticsFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getDonations(filters, signal) : mock.getDonations(filters);
