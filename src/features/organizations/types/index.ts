export const organizationStatuses = [
  'PENDING_VERIFICATION',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
] as const;

export type OrganizationStatus = (typeof organizationStatuses)[number];

export const organizationVerificationStatuses = [
  'NOT_REVIEWED',
  'IN_REVIEW',
  'VERIFIED',
  'REJECTED',
  'MORE_INFO_REQUIRED',
] as const;

export type OrganizationVerificationStatus =
  (typeof organizationVerificationStatuses)[number];

export const organizationServiceKeys = [
  'RESCUE',
  'SHELTER',
  'FOSTER',
  'ADOPTION',
  'AWARENESS',
  'TRANSPORT',
  'FOOD_SUPPORT',
] as const;

export type OrganizationServiceKey =
  (typeof organizationServiceKeys)[number];

export interface OrganizationService {
  key: OrganizationServiceKey;
}

export interface OrganizationOperatingHours {
  day: 'SATURDAY' | 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  closed: boolean;
  open24Hours?: boolean;
  opensAt?: string;
  closesAt?: string;
}

export type OrganizationDocumentType =
  | 'LICENSE'
  | 'REGISTRATION'
  | 'REPRESENTATIVE_ID'
  | 'ADDRESS_PROOF'
  | 'OTHER';

export type OrganizationDocumentStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export interface OrganizationDocument {
  id: string;
  type: OrganizationDocumentType;
  name: string;
  url: string;
  status: OrganizationDocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  required: boolean;
}

export interface OrganizationStatistics {
  activeReports: number;
  closedReports: number;
  completionRate?: number;
  pendingAdoptionRequests: number;
  completedAdoptions: number;
  rating?: number;
  reviewsCount?: number;
  activeAdvertisements: number;
  pendingAdvertisements: number;
  donationsTotal: number;
  donationsThisMonth: number;
  recentDonationTransactions: number;
}

export interface OrganizationVerificationReview {
  reviewer?: {
    id: string;
    name: string;
  };
  startedAt?: string;
  checklist: Array<{
    key: string;
    label: string;
    passed: boolean;
  }>;
  requestedItems?: string[];
  adminMessage?: string;
  deadline?: string;
  rejectionReason?: string;
}

export interface OrganizationTimelineEvent {
  id: string;
  action: string;
  actor?: string;
  timestamp: string;
  details?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface OrganizationInternalNote {
  id: string;
  adminName: string;
  adminRole: string;
  createdAt: string;
  note: string;
}

// Core organization record used across management and operational views.
export interface Organization {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  status: OrganizationStatus;
  verificationStatus: OrganizationVerificationStatus;
  registrationNumber?: string;
  licenseNumber?: string;
  foundedYear?: number;
  governorate: string;
  city?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  website?: string;
  primaryContact: {
    name: string;
    role: string;
    phone?: string;
    email?: string;
  };
  services: OrganizationService[];
  operatingHours: OrganizationOperatingHours[];
  documents: OrganizationDocument[];
  statistics?: OrganizationStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDetails {
  organization: Organization;
  review: OrganizationVerificationReview;
  timeline: OrganizationTimelineEvent[];
  notes: OrganizationInternalNote[];
  recentReports: Array<{
    id: string;
    status: string;
    updatedAt: string;
  }>;
  recentAdoptions: Array<{
    id: string;
    status: string;
    applicantName: string;
    animalId: string;
  }>;
}

export interface OrganizationFilters {
  search: string;
  status?: OrganizationStatus;
  verificationStatus?: OrganizationVerificationStatus;
  governorate?: string;
  service?: OrganizationServiceKey;
  activeReports?: 'YES' | 'NO';
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface OrganizationListResult {
  items: Organization[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface OrganizationSummary {
  total: number;
  pendingVerification: number;
  active: number;
  suspended: number;
  withActiveReports: number;
}

// Assignment options expose only the operational data needed by report workflows.
export interface OrganizationAssignmentOption {
  id: string;
  name: string;
  governorate: string;
  distanceKm?: number;
  activeReports: number;
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
}

export interface RequestInfoInput {
  requestedItems: string[];
  message: string;
  deadline?: string;
}

export interface RejectOrganizationInput {
  reason: string;
  otherReason?: string;
}

export interface SuspendOrganizationInput {
  reason: string;
  otherReason?: string;
  note?: string;
  acknowledgeActiveReports: boolean;
}

export interface ReviewDocumentInput {
  decision: 'APPROVE' | 'REJECT';
  reason?: string;
}