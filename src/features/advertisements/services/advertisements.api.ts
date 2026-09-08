import type { AdminSession } from '@/features/auth/session';
import { apiClient } from '@/services/api/client';
import type {
  Advertisement,
  AdvertisementAdvertiserSummary,
  AdvertisementDetails,
  AdvertisementFilters,
  AdvertisementListResult,
  AdvertisementPlacement,
  AdvertisementStatus,
  AdvertisementSummary,
  AdvertisementTimelineEvent,
  CreateAdvertisementInput,
} from '../types';

type R = Record<string, unknown>;
const rec = (v: unknown): R => v && typeof v === 'object' && !Array.isArray(v) ? v as R : {};
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const str = (...v: unknown[]): string | undefined => v.find((x) => typeof x === 'string' && x.trim()) as string | undefined;
const num = (...v: unknown[]): number | undefined => { for (const x of v) { const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : NaN; if (Number.isFinite(n)) return n; } return undefined; };
const bool = (...v: unknown[]): boolean | undefined => v.find((x) => typeof x === 'boolean') as boolean | undefined;
const id = (...v: unknown[]): string => String(v.find((x) => x !== null && x !== undefined && String(x).trim()) ?? '');
const unwrap = (v: unknown): unknown => { const r = rec(v); return r.data ?? r.result ?? r.value ?? v; };
const now = () => new Date().toISOString();

const statusMap: Record<string, AdvertisementStatus> = {
  '1': 'DRAFT', '2': 'ACTIVE', '3': 'PAUSED', '4': 'EXPIRED', '5': 'REJECTED',
  DRAFT: 'DRAFT', PENDING: 'PENDING_REVIEW', PENDING_REVIEW: 'PENDING_REVIEW', SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE', PAUSED: 'PAUSED', EXPIRED: 'EXPIRED', REJECTED: 'REJECTED', DELETED: 'DELETED',
};
const placementMap: Record<string, AdvertisementPlacement> = {
  '1': 'HOME_BANNER', '2': 'ADOPTION', '3': 'ORGANIZATIONS', '4': 'MAP', '5': 'SEARCH',
  HOME_BANNER: 'HOME_BANNER', ADOPTION: 'ADOPTION', ORGANIZATIONS: 'ORGANIZATIONS', MAP: 'MAP', SEARCH: 'SEARCH',
};
const placementToApi: Record<AdvertisementPlacement, number> = { HOME_BANNER: 1, ADOPTION: 2, ORGANIZATIONS: 3, MAP: 4, SEARCH: 5 };
const paymentToApi = { CASH: 1, TRANSFER: 2 } as const;

function normalizeStatus(v: unknown): AdvertisementStatus {
  const raw = String(v ?? '').trim().toUpperCase();
  return statusMap[raw] ?? 'DRAFT';
}
function normalizePlacement(v: unknown): AdvertisementPlacement {
  const raw = String(v ?? '').trim().toUpperCase();
  return placementMap[raw] ?? 'HOME_BANNER';
}
function normalizeAd(v: unknown): Advertisement {
  const x = rec(v); const advertiser = rec(x.advertiser ?? x.user ?? x.owner); const creative = rec(x.creative); const performance = rec(x.performance);
  const createdAt = str(x.createdAt, x.creationTime, x.startDate) ?? now();
  const updatedAt = str(x.updatedAt, x.lastModificationTime) ?? createdAt;
  const imageUrl = str(creative.imageUrl, x.imageUrl, x.coverImageUrl, arr(x.imageUrls)[0]) ?? '';
  const paid = bool(x.paid, x.isPaid) ?? false;
  const paymentRaw = String(x.paymentMethod ?? x.paymentType ?? '').toUpperCase();
  return {
    id: id(x.id, x.advertisementId),
    advertiser: { type: 'CLIENT', id: id(advertiser.id, x.userId) || undefined, name: str(advertiser.name, advertiser.fullName, x.ownerName, x.userName, x.advertiserName) ?? 'معلن' },
    ownerName: str(x.ownerName, x.advertiserName, advertiser.name, advertiser.fullName) ?? 'معلن',
    ownerPhone: str(x.ownerPhone, x.contactPhone, advertiser.phone, advertiser.phoneNumber) ?? '',
    agreedAmountMinor: num(x.agreedAmountMinor, x.amountMinor, x.amount) ?? 0,
    currency: 'SYP', paid,
    paymentMethod: paymentRaw.includes('TRANSFER') || paymentRaw === '2' ? 'TRANSFER' : 'CASH',
    transferReference: str(x.transferReference, x.paymentReference),
    title: str(x.title, x.publicationTitle) ?? 'إعلان',
    description: str(x.description),
    creative: { type: String(creative.type ?? x.creativeType ?? '').toUpperCase().includes('IMAGE') ? 'IMAGE' : 'BANNER', imageUrl, galleryUrls: arr(creative.galleryUrls ?? x.imageUrls).map(String).filter(Boolean), altText: str(creative.altText, x.title) ?? 'إعلان', callToActionLabel: str(creative.callToActionLabel, x.callToActionLabel) },
    placement: normalizePlacement(x.placement ?? x.position),
    publicationPhone: str(x.publicationPhone, x.contactPhone), publicationEmail: str(x.publicationEmail, x.contactEmail),
    publicationTitle: str(x.publicationTitle, x.title) ?? 'إعلان', websiteUrl: str(x.websiteUrl, x.website),
    startAt: str(x.startAt, x.startDate), endAt: str(x.endAt, x.endDate), status: normalizeStatus(x.status),
    createdAt, updatedAt, activatedAt: str(x.activatedAt), pausedAt: str(x.pausedAt), pauseReason: str(x.pauseReason, x.reason), expiredAt: str(x.expiredAt),
    performance: Object.keys(performance).length ? { impressions: num(performance.impressions), clicks: num(performance.clicks), clickThroughRate: num(performance.clickThroughRate, performance.ctr), mockData: false } : undefined,
  };
}
function normalizeList(payload: unknown, filters: AdvertisementFilters): AdvertisementListResult {
  const b = rec(unwrap(payload)); const items = arr(b.items ?? b.advertisements ?? b.data ?? unwrap(payload)).map(normalizeAd);
  const total = num(b.total, b.totalCount, b.count) ?? items.length; const page = num(b.page, b.pageNumber) ?? filters.page; const pageSize = num(b.pageSize, b.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}
function normalizeSummary(payload: unknown): AdvertisementSummary {
  const b = rec(unwrap(payload)); return {
    draft: num(b.draft, b.draftCount) ?? 0, pendingReview: num(b.pendingReview, b.pendingReviewCount, b.pending) ?? 0,
    scheduled: num(b.scheduled, b.scheduledCount) ?? 0, active: num(b.active, b.activeCount) ?? 0,
    paused: num(b.paused, b.pausedCount) ?? 0, expired: num(b.expired, b.expiredCount) ?? 0,
    rejected: num(b.rejected, b.rejectedCount) ?? 0, unpaid: num(b.unpaid, b.unpaidCount) ?? 0,
  };
}
function timeline(v: unknown, fallbackId: string): AdvertisementTimelineEvent { const x = rec(v); return { id: id(x.id, x.eventId, `${fallbackId}-${Math.random()}`), title: str(x.title, x.action, x.event) ?? 'تحديث الإعلان', actor: str(x.actor, x.actorName, rec(x.actor).name), timestamp: str(x.timestamp, x.createdAt, x.creationTime) ?? now(), details: str(x.details, x.description, x.note), tone: str(x.tone) as AdvertisementTimelineEvent['tone'] }; }
function normalizeDetails(payload: unknown): AdvertisementDetails | undefined { const raw = unwrap(payload); if (raw == null) return undefined; const b = rec(raw); const advertisement = normalizeAd(b.advertisement ?? b); return { advertisement, timeline: arr(b.timeline ?? b.events ?? b.activity).map((v) => timeline(v, advertisement.id)) }; }
function qs(filters: AdvertisementFilters) { const q = new URLSearchParams(); if (filters.search.trim()) q.set('search', filters.search.trim()); if (filters.status) q.set('status', filters.status); if (filters.placement) q.set('placement', filters.placement); q.set('page', String(filters.page)); q.set('pageSize', String(filters.pageSize)); return q.toString(); }

export async function getAdvertisements(filters: AdvertisementFilters, signal?: AbortSignal) { return normalizeList(await apiClient.get<unknown>(`/api/dashboard/advertisements?${qs(filters)}`, signal), filters); }
export async function getAdvertisementSummary(signal?: AbortSignal) { return normalizeSummary(await apiClient.get<unknown>('/api/dashboard/advertisements/summary', signal)); }
export async function getAdvertisementById(adId: string, signal?: AbortSignal) { return normalizeDetails(await apiClient.get<unknown>(`/api/dashboard/advertisements/${encodeURIComponent(adId)}`, signal)); }
export async function getAdvertiserAdvertisementSummary(type: string, advertiserId?: string, signal?: AbortSignal): Promise<AdvertisementAdvertiserSummary> {
  if (!advertiserId) return { active: 0, pending: 0, paused: 0, recent: [] };
  const b = rec(unwrap(await apiClient.get<unknown>(`/api/dashboard/advertisers/${encodeURIComponent(type)}/${encodeURIComponent(advertiserId)}/advertisements/summary`, signal)));
  return { active: num(b.active, b.activeCount) ?? 0, pending: num(b.pending, b.pendingCount) ?? 0, paused: num(b.paused, b.pausedCount) ?? 0, recent: arr(b.recent ?? b.recentAdvertisements ?? b.items).map(normalizeAd) };
}
export async function createAdvertisement(input: CreateAdvertisementInput, actor: AdminSession) {
  const payload = await apiClient.post<unknown>('/api/dashboard/advertisements', {
    userId: actor.id,
    title: input.publicationTitle, description: input.description ?? null,
    contactPhone: input.publicationPhone ?? input.ownerPhone, contactEmail: input.publicationEmail ?? null,
    placement: placementToApi[input.placement], startDate: input.startAt ?? new Date().toISOString(), endDate: input.endAt ?? new Date(Date.now() + 30 * 86400000).toISOString(),
    isPaid: input.paid, paymentMethod: paymentToApi[input.paymentMethod],
  });
  return normalizeAd(unwrap(payload));
}
export async function activateAdvertisement(adId: string) { await apiClient.post(`/api/dashboard/advertisements/${encodeURIComponent(adId)}/activate`); return getAdvertisementById(adId); }
export async function pauseAdvertisement(adId: string, reason: string) { await apiClient.post(`/api/dashboard/advertisements/${encodeURIComponent(adId)}/pause`, { reason }); return getAdvertisementById(adId); }
export async function deleteAdvertisement(adId: string, reason: string) { return apiClient.delete(`/api/dashboard/advertisements/${encodeURIComponent(adId)}`, { reason }); }
export async function addAdvertisementNote(adId: string, note: string) { return apiClient.post(`/api/dashboard/advertisements/${encodeURIComponent(adId)}/notes`, { note }); }
