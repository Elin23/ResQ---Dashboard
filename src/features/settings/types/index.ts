import type { AdminRole, Permission } from '@/features/auth/permissions';

export const adminAccountStatuses = ['ACTIVE', 'SUSPENDED', 'INVITED', 'DISABLED'] as const;
export type AdminAccountStatus = (typeof adminAccountStatuses)[number];

export interface AdminRoleSummary {
  id: string;
  key: string;
  name: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  status: AdminAccountStatus;
  roles: AdminRoleSummary[];
  createdAt: string;
  updatedAt: string;
  invitedAt?: string;
  acceptedAt?: string;
  lastLoginAt?: string;
  createdBy?: { id: string; name: string };
  mfaEnabled?: boolean;
}

export interface AdminRoleRecord {
  id: string;
  key: string;
  name: string;
  description?: string;
  system: boolean;
  permissions: Permission[];
  usersCount: number;
  createdAt: string;
  updatedAt: string;
  systemRole?: AdminRole;
}

export interface AdminFilters {
  search: string;
  status?: AdminAccountStatus;
  roleId?: string;
  lastLogin?: 'RECENT_30_DAYS' | 'NEVER';
  page: number;
  pageSize: number;
}

export interface AdminListResult {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type LookupType =
  | 'REPORT_REJECTION_REASONS'
  | 'ADOPTION_REJECTION_REASONS'
  | 'ORGANIZATION_REASONS'
  | 'ORGANIZATION_SERVICES'
  | 'ANIMAL_TYPES'
  | 'GOVERNORATES';

export interface SystemLookupItem {
  id: string;
  key: string;
  label: string;
  active: boolean;
  order: number;
  locked?: boolean;
}

export type EmergencyContactCategory = 'VETERINARY' | 'RESCUE' | 'OTHER';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: EmergencyContactCategory;
  governorate?: string;
  active: boolean;
}

export interface MediaLimits {
  maxImages: number;
  maxImageMb: number;
  maxVideoMb: number;
  allowedTypes: Array<'image/jpeg' | 'image/png' | 'image/webp' | 'video/mp4'>;
}

/**
 * Legacy analytics targets kept for compatibility with the current mock analytics layer.
 * They are intentionally no longer exposed in System Settings because reports are
 * published immediately and Rescue Missions is no longer a standalone admin feature.
 */
export interface OperationalTargets {
  reportReviewMinutes: number;
  missionAcceptanceMinutes: number;
  missionArrivalMinutes: number;
  supportFirstResponseMinutes: number;
  adoptionReviewHours: number;
}

export type BackupFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface BackupSettings {
  automaticEnabled: boolean;
  frequency: BackupFrequency;
  retentionCount: number;
  includeAuditLog: boolean;
  lastBackupAt?: string;
  lastBackupBy?: { id: string; name: string };
}

export interface BackupRecord {
  id: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  kind: 'MANUAL' | 'AUTOMATIC';
  fileName: string;
  sizeBytes: number;
}

export interface SystemBackupExport {
  record: BackupRecord;
  fileName: string;
  payload: string;
}

export interface SystemSettings {
  lookups: Record<LookupType, SystemLookupItem[]>;
  emergencyContacts: EmergencyContact[];
  media: MediaLimits;
  targets: OperationalTargets;
  backup: BackupSettings;
  backupHistory: BackupRecord[];
  updatedAt: string;
  updatedBy: { id: string; name: string };
}

export interface InviteAdminInput {
  fullName: string;
  email: string;
  roleIds: string[];
}

export interface UpdateAdminRolesInput {
  roleIds: string[];
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UpdateRoleInput {
  name: string;
  description: string;
  permissions: Permission[];
}
