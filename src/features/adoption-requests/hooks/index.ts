import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { dashboardKeys } from '@/features/dashboard/hooks';
import type { AdoptionRequestFilters, RejectAdoptionInput } from '../types';
import { addAdoptionNote, approveAdoptionRequest, deleteAdoptionRequest, getAdoptionRequestById, getAdoptionRequests, getAdoptionRequestSummary, rejectAdoptionRequest } from '../services/adoption-requests.mock';

export const adoptionKeys = {
  all: ['adoption-requests'] as const,
  lists: () => ['adoption-requests', 'list'] as const,
  list: (filters: AdoptionRequestFilters) => ['adoption-requests', 'list', filters] as const,
  summary: () => ['adoption-requests', 'summary'] as const,
  details: () => ['adoption-requests', 'detail'] as const,
  detail: (id: string) => ['adoption-requests', 'detail', id] as const,
};

export const useAdoptionRequests = (filters: AdoptionRequestFilters) =>
  useQuery({
    queryKey: adoptionKeys.list(filters),
    queryFn: () => getAdoptionRequests(filters),
    placeholderData: keepPreviousData,
  });

export const useAdoptionRequest = (id: string) =>
  useQuery({
    queryKey: adoptionKeys.detail(id),
    queryFn: () => getAdoptionRequestById(id),
    enabled: Boolean(id),
  });

export const useAdoptionRequestSummary = () =>
  useQuery({
    queryKey: adoptionKeys.summary(),
    queryFn: getAdoptionRequestSummary,
  });

function useActor() {
  const { session } = useSession();

  if (!session) {
    throw new Error('SESSION_REQUIRED');
  }

  return session;
}

// Refresh the related queries after any adoption update.
function useInvalidate(id?: string) {
  const client = useQueryClient();

  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: adoptionKeys.lists() }),
      client.invalidateQueries({ queryKey: adoptionKeys.summary() }),
      client.invalidateQueries({ queryKey: dashboardKeys.all }),
      ...(id
        ? [client.invalidateQueries({ queryKey: adoptionKeys.detail(id) })]
        : []),
    ]);
  };
}

export function useApproveAdoptionRequest(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (note?: string) => approveAdoptionRequest(id, note, actor),
    onSuccess: invalidate,
  });
}

export function useRejectAdoptionRequest(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (input: RejectAdoptionInput) => rejectAdoptionRequest(id, input, actor),
    onSuccess: invalidate,
  });
}

export function useDeleteAdoptionRequest(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (reason: string) => deleteAdoptionRequest(id, reason, actor),
    onSuccess: invalidate,
  });
}

export function useAddAdoptionNote(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (note: string) => addAdoptionNote(id, note, actor),
    onSuccess: invalidate,
  });
}