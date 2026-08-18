export const feedingPointStatuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'] as const;
export type FeedingPointStatus = (typeof feedingPointStatuses)[number];

export const feedingPointCreatorTypes = ['USER', 'ORGANIZATION'] as const;
export type FeedingPointCreatorType = (typeof feedingPointCreatorTypes)[number];

export const feedingPointConditions = ['GOOD', 'NEEDS_CLEANING', 'DAMAGED', 'MISSING', 'UNKNOWN'] as const;
export type FeedingPointCondition = (typeof feedingPointConditions)[number];

export const feedingPointFoodLevels = ['FULL', 'MEDIUM', 'LOW', 'EMPTY', 'UNKNOWN'] as const;
export type FeedingPointFoodLevel = (typeof feedingPointFoodLevels)[number];

export const refillReviewStatuses = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
export type RefillReviewStatus = (typeof refillReviewStatuses)[number];

export type FeedingPointMedia = {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
};

export type FeedingPointActor = {
  type: FeedingPointCreatorType;
  id: string;
  name: string;
};

export type FeedingPointRefill = {
  id: string;
  feedingPointId: string;
  submittedBy: FeedingPointActor;
  foodLevelAfter?: Exclude<FeedingPointFoodLevel, 'UNKNOWN'>;
  waterAvailableAfter?: boolean;
  note?: string;
  media: FeedingPointMedia[];
  occurredAt: string;
  createdAt: string;
  reviewStatus: RefillReviewStatus;
  reviewedAt?: string;
  reviewedBy?: { id: string; name: string };
  rejectionReason?: string;
};

export const feedingPointIssueStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as const;
export type FeedingPointIssueStatus = (typeof feedingPointIssueStatuses)[number];
export const feedingPointIssueTypes = ['EMPTY', 'NO_WATER', 'DAMAGED', 'DIRTY', 'MISSING', 'UNSAFE_LOCATION', 'OTHER'] as const;
export type FeedingPointIssueType = (typeof feedingPointIssueTypes)[number];

export type FeedingPointIssue = {
  id: string;
  feedingPointId: string;
  type: FeedingPointIssueType;
  status: FeedingPointIssueStatus;
  description?: string;
  submittedBy: FeedingPointActor;
  media?: FeedingPointMedia[];
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  rejectionReason?: string;
};

export type FeedingPointTimelineEvent = {
  id: string;
  action: string;
  actor?: string;
  timestamp: string;
  details?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
};

export type FeedingPointInternalNote = {
  id: string;
  adminName: string;
  adminRole: string;
  createdAt: string;
  note: string;
};

export type FeedingPoint = {
  id: string;
  name?: string;
  status: FeedingPointStatus;
  description?: string;
  location: {
    governorate: string;
    city?: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  createdBy: FeedingPointActor;
  media: FeedingPointMedia[];
  condition?: FeedingPointCondition;
  foodLevel?: FeedingPointFoodLevel;
  waterAvailable?: boolean;
  lastVerifiedRefillAt?: string;
  latestRefillReportAt?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  inactiveReason?: string;
  reviewMetadata?: { nearbyPointId?: string; distanceMeters?: number };
};

export type FeedingPointDetails = {
  point: FeedingPoint;
  refills: FeedingPointRefill[];
  issues: FeedingPointIssue[];
  timeline: FeedingPointTimelineEvent[];
  notes: FeedingPointInternalNote[];
};

export type FeedingPointFilters = {
  search: string;
  status?: FeedingPointStatus;
  creatorType?: FeedingPointCreatorType;
  governorate?: string;
  pendingRefills?: boolean;
  organizationId?: string;
  hasOpenIssues?: boolean;
  updatedFrom?: string;
  updatedTo?: string;
  page: number;
  pageSize: number;
  sortBy?: 'updatedAt' | 'createdAt' | 'status' | 'name';
  sortDirection?: 'asc' | 'desc';
};

export type FeedingPointListRow = FeedingPoint & {
  pendingRefillsCount: number;
  verifiedRefillsCount: number;
  openIssuesCount: number;
  needsRefill: boolean;
};

export type FeedingPointListResult = {
  items: FeedingPointListRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type FeedingPointSummary = {
  pendingPoints: number;
  pendingRefills: number;
  activePoints: number;
  inactivePoints: number;
};

export type RejectFeedingPointInput = { reason: string; otherReason?: string };
export type DeactivateFeedingPointInput = { reason: string; otherReason?: string };
export type ReviewRefillInput = { decision: 'VERIFY' | 'REJECT'; reason?: string };
export type ResolveIssueInput = { resolutionNote: string };
export type RejectIssueInput = { reason: string; otherReason?: string };
