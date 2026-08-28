import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session';

import { addUserNote, blockUser, getUserById, getUsers, getUserSummary, reactivateUser, suspendUser, unblockUser } from '../services/users.mock';
import type { ModerateUserInput, UserDetails, UserFilters, UserInternalNote } from '../types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => ['users', 'list'] as const,
  list: (filters: UserFilters) => ['users', 'list', filters] as const,
  summary: () => ['users', 'summary'] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export const useUsers = (filters: UserFilters) =>
  useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: keepPreviousData,
  });

export const useUserSummary = () =>
  useQuery({
    queryKey: userKeys.summary(),
    queryFn: getUserSummary,
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
  });

function useActor() {
  const { session } = useSession();

  if (!session) {
    throw new Error('SESSION_REQUIRED');
  }

  return session;
}

function useRefreshUserState(id: string) {
  const client = useQueryClient();

  // Reuse mutation responses for the open profile and refresh only aggregates that can change.
  return async (details: UserDetails | null) => {
    if (details) {
      client.setQueryData(userKeys.detail(id), details);
    } else {
      await client.invalidateQueries({ queryKey: userKeys.detail(id) });
    }

    await Promise.all([
      client.invalidateQueries({ queryKey: userKeys.lists() }),
      client.invalidateQueries({ queryKey: userKeys.summary() }),
    ]);
  };
}

function useAppendUserNote(id: string) {
  const client = useQueryClient();

  return (note: UserInternalNote) => {
    client.setQueryData<UserDetails | null>(userKeys.detail(id), (current) =>
      current
        ? {
            ...current,
            notes: [note, ...current.notes],
          }
        : current,
    );
  };
}

export function useSuspendUser(id: string) {
  const actor = useActor();
  const refresh = useRefreshUserState(id);

  return useMutation({
    mutationFn: (input: ModerateUserInput) => suspendUser(id, input, actor),
    onSuccess: refresh,
  });
}

export function useReactivateUser(id: string) {
  const actor = useActor();
  const refresh = useRefreshUserState(id);

  return useMutation({
    mutationFn: (note?: string) => reactivateUser(id, note, actor),
    onSuccess: refresh,
  });
}

export function useBlockUser(id: string) {
  const actor = useActor();
  const refresh = useRefreshUserState(id);

  return useMutation({
    mutationFn: (input: ModerateUserInput) => blockUser(id, input, actor),
    onSuccess: refresh,
  });
}

export function useUnblockUser(id: string) {
  const actor = useActor();
  const refresh = useRefreshUserState(id);

  return useMutation({
    mutationFn: (note?: string) => unblockUser(id, note, actor),
    onSuccess: refresh,
  });
}

export function useAddUserNote(id: string) {
  const actor = useActor();
  const append = useAppendUserNote(id);

  return useMutation({
    mutationFn: (note: string) => addUserNote(id, note, actor),
    onSuccess: append,
  });
}
