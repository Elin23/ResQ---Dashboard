import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { ModerateUserInput, UserDetails, UserFilters, UserInternalNote, UserListResult, UserSummary } from '../types';
import * as api from './users.api';
import * as mock from './users.mock';

export function getUsers(filters: UserFilters, signal?: AbortSignal): Promise<UserListResult> {
  return env.dataSource === 'api' ? api.getUsers(filters, signal) : mock.getUsers(filters);
}
export function getUserSummary(signal?: AbortSignal): Promise<UserSummary> {
  return env.dataSource === 'api' ? api.getUserSummary(signal) : mock.getUserSummary();
}
export function getUserById(id: string, signal?: AbortSignal): Promise<UserDetails | null> {
  return env.dataSource === 'api' ? api.getUserById(id, signal) : mock.getUserById(id);
}
export function suspendUser(id: string, input: ModerateUserInput, actor: AdminSession) {
  return env.dataSource === 'api' ? api.suspendUser(id, input) : mock.suspendUser(id, input, actor);
}
export function reactivateUser(id: string, note: string | undefined, actor: AdminSession) {
  return env.dataSource === 'api' ? api.reactivateUser(id) : mock.reactivateUser(id, note, actor);
}
export function blockUser(id: string, input: ModerateUserInput, actor: AdminSession) {
  return env.dataSource === 'api' ? api.blockUser(id, input) : mock.blockUser(id, input, actor);
}
export function unblockUser(id: string, note: string | undefined, actor: AdminSession) {
  return env.dataSource === 'api' ? api.unblockUser(id) : mock.unblockUser(id, note, actor);
}
export function addUserNote(id: string, note: string, actor: AdminSession): Promise<UserInternalNote> {
  return env.dataSource === 'api' ? api.addUserNote(id, note) : mock.addUserNote(id, note, actor);
}
