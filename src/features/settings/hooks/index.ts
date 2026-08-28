import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import * as service from '../services/settings.mock';
import type { AdminFilters, CreateRoleInput, InviteAdminInput, LookupType, SystemLookupItem, SystemSettings, UpdateRoleInput } from '../types';

export const settingsKeys = {
  all: ['settings'] as const,
  admins: ['settings', 'admins'] as const,
  adminList: (filters: AdminFilters) => ['settings', 'admins', 'list', filters] as const,
  admin: (id: string) => ['settings', 'admins', id] as const,
  roles: ['settings', 'roles'] as const,
  role: (id: string) => ['settings', 'roles', id] as const,
  system: ['settings', 'system'] as const,
  permissions: ['settings', 'permissions'] as const,
  lookup: (type: LookupType) => ['settings', 'lookup', type] as const,
};

const actor = (session: NonNullable<ReturnType<typeof useSession>['session']>) => ({
  id: session.id,
  name: session.name,
  roleLabel: session.roleLabel,
});

export function useAdminUsers(filters: AdminFilters) {
  return useQuery({
    queryKey: settingsKeys.adminList(filters),
    queryFn: () => service.getAdminUsers(filters),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: settingsKeys.admin(id),
    queryFn: () => service.getAdminUser(id),
    enabled: Boolean(id),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: settingsKeys.roles,
    queryFn: service.getRoles,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: settingsKeys.role(id),
    queryFn: () => service.getRole(id),
    enabled: Boolean(id),
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.system,
    queryFn: service.getSystemSettings,
  });
}

export function usePermissionDefinitions() {
  return useQuery({
    queryKey: settingsKeys.permissions,
    queryFn: service.getPermissionDefinitions,
    staleTime: Infinity,
  });
}

export function useLookupValues(type: LookupType) {
  return useQuery({
    queryKey: settingsKeys.lookup(type),
    queryFn: () => service.getLookupValues(type),
  });
}

function useActor() {
  const { session } = useSession();

  if (!session) {
    throw new Error('جلسة المسؤول مطلوبة.');
  }

  return actor(session);
}

// Settings mutations also affect the shared audit log.
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
  void queryClient.invalidateQueries({ queryKey: ['audit-log'] });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (input: InviteAdminInput) =>
      service.inviteAdmin(input, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSuspendAdmin() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      service.suspendAdmin(id, reason, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useReactivateAdmin() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (id: string) =>
      service.reactivateAdmin(id, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateAdminRoles() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      service.updateAdminRoles(id, { roleIds }, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      service.createRole(input, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      service.updateRole(id, input, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (id: string) =>
      service.deleteRole(id, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateMediaLimits() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (media: SystemSettings['media']) =>
      service.updateMediaLimits(media, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useAddEmergencyContact() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (input: Omit<SystemSettings['emergencyContacts'][number], 'id'>) =>
      service.addEmergencyContact(input, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (contact: SystemSettings['emergencyContacts'][number]) =>
      service.updateEmergencyContact(contact, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (id: string) =>
      service.deleteEmergencyContact(id, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateBackupSettings() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (backup: SystemSettings['backup']) =>
      service.updateBackupSettings(backup, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useCreateSystemBackup() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: () =>
      service.createSystemBackup(currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateTargets() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: (targets: SystemSettings['targets']) =>
      service.updateOperationalTargets(targets, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateLookup() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: ({ type, item }: { type: LookupType; item: SystemLookupItem }) =>
      service.updateLookup(type, item, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useAddLookup() {
  const queryClient = useQueryClient();
  const currentActor = useActor();

  return useMutation({
    mutationFn: ({ type, label }: { type: LookupType; label: string }) =>
      service.addLookup(type, label, currentActor),
    onSuccess: () => invalidate(queryClient),
  });
}