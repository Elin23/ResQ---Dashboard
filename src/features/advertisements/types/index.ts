export const advertisementStatuses = ['DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REJECTED', 'DELETED'] as const;
export type AdvertisementStatus = (typeof advertisementStatuses)[number];
export const advertisementPlacements = ['HOME_BANNER', 'ADOPTION', 'ORGANIZATIONS', 'MAP', 'SEARCH'] as const;
export type AdvertisementPlacement = (typeof advertisementPlacements)[number];
export type AdvertiserType = 'CLIENT';

export interface AdvertisementCreative {
  type: 'IMAGE' | 'BANNER';
  imageUrl: string;
  altText: string;
  callToActionLabel?: string;
}

export interface AdvertisementPerformance {
  impressions?: number;
  clicks?: number;
  clickThroughRate?: number;
  mockData: boolean;
}

export interface Advertisement {
  id: string;
  advertiser: { type: AdvertiserType; id?: string; name: string };
  ownerName: string;
  ownerPhone: string;
  agreedAmountMinor: number;
  currency: 'SYP';
  paid: boolean;
  paymentReference?: string;
  title: string;
  description?: string;
  creative: AdvertisementCreative;
  placement: AdvertisementPlacement;
  publicationPhone?: string;
  publicationEmail?: string;
  publicationTitle: string;
  targetUrl?: string;
  startAt?: string;
  endAt?: string;
  status: AdvertisementStatus;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  pausedAt?: string;
  pauseReason?: string;
  expiredAt?: string;
  performance?: AdvertisementPerformance;
}

export interface AdvertisementTimelineEvent {
  id: string;
  title: string;
  actor?: string;
  timestamp: string;
  details?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface AdvertisementDetails {
  advertisement: Advertisement;
  timeline: AdvertisementTimelineEvent[];
}

export interface AdvertisementFilters {
  search: string;
  status?: AdvertisementStatus;
  advertiserType?: AdvertiserType;
  advertiserId?: string;
  organizationId?: string;
  placement?: AdvertisementPlacement;
  governorate?: string;
  dateFrom?: string;
  dateTo?: string;
  activePeriod?: 'CURRENT' | 'FUTURE' | 'PAST';
  page: number;
  pageSize: number;
  sortBy?: 'updatedAt' | 'startAt' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface AdvertisementListResult {
  items: Advertisement[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface AdvertisementSummary {
  draft: number;
  pendingReview: number;
  scheduled: number;
  active: number;
  paused: number;
  expired: number;
  rejected: number;
  unpaid: number;
}

export interface AdvertisementAdvertiserSummary {
  active: number;
  pending: number;
  paused: number;
  recent: Advertisement[];
}

export interface CreateAdvertisementInput {
  ownerName: string;
  ownerPhone: string;
  agreedAmountMinor: number;
  paid: boolean;
  paymentReference?: string;
  publicationTitle: string;
  description?: string;
  imageUrl: string;
  publicationPhone?: string;
  publicationEmail?: string;
  targetUrl?: string;
  placement: AdvertisementPlacement;
  startAt?: string;
  endAt?: string;
}
