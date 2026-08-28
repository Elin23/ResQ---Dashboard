import type { Permission } from '@/features/auth/permissions';
import { safeFormatDate } from '@/lib/runtime-safety';

import type { AdminRoleRecord } from '../types';

export const getEffectivePermissions = (roles: AdminRoleRecord[]): Permission[] =>
  [
    ...new Set(
      (Array.isArray(roles) ? roles : []).flatMap((r) => r.permissions ?? []),
    ),
  ].sort();

export const formatAdminDate = (value?: string) =>
  safeFormatDate(value, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Damascus',
  });

// Build a stable-looking key for custom roles while keeping each creation unique.
export const createRoleKey = (name: string) =>
  `CUSTOM_${String(name ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_') || 'ROLE'}_${Date.now().toString().slice(-4)}`;