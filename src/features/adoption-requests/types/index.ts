import type { UserAccountStatus } from '@/features/users/types';

export const adoptionAnimalSpecies = ['DOG', 'CAT', 'BIRD', 'OTHER'] as const;
export type AdoptionAnimalSpecies = (typeof adoptionAnimalSpecies)[number];

export const adoptionRequestStatuses = ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ADOPTED'] as const;
export type AdoptionRequestStatus = (typeof adoptionRequestStatuses)[number];

export const adoptionPublisherTypes = ['USER', 'ORGANIZATION'] as const;
export type AdoptionPublisherType = (typeof adoptionPublisherTypes)[number];

export const adoptionApplicationStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] as const;
export type AdoptionApplicationStatus = (typeof adoptionApplicationStatuses)[number];

export interface AdoptionAnimalRef {
  id: string;
  name?: string;
  species: AdoptionAnimalSpecies;
  breed?: string;
  sex?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  estimatedAgeMonths?: number;
  imageUrls: string[];
  description: string;
}

export interface AdoptionPublisher {
  type: AdoptionPublisherType;
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  accountStatus?: UserAccountStatus;
  memberSince?: string;
}

export interface AdoptionApplicant {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  accountStatus: UserAccountStatus;
  memberSince: string;
}

export interface AdoptionApplication {
  id: string;
  applicant: AdoptionApplicant;
  status: AdoptionApplicationStatus;
  message?: string;
  submittedAt: string;
  respondedAt?: string;
  ownerResponse?: string;
  contactShared: boolean;
}

export interface AdoptionDecision {
  decidedAt: string;
  decidedBy: { id: string; name: string };
  reason?: string;
}

export interface AdoptionTimelineEvent {
  id: string;
  action: 'SUBMITTED' | 'PUBLISHED' | 'REJECTED' | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'ADOPTED' | 'NOTE_ADDED';
  title: string;
  actor?: string;
  timestamp: string;
  note?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface AdoptionInternalNote {
  id: string;
  adminName: string;
  adminRole: string;
  createdAt: string;
  note: string;
}

export interface AdoptionRequest {
  id: string;
  animal: AdoptionAnimalRef;
  publisher: AdoptionPublisher;
  status: AdoptionRequestStatus;
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  publishedAt?: string;
  rejectedAt?: string;
  adoptedAt?: string;
  location: string;
  requirements?: string;
  moderationReason?: string;
  reviewer?: { id: string; name: string };
  applicationsCount: number;
  pendingApplicationsCount: number;
  acceptedApplicationId?: string;
  internalNotesCount: number;
}

export interface AdoptionRequestDetails {
  request: AdoptionRequest;
  applications: AdoptionApplication[];
  timeline: AdoptionTimelineEvent[];
  notes: AdoptionInternalNote[];
}

export interface AdoptionRequestFilters {
  search: string;
  status?: AdoptionRequestStatus;
  species?: AdoptionAnimalSpecies;
  publisherType?: AdoptionPublisherType;
  organizationId?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  page: number;
  pageSize: number;
  sortBy?: 'submittedAt' | 'updatedAt' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface AdoptionRequestListResult {
  items: AdoptionRequest[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface AdoptionRequestSummary {
  pendingReview: number;
  published: number;
  withApplications: number;
  pendingApplications: number;
  rejected: number;
  adopted: number;
}

export interface RejectAdoptionInput {
  reason: string;
  otherReason?: string;
}
