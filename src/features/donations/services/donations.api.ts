import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  DonationArchiveAnalyticsFilters,
  DonationArchiveAnalyticsRecord,
  DonationArchiveEntry,
  DonationCampaign,
  DonationCampaignDetails,
  DonationCampaignFilters,
  DonationCampaignListResult,
  DonationCampaignStatus,
  DonationCampaignTimelineEvent,
  DonationSummary,
} from '../types';

type R = Record<string, unknown>;
const rec = (v: unknown): R => v && typeof v === 'object' && !Array.isArray(v) ? v as R : {};
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const str = (...v: unknown[]): string | undefined => v.find((x) => typeof x === 'string' && x.trim()) as string | undefined;
const num = (...v: unknown[]): number | undefined => { for (const x of v) { const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : NaN; if (Number.isFinite(n)) return n; } return undefined; };
const id = (...v: unknown[]): string => String(v.find((x) => x !== null && x !== undefined && String(x).trim()) ?? '');
const unwrap = (v: unknown): unknown => { const r = rec(v); return r.data ?? r.result ?? r.value ?? v; };
const now = () => new Date().toISOString();

function status(v: unknown): DonationCampaignStatus {
  const raw = String(v ?? '').trim().toUpperCase();
  if (raw === '2' || raw.includes('PUBLISH') || raw.includes('APPROV')) return 'PUBLISHED';
  if (raw === '4' || raw.includes('REJECT')) return 'REJECTED';
  if (raw === '5' || raw.includes('CLOSE') || raw.includes('COMPLETE')) return 'CLOSED';
  if (raw.includes('DELETE')) return 'DELETED';
  return 'PENDING_REVIEW';
}
function media(v: unknown, campaignId: string, index: number) {
  const x = rec(v); const url = resolveMediaUrl(str(x.url, x.fileUrl, x.imageUrl, typeof v === 'string' ? v : undefined));
  return { id: id(x.id, x.mediaId, `${campaignId}-${index}`), type: 'IMAGE' as const, url, alt: str(x.alt, x.altText, x.caption) ?? 'صورة حملة التبرع' };
}
function campaign(v: unknown): DonationCampaign {
  const x = rec(v); const publisher = rec(x.publisher ?? x.user ?? x.createdByUser); const org = rec(x.beneficiaryOrganization ?? x.organization);
  const campaignId = id(x.id, x.campaignId);
  const createdAt = str(x.createdAt, x.creationTime, x.submittedAt) ?? now();
  const updatedAt = str(x.updatedAt, x.lastModificationTime, x.reviewedAt) ?? createdAt;
  return {
    id: campaignId,
    title: str(x.title, x.name) ?? 'حملة تبرع', description: str(x.description, x.details) ?? '',
    publisher: { id: id(publisher.id, x.userId, x.publisherId), name: str(publisher.name, publisher.fullName, x.publisherName, x.userName) ?? 'مستخدم' },
    beneficiaryOrganization: { id: id(org.id, x.organizationId, x.beneficiaryOrganizationId), name: str(org.name, org.organizationName, x.organizationName, x.beneficiaryOrganizationName) ?? 'جمعية' },
    media: arr(x.media ?? x.images ?? x.attachments).map((m, i) => media(m, campaignId, i)),
    status: status(x.status), targetAmountMinor: num(x.targetAmountMinor, x.targetAmount, x.goalAmount), raisedAmountMinor: num(x.raisedAmountMinor, x.raisedAmount, x.totalDonations, x.collectedAmount) ?? 0,
    currency: 'SYP', donorCount: num(x.donorCount, x.donorsCount, x.totalDonors) ?? 0,
    submittedAt: str(x.submittedAt, x.createdAt, x.creationTime) ?? createdAt, reviewedAt: str(x.reviewedAt), publishedAt: str(x.publishedAt, x.approvedAt), closedAt: str(x.closedAt), rejectionReason: str(x.rejectionReason, x.reason),
    createdAt, updatedAt,
  };
}
function list(payload: unknown, filters: DonationCampaignFilters): DonationCampaignListResult {
  const b = rec(unwrap(payload)); const items = arr(b.items ?? b.campaigns ?? b.data ?? unwrap(payload)).map(campaign);
  const total = num(b.total, b.totalCount, b.count) ?? items.length; const page = num(b.page, b.pageNumber) ?? filters.page; const pageSize = num(b.pageSize, b.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}
function donor(v: unknown): DonationArchiveEntry { const x = rec(v); const anonymous = Boolean(x.anonymous ?? x.isAnonymous); return { id: id(x.id, x.donationId), displayName: anonymous ? 'متبرع مجهول' : str(x.displayName, x.donorName, rec(x.user).name, rec(x.user).fullName) ?? 'متبرع', anonymous, amountMinor: num(x.amountMinor, x.amount) ?? 0, currency: 'SYP', donatedAt: str(x.donatedAt, x.createdAt, x.creationTime) ?? now() }; }
function event(v: unknown, fallbackId: string): DonationCampaignTimelineEvent { const x = rec(v); return { id: id(x.id, x.eventId, `${fallbackId}-${Math.random()}`), title: str(x.title, x.action, x.event) ?? 'تحديث الحملة', actor: str(x.actor, x.actorName, rec(x.actor).name), timestamp: str(x.timestamp, x.createdAt, x.creationTime) ?? now(), details: str(x.details, x.description, x.note), tone: str(x.tone) as DonationCampaignTimelineEvent['tone'] }; }
function details(payload: unknown): DonationCampaignDetails | null { const raw = unwrap(payload); if (raw == null) return null; const b = rec(raw); const c = campaign(b.campaign ?? b); return { campaign: c, donors: arr(b.donors ?? b.donations ?? b.archive).map(donor), timeline: arr(b.timeline ?? b.events ?? b.activity).map((v) => event(v, c.id)) }; }
function summary(payload: unknown): DonationSummary { const b = rec(unwrap(payload)); const totalAmount = num(b.totalAmountMinor, b.totalAmount, b.totalDonations, rec(b.total).amountMinor) ?? 0; const monthAmount = num(b.thisMonthAmountMinor, b.thisMonthAmount, b.monthTotal, rec(b.thisMonth).amountMinor) ?? 0; return { total: totalAmount ? [{ currency: 'SYP', amountMinor: totalAmount }] : [], thisMonth: monthAmount ? [{ currency: 'SYP', amountMinor: monthAmount }] : [], completed: num(b.completed, b.completedDonations, b.completedCount) ?? 0, pending: num(b.pending, b.pendingCount) ?? 0, publishedCampaigns: num(b.publishedCampaigns, b.publishedCount, b.activeCampaigns) ?? 0, donorCount: num(b.donorCount, b.donorsCount, b.totalDonors) ?? 0 }; }
function qs(filters: DonationCampaignFilters) { const q = new URLSearchParams(); if (filters.search.trim()) q.set('search', filters.search.trim()); const statusMap: Record<DonationCampaignStatus, string> = { PENDING_REVIEW: '1', PUBLISHED: '2', CLOSED: '4', REJECTED: '5', DELETED: '' }; if (filters.status && filters.status !== 'DELETED') q.set('status', statusMap[filters.status]); if (filters.organizationId && /^\d+$/.test(filters.organizationId)) q.set('organizationId', filters.organizationId); if (filters.dateFrom) q.set('dateFrom', filters.dateFrom); if (filters.dateTo) q.set('dateTo', filters.dateTo); if (filters.sortBy) q.set('sortBy', filters.sortBy); if (filters.sortDirection) q.set('sortDirection', filters.sortDirection); q.set('page', String(filters.page)); q.set('pageSize', String(filters.pageSize)); return q.toString(); }

export async function getDonationCampaigns(filters: DonationCampaignFilters, signal?: AbortSignal) { return list(await apiClient.get<unknown>(`/api/dashboard/donation-campaigns?${qs(filters)}`, signal), filters); }
export async function getDonationSummary(_filters?: Partial<DonationCampaignFilters>, signal?: AbortSignal) { return summary(await apiClient.get<unknown>('/api/dashboard/donation-campaigns/summary', signal)); }
export async function getDonationCampaignById(campaignId: string, signal?: AbortSignal) { return details(await apiClient.get<unknown>(`/api/dashboard/donation-campaigns/${encodeURIComponent(campaignId)}`, signal)); }
export async function approveDonationCampaign(campaignId: string) { await apiClient.post(`/api/dashboard/donation-campaigns/${encodeURIComponent(campaignId)}/approve`); return getDonationCampaignById(campaignId); }
export async function rejectDonationCampaign(campaignId: string, reason: string) { await apiClient.post(`/api/dashboard/donation-campaigns/${encodeURIComponent(campaignId)}/reject`, { reason }); return getDonationCampaignById(campaignId); }
export async function deleteDonationCampaign(campaignId: string, reason: string) { return apiClient.delete(`/api/dashboard/donation-campaigns/${encodeURIComponent(campaignId)}`, { reason }); }

export async function getDonations(filters: DonationArchiveAnalyticsFilters, signal?: AbortSignal): Promise<{ items: DonationArchiveAnalyticsRecord[]; total: number; page: number; pageSize: number; pageCount: number }> {
  const q = new URLSearchParams(); if (filters.search?.trim()) q.set('search', filters.search.trim()); if (filters.organizationId && /^\d+$/.test(filters.organizationId)) q.set('organizationId', filters.organizationId); if (filters.dateFrom) q.set('dateFrom', filters.dateFrom); if (filters.dateTo) q.set('dateTo', filters.dateTo); q.set('page', String(filters.page)); q.set('pageSize', String(filters.pageSize));
  const payload = await apiClient.get<unknown>(`/api/dashboard/donations?${q}`, signal); const b = rec(unwrap(payload));
  const items = arr(b.items ?? b.donations ?? b.data ?? unwrap(payload)).map((v): DonationArchiveAnalyticsRecord => { const x = rec(v); const org = rec(x.beneficiary ?? x.organization); return { id: id(x.id, x.donationId), amountMinor: num(x.amountMinor, x.amount) ?? 0, currency: 'SYP', status: 'COMPLETED', purpose: 'GENERAL', beneficiary: { type: 'ORGANIZATION', id: id(org.id, x.organizationId), name: str(org.name, org.organizationName, x.organizationName) ?? 'جمعية' }, createdAt: str(x.createdAt, x.creationTime, x.donatedAt) ?? now() }; });
  const total = num(b.total, b.totalCount, b.count) ?? items.length; const page = num(b.page, b.pageNumber) ?? filters.page; const pageSize = num(b.pageSize, b.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}
