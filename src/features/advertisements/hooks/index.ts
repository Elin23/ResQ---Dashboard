import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import type { AdvertisementFilters, CreateAdvertisementInput } from '../types';
import { activateAdvertisement, createAdvertisement, deleteAdvertisement, getAdvertisementById, getAdvertisements, getAdvertisementSummary, getAdvertiserAdvertisementSummary, pauseAdvertisement } from '../services/advertisements.mock';

export const advertisementKeys = {
  all: ['advertisements'] as const,
  list: (filters: AdvertisementFilters) => ['advertisements', 'list', filters] as const,
  summary: () => ['advertisements', 'summary'] as const,
  detail: (id: string) => ['advertisements', 'detail', id] as const,
  advertiser: (type: string, id?: string) => ['advertisements', 'advertiser', type, id] as const,
};

export const useAdvertisements = (filters: AdvertisementFilters) =>
  useQuery({
    queryKey: advertisementKeys.list(filters),
    queryFn: () => getAdvertisements(filters),
    placeholderData: keepPreviousData,
  });

export const useAdvertisementSummary = () =>
  useQuery({
    queryKey: advertisementKeys.summary(),
    queryFn: getAdvertisementSummary,
  });

export const useAdvertisement = (id: string) =>
  useQuery({
    queryKey: advertisementKeys.detail(id),
    queryFn: () => getAdvertisementById(id),
    enabled: Boolean(id),
  });

export const useAdvertiserAdvertisementSummary = (type: string, id?: string) =>
  useQuery({
    queryKey: advertisementKeys.advertiser(type, id),
    queryFn: () => getAdvertiserAdvertisementSummary(type, id),
  });

function useActor() {
  const { session } = useSession();

  if (!session) {
    throw new Error('SESSION_REQUIRED');
  }

  return session;
}

// Refresh advertisement data after any change.
function useInvalidate(id?: string) {
  const client = useQueryClient();

  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: advertisementKeys.all }),
      ...(id
        ? [client.invalidateQueries({ queryKey: advertisementKeys.detail(id) })]
        : []),
    ]);
  };
}

export function useCreateAdvertisement() {
  const actor = useActor();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: CreateAdvertisementInput) => createAdvertisement(input, actor),
    onSuccess: invalidate,
  });
}

export function useActivateAdvertisement(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: () => activateAdvertisement(id, actor),
    onSuccess: invalidate,
  });
}

export function usePauseAdvertisement(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (reason: string) => pauseAdvertisement(id, reason, actor),
    onSuccess: invalidate,
  });
}

export function useDeleteAdvertisement(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (reason: string) => deleteAdvertisement(id, reason, actor),
    onSuccess: invalidate,
  });
}