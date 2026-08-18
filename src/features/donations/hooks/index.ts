import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { dashboardKeys } from '@/features/dashboard/hooks';
import type { DonationCampaignFilters } from '../types';
import {
  approveDonationCampaign,
  deleteDonationCampaign,
  getDonationCampaignById,
  getDonationCampaigns,
  getDonationSummary,
  rejectDonationCampaign,
} from '../services/donations.mock';

export const donationKeys = {
  all: ['donation-campaigns'] as const,
  list: (filters: DonationCampaignFilters) => ['donation-campaigns', 'list', filters] as const,
  summary: (filters?: Partial<DonationCampaignFilters>) => ['donation-campaigns', 'summary', filters ?? {}] as const,
  detail: (id: string) => ['donation-campaigns', 'detail', id] as const,
};

export const useDonationCampaigns = (filters: DonationCampaignFilters) => useQuery({ queryKey: donationKeys.list(filters), queryFn: () => getDonationCampaigns(filters), placeholderData: keepPreviousData });
export const useDonationSummary = (filters?: Partial<DonationCampaignFilters>) => useQuery({ queryKey: donationKeys.summary(filters), queryFn: () => getDonationSummary(filters) });
export const useDonationCampaign = (id: string) => useQuery({ queryKey: donationKeys.detail(id), queryFn: () => getDonationCampaignById(id), enabled: Boolean(id) });

function useActor() {
  const { session } = useSession();
  if (!session) throw new Error('SESSION_REQUIRED');
  return session;
}

function useInvalidate(id?: string) {
  const client = useQueryClient();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: donationKeys.all }),
      client.invalidateQueries({ queryKey: dashboardKeys.all }),
      ...(id ? [client.invalidateQueries({ queryKey: donationKeys.detail(id) })] : []),
    ]);
  };
}

export function useApproveDonationCampaign(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);
  return useMutation({ mutationFn: () => approveDonationCampaign(id, actor), onSuccess: invalidate });
}

export function useRejectDonationCampaign(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);
  return useMutation({ mutationFn: (reason: string) => rejectDonationCampaign(id, reason, actor), onSuccess: invalidate });
}

export function useDeleteDonationCampaign(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (reason: string) => deleteDonationCampaign(id, reason, actor), onSuccess: invalidate });
}
