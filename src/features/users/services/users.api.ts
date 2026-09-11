import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  ModerateUserInput,
  User,
  UserAccountStatus,
  UserDetails,
  UserFilters,
  UserInternalNote,
  UserListResult,
  UserSummary,
  UserVerificationStatus,
} from '../types';

type JsonRecord = Record<string, unknown>;

const record = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (...values: unknown[]): string | undefined =>
  values.find((value) => typeof value === 'string' && value.trim()) as string | undefined;
const number = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};
const bool = (...values: unknown[]): boolean | undefined => { for (const value of values) { if (typeof value === 'boolean') return value; if (value === 'true' || value === 1 || value === '1') return true; if (value === 'false' || value === 0 || value === '0') return false; } return undefined; };
const id = (...values: unknown[]): string => String(values.find((value) => value !== undefined && value !== null && String(value).trim()) ?? '');
const nowIso = () => new Date().toISOString();

function unwrap(payload: unknown): unknown {
  const root = record(payload);
  return root.data ?? root.result ?? root.value ?? payload;
}

function normalizeAccountStatus(value: unknown): UserAccountStatus {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw.includes('SUSPEND') || raw === '2') return 'SUSPENDED';
  if (raw.includes('BLOCK') || raw === '3') return 'BLOCKED';
  if (raw.includes('DEACT') || raw.includes('DISABL') || raw === '4') return 'DEACTIVATED';
  if (raw.includes('PENDING') || raw === '5') return 'PENDING_VERIFICATION';
  if (raw.includes('REJECT') || raw === '6') return 'REJECTED';
  return 'ACTIVE';
}

function normalizeVerificationStatus(value: unknown): UserVerificationStatus {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw.includes('UNVER')) return 'UNVERIFIED';
  if (raw.includes('PHONE')) return 'PHONE_VERIFIED';
  if (raw.includes('VERIF')) return 'VERIFIED';
  return 'UNVERIFIED';
}

function normalizeUser(value: unknown): User {
  const item = record(value);
  const stats = record(item.statistics ?? item.stats);
  const firstName = text(item.firstName, item.first_name);
  const lastName = text(item.lastName, item.last_name);
  const fullName = text(item.fullName, item.name, item.displayName, [firstName, lastName].filter(Boolean).join(' ')) ?? 'مستخدم';
  const createdAt = text(item.createdAt, item.creationTime, item.registeredAt) ?? nowIso();
  const updatedAt = text(item.updatedAt, item.lastModificationTime, item.modifiedAt) ?? createdAt;

  return {
    id: id(item.id, item.userId, item.user_id),
    fullName,
    avatarUrl: resolveMediaUrl(text(item.avatarUrl, item.profileImageUrl, item.imageUrl)) || undefined,
    phone: text(item.phone, item.phoneNumber, item.mobile),
    email: text(item.email),
    governorate: text(item.governorate, item.governorateName, record(item.governorate).name, record(item.governorate).nameAr),
    city: text(item.city, item.area, item.areaName, record(item.area).name, record(item.area).nameAr),
    birthDate: text(item.birthDate, item.dateOfBirth),
    accountStatus: normalizeAccountStatus(item.accountStatus ?? item.status ?? item.userStatus),
    verificationStatus: (() => { const explicit = item.verificationStatus ?? item.verification ?? item.isVerified; if (explicit !== undefined) return normalizeVerificationStatus(explicit); const phoneVerified = bool(item.phoneVerified, item.phoneNumberConfirmed); const emailVerified = bool(item.emailConfirmed); return phoneVerified && emailVerified ? 'VERIFIED' : phoneVerified ? 'PHONE_VERIFIED' : emailVerified ? 'VERIFIED' : 'UNVERIFIED'; })(),
    profileBio: text(item.profileBio, item.bio, item.description),
    createdAt,
    updatedAt,
    lastActiveAt: text(item.lastActiveAt, item.lastLoginAt, item.lastSeenAt),
    statistics: Object.keys(stats).length
      ? {
          reportsCount: number(stats.reportsCount, stats.totalReports) ?? 0,
          verifiedReportsCount: number(stats.verifiedReportsCount) ?? 0,
          activeReportsCount: number(stats.activeReportsCount, stats.openReportsCount) ?? 0,
          resolvedReportsCount: number(stats.resolvedReportsCount, stats.closedReportsCount) ?? 0,
          adoptionRequestsCount: number(stats.adoptionRequestsCount, stats.totalAdoptions) ?? 0,
          pendingAdoptionRequestsCount: number(stats.pendingAdoptionRequestsCount) ?? 0,
          underReviewAdoptionRequestsCount: number(stats.underReviewAdoptionRequestsCount) ?? 0,
          activeAdoptionRequestsCount: number(stats.activeAdoptionRequestsCount) ?? 0,
          completedAdoptionsCount: number(stats.completedAdoptionsCount) ?? 0,
          supportTicketsCount: number(stats.supportTicketsCount, stats.ticketsCount) ?? 0,
          accountAgeDays: number(stats.accountAgeDays),
        }
      : undefined,
  };
}

function normalizeUserList(payload: unknown, filters: UserFilters): UserListResult {
  const body = record(unwrap(payload));
  const rawItems = array(body.items ?? body.users ?? body.data ?? unwrap(payload));
  const items = rawItems.map(normalizeUser);
  const total = number(body.total, body.totalCount, body.count) ?? items.length;
  const page = number(body.page, body.pageNumber) ?? filters.page;
  const pageSize = number(body.pageSize, body.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}

function normalizeSummary(payload: unknown): UserSummary {
  const body = record(unwrap(payload));
  return {
    total: number(body.total, body.totalUsers, body.usersCount) ?? 0,
    active: number(body.active, body.activeUsers) ?? 0,
    suspended: number(body.suspended, body.suspendedUsers) ?? 0,
    blocked: number(body.blocked, body.blockedUsers) ?? 0,
    deactivated: number(body.deactivated) ?? 0,
    pendingVerification: number(body.pendingVerification) ?? 0,
    rejected: number(body.rejected) ?? 0,
  };
}

function normalizeNote(value: unknown): UserInternalNote {
  const item = record(value);
  const admin = record(item.admin ?? item.actor ?? item.createdBy);
  return {
    id: id(item.id, item.noteId, crypto.randomUUID()),
    adminName: text(item.adminName, item.actorName, admin.name, admin.fullName) ?? 'مسؤول النظام',
    adminRole: text(item.adminRole, item.actorRole, admin.role, admin.roleName) ?? 'مسؤول',
    createdAt: text(item.createdAt, item.creationTime) ?? nowIso(),
    note: text(item.note, item.body, item.text) ?? '',
  };
}

function normalizeDetails(payload: unknown): UserDetails | null {
  const raw = unwrap(payload);
  if (raw == null) return null;
  const body = record(raw);
  const userSource = body.user ?? body.profile ?? body;
  const moderationSource = body.moderationHistory ?? (body.moderation ? [body.moderation] : []);
  const moderation = array(moderationSource).map((value) => {
    const item = record(value);
    return {
      id: id(item.id, item.moderationId, crypto.randomUUID()),
      userId: id(item.userId, record(userSource).id),
      action: String(item.action ?? 'WARNING').toUpperCase() as UserDetails['moderation'][number]['action'],
      reason: text(item.reason),
      note: text(item.note),
      actorId: id(item.actorId, record(item.actor).id, 'SYSTEM'),
      actorName: text(item.actorName, record(item.actor).name) ?? 'مسؤول النظام',
      createdAt: text(item.createdAt, item.creationTime) ?? nowIso(),
    };
  });
  const activity = array(body.activity ?? body.timeline ?? body.activities).map((value) => {
    const item = record(value);
    return {
      id: id(item.id, crypto.randomUUID()),
      title: text(item.title, item.action, item.event) ?? 'نشاط',
      actor: text(item.actor, item.actorName, record(item.actor).name),
      timestamp: text(item.timestamp, item.createdAt, item.creationTime) ?? nowIso(),
      details: text(item.details, item.description, item.note),
      tone: text(item.tone) as UserDetails['activity'][number]['tone'],
    };
  });
  const support = record(body.support ?? body.supportSummary);
  const reports = array(body.reports ?? body.recentReports).map((value) => {
    const item = record(value);
    return {
      id: id(item.id, item.reportId),
      title: text(item.title, item.subject, item.description) ?? 'بلاغ',
      status: String(item.status ?? ''),
      severity: String(item.severity ?? item.priority ?? ''),
      createdAt: text(item.createdAt, item.creationTime) ?? nowIso(),
    };
  });
  const adoptions = array(body.adoptions ?? body.adoptionRequests ?? body.recentAdoptions).map((value) => {
    const item = record(value);
    return {
      id: id(item.id, item.adoptionRequestId),
      animalId: id(item.animalId, record(item.animal).id),
      animalName: text(item.animalName, record(item.animal).name),
      status: String(item.status ?? ''),
      submittedAt: text(item.submittedAt, item.createdAt, item.creationTime) ?? nowIso(),
      completedAt: text(item.completedAt),
    };
  });

  return {
    user: normalizeUser(userSource),
    moderation,
    activity,
    notes: array(body.notes ?? body.internalNotes).map(normalizeNote),
    support: {
      ticketsCount: number(support.ticketsCount, support.total) ?? 0,
      lastTicketStatus: text(support.lastTicketStatus, support.status) as UserDetails['support']['lastTicketStatus'],
      lastTicketAt: text(support.lastTicketAt, support.updatedAt),
    },
    reports,
    adoptions,
  };
}

function query(filters: UserFilters): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.accountStatus) params.set('status', filters.accountStatus);
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  return params.toString();
}

export async function getUsers(filters: UserFilters, signal?: AbortSignal): Promise<UserListResult> {
  return normalizeUserList(await apiClient.get<unknown>(`/api/dashboard/users?${query(filters)}`, signal), filters);
}

export async function getUserSummary(signal?: AbortSignal): Promise<UserSummary> {
  return normalizeSummary(await apiClient.get<unknown>('/api/dashboard/users/summary', signal));
}

export async function getUserById(idValue: string, signal?: AbortSignal): Promise<UserDetails | null> {
  return normalizeDetails(await apiClient.get<unknown>(`/api/dashboard/users/${encodeURIComponent(idValue)}`, signal));
}

async function refreshedUser(idValue: string): Promise<UserDetails | null> {
  return getUserById(idValue);
}

export async function suspendUser(idValue: string, input: ModerateUserInput): Promise<UserDetails | null> {
  await apiClient.post(`/api/dashboard/users/${encodeURIComponent(idValue)}/suspend`, { reason: input.otherReason || input.reason, until: null });
  return refreshedUser(idValue);
}

export async function reactivateUser(idValue: string): Promise<UserDetails | null> {
  await apiClient.post(`/api/dashboard/users/${encodeURIComponent(idValue)}/reactivate`);
  return refreshedUser(idValue);
}

export async function blockUser(idValue: string, input: ModerateUserInput): Promise<UserDetails | null> {
  await apiClient.post(`/api/dashboard/users/${encodeURIComponent(idValue)}/block`, { reason: input.otherReason || input.reason, until: null });
  return refreshedUser(idValue);
}

export async function unblockUser(idValue: string): Promise<UserDetails | null> {
  await apiClient.post(`/api/dashboard/users/${encodeURIComponent(idValue)}/unblock`);
  return refreshedUser(idValue);
}

export async function addUserNote(idValue: string, note: string): Promise<UserInternalNote> {
  const response = await apiClient.post<unknown>(`/api/dashboard/users/${encodeURIComponent(idValue)}/notes`, { note });
  const body = unwrap(response);
  return normalizeNote(Object.keys(record(body)).length ? body : { note });
}
