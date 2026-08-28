import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { adoptionKeys } from '@/features/adoption-requests/hooks';
import { dashboardKeys } from '@/features/dashboard/hooks';
import { reportKeys } from '@/features/reports/hooks';
import { addOrganizationNote, approveOrganization, getAssignableOrganizations, getOrganizationById, getOrganizations, getOrganizationSummary, reactivateOrganization, rejectOrganization, requestOrganizationInfo, reviewOrganizationDocument, startOrganizationReview, suspendOrganization } from '../services/organizations.mock';
import type { OrganizationFilters, RejectOrganizationInput, RequestInfoInput, ReviewDocumentInput, SuspendOrganizationInput } from '../types';

export const organizationKeys = {
  all: ['organizations'] as const,

  lists: () => ['organizations', 'list'] as const,

  list: (filters: OrganizationFilters) =>
    ['organizations', 'list', filters] as const,

  summary: () => ['organizations', 'summary'] as const,

  detail: (id: string) =>
    ['organizations', 'detail', id] as const,

  assignable: (search: string) =>
    ['organizations', 'assignable', search] as const,
};

export const useOrganizations = (filters: OrganizationFilters) =>
  useQuery({
    queryKey: organizationKeys.list(filters),
    queryFn: () => getOrganizations(filters),
    placeholderData: keepPreviousData,
  });

export const useOrganizationSummary = () =>
  useQuery({
    queryKey: organizationKeys.summary(),
    queryFn: getOrganizationSummary,
  });

export const useOrganization = (id: string) =>
  useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => getOrganizationById(id),
    enabled: Boolean(id),
  });

export const useAssignableOrganizations = (search = '') =>
  useQuery({
    queryKey: organizationKeys.assignable(search),
    queryFn: () => getAssignableOrganizations(search),
  });

function useActor() {
  const { session } = useSession();

  if (!session) {
    throw new Error('SESSION_REQUIRED');
  }

  return session;
}

function useInvalidate(id?: string) {
  const client = useQueryClient();

  // Organization changes can affect multiple operational views.
  return async () => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: organizationKeys.all,
      }),
      client.invalidateQueries({
        queryKey: dashboardKeys.all,
      }),
      client.invalidateQueries({
        queryKey: reportKeys.all,
      }),
      client.invalidateQueries({
        queryKey: adoptionKeys.all,
      }),
      ...(id
        ? [
            client.invalidateQueries({
              queryKey: organizationKeys.detail(id),
            }),
          ]
        : []),
    ]);
  };
}

export function useStartOrganizationReview(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: () =>
      startOrganizationReview(id, actor),
    onSuccess: invalidate,
  });
}

export function useApproveOrganization(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: () =>
      approveOrganization(id, actor),
    onSuccess: invalidate,
  });
}

export function useRejectOrganization(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (input: RejectOrganizationInput) =>
      rejectOrganization(id, input, actor),
    onSuccess: invalidate,
  });
}

export function useRequestOrganizationInfo(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (input: RequestInfoInput) =>
      requestOrganizationInfo(id, input, actor),
    onSuccess: invalidate,
  });
}

export function useSuspendOrganization(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (input: SuspendOrganizationInput) =>
      suspendOrganization(id, input, actor),
    onSuccess: invalidate,
  });
}

export function useReactivateOrganization(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (note?: string) =>
      reactivateOrganization(id, note, actor),
    onSuccess: invalidate,
  });
}

export function useReviewOrganizationDocument(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: ({
      documentId,
      input,
    }: {
      documentId: string;
      input: ReviewDocumentInput;
    }) =>
      reviewOrganizationDocument(
        id,
        documentId,
        input,
        actor,
      ),
    onSuccess: invalidate,
  });
}

export function useAddOrganizationNote(id: string) {
  const actor = useActor();
  const invalidate = useInvalidate(id);

  return useMutation({
    mutationFn: (note: string) =>
      addOrganizationNote(id, note, actor),
    onSuccess: invalidate,
  });
}