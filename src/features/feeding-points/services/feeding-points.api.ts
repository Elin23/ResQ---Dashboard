import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  DeactivateFeedingPointInput,
  FeedingPoint,
  FeedingPointDetails,
  FeedingPointFilters,
  FeedingPointInternalNote,
  FeedingPointIssue,
  FeedingPointIssueStatus,
  FeedingPointIssueType,
  FeedingPointListResult,
  FeedingPointMedia,
  FeedingPointRefill,
  FeedingPointStatus,
  FeedingPointSummary,
  FeedingPointTimelineEvent,
  RejectFeedingPointInput,
  RejectIssueInput,
  ResolveIssueInput,
  ReviewRefillInput,
} from '../types';

type JsonRecord = Record<string, unknown>;
const rec = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (...values: unknown[]): string | undefined => values.find((value) => typeof value === 'string' && value.trim()) as string | undefined;
const num = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};
const bool = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1' || String(value).toLowerCase() === 'true') return true;
    if (value === 0 || value === '0' || String(value).toLowerCase() === 'false') return false;
  }
  return undefined;
};
const ident = (...values: unknown[]): string => String(values.find((value) => value !== null && value !== undefined && String(value).trim()) ?? '');
const iso = () => new Date().toISOString();
const unwrap = (payload: unknown): unknown => {
  const body = rec(payload);
  return body.data ?? body.result ?? body.value ?? payload;
};

function normalizeStatus(value: unknown): FeedingPointStatus {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw === '1' || raw.includes('PEND')) return 'PENDING';
  if (raw === '2' || raw.includes('ACTIVE') || raw.includes('APPROV')) return 'ACTIVE';
  if (raw === '3' || raw.includes('INACTIVE') || raw.includes('DISABL') || raw.includes('DEACT')) return 'INACTIVE';
  if (raw === '4' || raw.includes('REJECT')) return 'REJECTED';
  return 'PENDING';
}

function normalizeMedia(value: unknown, parentId: string, index: number, fallbackDate: string): FeedingPointMedia {
  const item = rec(value);
  const url = resolveMediaUrl(str(item.url, item.fileUrl, item.mediaUrl, item.imageUrl, typeof value === 'string' ? value : undefined));
  const rawType = String(item.type ?? item.mediaType ?? '').toUpperCase();
  return {
    id: ident(item.id, item.mediaId, `${parentId}-media-${index}`),
    type: rawType.includes('VIDEO') ? 'VIDEO' : 'IMAGE',
    url,
    thumbnailUrl: resolveMediaUrl(str(item.thumbnailUrl, item.previewUrl)) || undefined,
    caption: str(item.caption, item.description),
    createdAt: str(item.createdAt, item.creationTime) ?? fallbackDate,
  };
}

function normalizeActor(value: unknown, fallback: JsonRecord = {}) {
  const actor = rec(value);
  const organization = rec(actor.organization ?? fallback.organization);
  const rawType = String(actor.type ?? actor.creatorType ?? fallback.creatorType ?? fallback.ownerType ?? '').toUpperCase();
  const isOrganization = rawType.includes('ORG') || Boolean(ident(organization.id, fallback.organizationId));
  return {
    type: isOrganization ? 'ORGANIZATION' as const : 'USER' as const,
    id: ident(actor.id, actor.userId, actor.organizationId, organization.id, fallback.createdById, fallback.userId, fallback.organizationId),
    name: str(actor.name, actor.fullName, actor.organizationName, organization.name, organization.organizationName, fallback.createdByName, fallback.ownerName) ?? (isOrganization ? 'جمعية' : 'مستخدم'),
  };
}

function normalizePoint(value: unknown): FeedingPoint {
  const item = rec(value);
  const location = rec(item.location);
  const governorate = rec(item.governorate ?? location.governorate);
  const area = rec(item.area ?? item.region ?? location.area ?? location.region);
  const createdAt = str(item.createdAt, item.creationTime, item.submittedAt) ?? iso();
  const updatedAt = str(item.updatedAt, item.lastModificationTime, item.modifiedAt) ?? createdAt;
  const id = ident(item.id, item.foodPointId, item.feedingPointId);
  const rawCondition = String(item.condition ?? item.pointCondition ?? '').toUpperCase();
  const rawLevel = String(item.foodLevel ?? item.currentFoodLevel ?? '').toUpperCase();

  return {
    id,
    name: str(item.name, item.title, item.pointName),
    status: normalizeStatus(item.status ?? item.foodPointStatus),
    description: str(item.description, item.details),
    location: {
      governorate: str(item.governorateName, governorate.nameAr, governorate.name, location.governorateName) ?? '',
      city: str(item.areaName, item.regionName, area.nameAr, area.name, location.areaName, location.city),
      address: str(item.address, location.address) ?? '',
      latitude: num(item.latitude, location.latitude, item.lat) ?? 0,
      longitude: num(item.longitude, location.longitude, item.lng, item.lon) ?? 0,
    },
    createdBy: normalizeActor(item.createdBy ?? item.creator ?? item.owner, item),
    media: arr(item.media ?? item.attachments ?? item.images).map((media, index) => normalizeMedia(media, id, index, createdAt)),
    condition: rawCondition.includes('CLEAN') ? 'NEEDS_CLEANING' : rawCondition.includes('DAMAGE') ? 'DAMAGED' : rawCondition.includes('MISS') ? 'MISSING' : rawCondition.includes('GOOD') ? 'GOOD' : 'UNKNOWN',
    foodLevel: rawLevel.includes('FULL') ? 'FULL' : rawLevel.includes('MED') ? 'MEDIUM' : rawLevel.includes('LOW') ? 'LOW' : rawLevel.includes('EMPTY') ? 'EMPTY' : 'UNKNOWN',
    waterAvailable: bool(item.waterAvailable, item.hasWater),
    lastVerifiedRefillAt: str(item.lastVerifiedRefillAt, item.lastRefillAt),
    latestRefillReportAt: str(item.latestRefillReportAt, item.latestRefillAt),
    createdAt,
    updatedAt,
    rejectionReason: str(item.rejectionReason, item.rejectReason),
    inactiveReason: str(item.inactiveReason, item.deactivationReason),
    reviewMetadata: item.nearbyPointId || item.distanceMeters ? {
      nearbyPointId: ident(item.nearbyPointId) || undefined,
      distanceMeters: num(item.distanceMeters, item.nearbyDistanceMeters),
    } : undefined,
  };
}

function normalizeRefill(value: unknown, pointId: string): FeedingPointRefill {
  const item = rec(value);
  const id = ident(item.id, item.refillId);
  const createdAt = str(item.createdAt, item.creationTime, item.submittedAt) ?? iso();
  const rawReview = String(item.reviewStatus ?? item.status ?? '').toUpperCase();
  const rawLevel = String(item.foodLevelAfter ?? item.foodLevel ?? '').toUpperCase();
  return {
    id,
    feedingPointId: ident(item.feedingPointId, item.foodPointId, pointId),
    submittedBy: normalizeActor(item.submittedBy ?? item.user ?? item.createdBy, item),
    foodLevelAfter: rawLevel.includes('FULL') ? 'FULL' : rawLevel.includes('MED') ? 'MEDIUM' : rawLevel.includes('LOW') ? 'LOW' : rawLevel.includes('EMPTY') ? 'EMPTY' : undefined,
    waterAvailableAfter: bool(item.waterAvailableAfter, item.waterAvailable, item.hasWater),
    note: str(item.note, item.description),
    media: arr(item.media ?? item.attachments ?? item.images).map((media, index) => normalizeMedia(media, id, index, createdAt)),
    occurredAt: str(item.occurredAt, item.refilledAt, item.eventTime) ?? createdAt,
    createdAt,
    reviewStatus: rawReview.includes('VERIF') || rawReview.includes('APPROV') || rawReview === '2' ? 'VERIFIED' : rawReview.includes('REJECT') || rawReview === '3' ? 'REJECTED' : 'PENDING',
    reviewedAt: str(item.reviewedAt, item.reviewDate),
    reviewedBy: (() => {
      const reviewer = rec(item.reviewedBy ?? item.reviewer);
      return Object.keys(reviewer).length || item.reviewerName ? { id: ident(reviewer.id, item.reviewerId), name: str(reviewer.name, reviewer.fullName, item.reviewerName) ?? 'مسؤول النظام' } : undefined;
    })(),
    rejectionReason: str(item.rejectionReason, item.reason),
  };
}

function issueType(value: unknown): FeedingPointIssueType {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('EMPTY')) return 'EMPTY';
  if (raw.includes('WATER')) return 'NO_WATER';
  if (raw.includes('DAMAGE')) return 'DAMAGED';
  if (raw.includes('DIRT') || raw.includes('CLEAN')) return 'DIRTY';
  if (raw.includes('MISS')) return 'MISSING';
  if (raw.includes('UNSAFE') || raw.includes('LOCATION')) return 'UNSAFE_LOCATION';
  return 'OTHER';
}
function issueStatus(value: unknown): FeedingPointIssueStatus {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('REVIEW') || raw.includes('PROGRESS') || raw === '2') return 'UNDER_REVIEW';
  if (raw.includes('RESOLV') || raw === '3') return 'RESOLVED';
  if (raw.includes('REJECT') || raw === '4') return 'REJECTED';
  return 'OPEN';
}
function normalizeIssue(value: unknown, pointId: string): FeedingPointIssue {
  const item = rec(value);
  const id = ident(item.id, item.issueId);
  const createdAt = str(item.createdAt, item.creationTime, item.submittedAt) ?? iso();
  return {
    id,
    feedingPointId: ident(item.feedingPointId, item.foodPointId, pointId),
    type: issueType(item.type ?? item.issueType),
    status: issueStatus(item.status ?? item.issueStatus),
    description: str(item.description, item.details),
    submittedBy: normalizeActor(item.submittedBy ?? item.user ?? item.createdBy, item),
    media: arr(item.media ?? item.attachments ?? item.images).map((media, index) => normalizeMedia(media, id, index, createdAt)),
    createdAt,
    resolvedAt: str(item.resolvedAt, item.closedAt),
    resolutionNote: str(item.resolutionNote, item.resolution),
    rejectionReason: str(item.rejectionReason, item.reason),
  };
}
function normalizeTimeline(value: unknown): FeedingPointTimelineEvent {
  const item = rec(value);
  return {
    id: ident(item.id, item.eventId, crypto.randomUUID()),
    action: str(item.action, item.title, item.event) ?? 'تحديث',
    actor: str(item.actorName, item.actor, rec(item.actor).name),
    timestamp: str(item.timestamp, item.createdAt, item.creationTime) ?? iso(),
    details: str(item.details, item.description, item.note),
    tone: str(item.tone) as FeedingPointTimelineEvent['tone'],
  };
}
function normalizeNote(value: unknown): FeedingPointInternalNote {
  const item = rec(value);
  const admin = rec(item.admin ?? item.actor ?? item.createdBy);
  return {
    id: ident(item.id, item.noteId, crypto.randomUUID()),
    adminName: str(item.adminName, item.actorName, admin.name, admin.fullName) ?? 'مسؤول النظام',
    adminRole: str(item.adminRole, item.actorRole, admin.role, admin.roleName) ?? 'مسؤول',
    createdAt: str(item.createdAt, item.creationTime) ?? iso(),
    note: str(item.note, item.body, item.text) ?? '',
  };
}

function normalizeList(payload: unknown, filters: FeedingPointFilters): FeedingPointListResult {
  const body = rec(unwrap(payload));
  const source = body.items ?? body.foodPoints ?? body.feedingPoints ?? body.data ?? unwrap(payload);
  const items = arr(source).map((value) => {
    const raw = rec(value);
    const point = normalizePoint(value);
    const pendingRefillsCount = num(raw.pendingRefillsCount, raw.pendingRefillCount) ?? 0;
    const verifiedRefillsCount = num(raw.verifiedRefillsCount, raw.verifiedRefillCount) ?? 0;
    const openIssuesCount = num(raw.openIssuesCount, raw.openIssueCount) ?? 0;
    return {
      ...point,
      pendingRefillsCount,
      verifiedRefillsCount,
      openIssuesCount,
      needsRefill: bool(raw.needsRefill) ?? (point.foodLevel === 'LOW' || point.foodLevel === 'EMPTY'),
    };
  });
  const filteredItems = filters.pendingRefills === undefined ? items : items.filter((item) => filters.pendingRefills ? item.pendingRefillsCount > 0 : item.pendingRefillsCount === 0);
  const total = num(body.total, body.totalCount, body.count) ?? filteredItems.length;
  const page = num(body.page, body.pageNumber) ?? filters.page;
  const pageSize = num(body.pageSize, body.maxResultCount) ?? filters.pageSize;
  return { items: filteredItems, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}

function normalizeSummary(payload: unknown): FeedingPointSummary {
  const body = rec(unwrap(payload));
  return {
    pendingPoints: num(body.pendingPoints, body.pending, body.pendingFoodPointsCount, body.pendingCount) ?? 0,
    pendingRefills: num(body.pendingRefills, body.pendingRefillsCount) ?? 0,
    activePoints: num(body.activePoints, body.active, body.activeFoodPointsCount, body.activeCount) ?? 0,
    inactivePoints: num(body.inactivePoints, body.inactive, body.disabledFoodPointsCount, body.inactiveCount, body.disabledCount) ?? 0,
  };
}

function normalizeDetails(payload: unknown): FeedingPointDetails | null {
  const raw = unwrap(payload);
  if (raw == null) return null;
  const body = rec(raw);
  const point = normalizePoint(body.point ?? body.foodPoint ?? body.feedingPoint ?? body);
  return {
    point,
    refills: arr(body.refills ?? body.refillReports).map((value) => normalizeRefill(value, point.id)),
    issues: arr(body.issues ?? body.issueReports).map((value) => normalizeIssue(value, point.id)),
    timeline: arr(body.timeline ?? body.activity ?? body.events).map(normalizeTimeline),
    notes: arr(body.notes ?? body.internalNotes).map(normalizeNote),
  };
}

const statusValue: Record<FeedingPointStatus, number> = { PENDING: 1, ACTIVE: 2, INACTIVE: 3, REJECTED: 4 };
function query(filters: FeedingPointFilters): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.status) params.set('status', String(statusValue[filters.status]));
  if (filters.governorate && /^\d+$/.test(filters.governorate)) params.set('governorateId', filters.governorate);
  if (filters.pendingRefills !== undefined) params.set('pendingRefills', String(filters.pendingRefills));
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  return params.toString();
}

export async function getFeedingPoints(filters: FeedingPointFilters, signal?: AbortSignal) {
  return normalizeList(await apiClient.get<unknown>(`/api/dashboard/feeding-points?${query(filters)}`, signal), filters);
}
export async function getFeedingPointSummary(signal?: AbortSignal) {
  return normalizeSummary(await apiClient.get<unknown>('/api/dashboard/feeding-points/summary', signal));
}
export async function getFeedingPointById(id: string, signal?: AbortSignal) {
  return normalizeDetails(await apiClient.get<unknown>(`/api/dashboard/feeding-points/${encodeURIComponent(id)}`, signal));
}
export async function approveFeedingPoint(id: string) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(id)}/approve`);
  return getFeedingPointById(id);
}
export async function rejectFeedingPoint(id: string, input: RejectFeedingPointInput) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(id)}/reject`, input);
  return getFeedingPointById(id);
}
export async function deactivateFeedingPoint(id: string, input: DeactivateFeedingPointInput) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(id)}/deactivate`, input);
  return getFeedingPointById(id);
}
export async function reactivateFeedingPoint(id: string) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(id)}/reactivate`);
  return getFeedingPointById(id);
}
export async function reviewFeedingPointRefill(pointId: string, refillId: string, input: ReviewRefillInput) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(pointId)}/refills/${encodeURIComponent(refillId)}/review`, input);
  return getFeedingPointById(pointId);
}
export async function startIssueReview(pointId: string, issueId: string) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(pointId)}/issues/${encodeURIComponent(issueId)}/review/start`);
  return getFeedingPointById(pointId);
}
export async function resolveIssue(pointId: string, issueId: string, input: ResolveIssueInput) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(pointId)}/issues/${encodeURIComponent(issueId)}/resolve`, input);
  return getFeedingPointById(pointId);
}
export async function rejectIssue(pointId: string, issueId: string, input: RejectIssueInput) {
  await apiClient.post(`/api/dashboard/feeding-points/${encodeURIComponent(pointId)}/issues/${encodeURIComponent(issueId)}/reject`, input);
  return getFeedingPointById(pointId);
}
export async function addFeedingPointNote(id: string, value: string) {
  const payload = await apiClient.post<unknown>(`/api/dashboard/feeding-points/${encodeURIComponent(id)}/notes`, { note: value });
  const raw = unwrap(payload);
  return normalizeNote(Object.keys(rec(raw)).length ? raw : { note: value });
}
