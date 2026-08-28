export const userAccountStatuses = ['ACTIVE', 'SUSPENDED', 'BLOCKED', 'DEACTIVATED'] as const;
export type UserAccountStatus = (typeof userAccountStatuses)[number];

export const userVerificationStatuses = ['UNVERIFIED', 'PHONE_VERIFIED', 'VERIFIED'] as const;
export type UserVerificationStatus = (typeof userVerificationStatuses)[number];

export type UserModerationAction = 'WARNING' | 'SUSPEND' | 'REACTIVATE' | 'BLOCK' | 'UNBLOCK';

export interface UserStatistics {
  reportsCount: number;
  verifiedReportsCount: number;
  activeReportsCount: number;
  resolvedReportsCount: number;
  adoptionRequestsCount: number;
  pendingAdoptionRequestsCount: number;
  underReviewAdoptionRequestsCount: number;
  activeAdoptionRequestsCount: number;
  completedAdoptionsCount: number;
  supportTicketsCount: number;
  accountAgeDays?: number;
}

export interface User {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  governorate?: string;
  city?: string;
  birthDate?: string;
  accountStatus: UserAccountStatus;
  verificationStatus: UserVerificationStatus;
  profileBio?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  statistics?: UserStatistics;
}

export interface UserModerationRecord {
  id: string;
  userId: string;
  action: UserModerationAction;
  reason?: string;
  note?: string;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export interface UserActivityEvent {
  id: string;
  title: string;
  actor?: string;
  timestamp: string;
  details?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface UserSuspension {
  reason: string;
  note?: string;
  suspendedAt: string;
  suspendedBy: string;
}

export interface UserSupportSummary {
  ticketsCount: number;
  lastTicketStatus?: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  lastTicketAt?: string;
}

export interface UserInternalNote {
  id: string;
  adminName: string;
  adminRole: string;
  createdAt: string;
  note: string;
}

export interface UserRelatedReport {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
}

export interface UserRelatedAdoption {
  id: string;
  animalId: string;
  animalName?: string;
  status: string;
  submittedAt: string;
  completedAt?: string;
}

export interface UserDetails {
  user: User;
  moderation: UserModerationRecord[];
  activity: UserActivityEvent[];
  notes: UserInternalNote[];
  support: UserSupportSummary;
  reports: UserRelatedReport[];
  adoptions: UserRelatedAdoption[];
}

// Filters mirror the users list URL and table state.
export interface UserFilters {
  search: string;
  accountStatus?: UserAccountStatus;
  verificationStatus?: UserVerificationStatus;
  page: number;
  pageSize: number;
  sortBy?: 'createdAt' | 'lastActiveAt' | 'fullName' | 'accountStatus';
  sortDirection?: 'asc' | 'desc';
}

export interface UserListResult {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface UserSummary {
  total: number;
  newThisMonth: number;
  active: number;
  suspended: number;
  blocked: number;
  withActiveAdoptions: number;
}

export interface ModerateUserInput {
  reason: string;
  otherReason?: string;
  note?: string;
}