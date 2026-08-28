export const reportStatuses = ['EN_ROUTE', 'RECEIVED', 'CLOSED'] as const;
export type ReportStatus = (typeof reportStatuses)[number];

/** @deprecated Legacy field kept temporarily for cross-feature compatibility. It is not part of the reports workflow UI. */
export const reportSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

/** @deprecated Legacy field kept temporarily for cross-feature compatibility. */
export type ReportSeverity = (typeof reportSeverities)[number];

export const animalTypes = ['DOG', 'CAT', 'BIRD', 'OTHER'] as const;
export type AnimalType = (typeof animalTypes)[number];

export type ReportMediaType = 'IMAGE' | 'VIDEO';

export interface ReportMedia {
  id: string;
  type: ReportMediaType;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Reporter {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isGuest: boolean;
}

export interface AssignedOrganization {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  status: ReportStatus;

  /** @deprecated Not used by the reports admin UI. */
  severity: ReportSeverity;

  animalType: AnimalType;
  animalDescription?: string;
  title: string;
  description: string;
  governorate: string;
  city?: string;
  address: string;
  latitude: number;
  longitude: number;
  reporter: Reporter;
  assignedOrganization?: AssignedOrganization;
  media: ReportMedia[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  assignedAt?: string;
  receivedAt?: string;
  closedAt?: string;
  internalNotesCount?: number;
  rejectionReason?: string;
}

export interface ReportFilters {
  search: string;
  status?: ReportStatus;
  animalType?: AnimalType;

  /** @deprecated Legacy analytics filter; not exposed in the reports admin UI. */
  severity?: ReportSeverity;

  governorate?: string;
  organizationId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface ReportListResult {
  items: Report[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// Summary values power the operational cards above the reports table.
export interface ReportSummary {
  todayCount: number;
  unassignedCount: number;
  enRouteCount: number;
  receivedTodayCount: number;
}

export interface ReportTimelineEvent {
  id: string;
  action: string;
  actor?: string;
  timestamp: string;
  details?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface ReportNote {
  id: string;
  adminName: string;
  adminRole: string;
  createdAt: string;
  note: string;
}

export interface ReportDetails {
  report: Report;
  timeline: ReportTimelineEvent[];
  notes: ReportNote[];
}

export interface EligibleOrganization {
  id: string;
  name: string;
  governorate: string;
  distanceKm?: number;
  activeReports: number;
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
}

export interface AdminStatusOverrideInput {
  status: ReportStatus;
  reason: string;
}

export interface DeleteReportInput {
  reason: string;
}