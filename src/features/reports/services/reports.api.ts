import { apiClient } from '@/services/api/client';
import type {
  AdminStatusOverrideInput,
  DeleteReportInput,
  EligibleOrganization,
  Report,
  ReportDetails,
  ReportFilters,
  ReportListResult,
  ReportNote,
  ReportStatus,
  ReportSummary,
  ReportTimelineEvent,
} from '../types';

type JsonRecord = Record<string, unknown>;
const rec = (v: unknown): JsonRecord => v && typeof v === 'object' && !Array.isArray(v) ? v as JsonRecord : {};
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const str = (...v: unknown[]): string | undefined => v.find((x) => typeof x === 'string' && x.trim()) as string | undefined;
const num = (...v: unknown[]): number | undefined => { for (const x of v) { const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : Number.NaN; if (Number.isFinite(n)) return n; } return undefined; };
const ident = (...v: unknown[]): string => String(v.find((x) => x !== null && x !== undefined && String(x).trim()) ?? '');
const iso = () => new Date().toISOString();
const unwrap = (payload: unknown): unknown => { const r = rec(payload); return r.data ?? r.result ?? r.value ?? payload; };

function status(value: unknown): ReportStatus {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw.includes('CLOSE') || raw.includes('RESOLV') || raw === '3') return 'CLOSED';
  if (raw.includes('RECEIV') || raw.includes('ARRIV') || raw === '2') return 'RECEIVED';
  return 'EN_ROUTE';
}
function animal(value: unknown): Report['animalType'] {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw.includes('CAT') || raw === '2') return 'CAT';
  if (raw.includes('BIRD') || raw === '3') return 'BIRD';
  if (raw.includes('OTHER') || raw === '4') return 'OTHER';
  return 'DOG';
}
function normalizeReport(value: unknown): Report {
  const item = rec(value); const reporter = rec(item.reporter ?? item.user ?? item.createdByUser); const org = rec(item.assignedOrganization ?? item.organization); const location = rec(item.location);
  const createdAt = str(item.createdAt, item.creationTime, item.submittedAt) ?? iso();
  const updatedAt = str(item.updatedAt, item.lastModificationTime, item.modifiedAt) ?? createdAt;
  return {
    id: ident(item.id, item.reportId),
    status: status(item.status ?? item.reportStatus),
    severity: (String(item.severity ?? item.priority ?? 'MEDIUM').toUpperCase() as Report['severity']),
    animalType: animal(item.animalType ?? item.species ?? rec(item.animal).species),
    animalDescription: str(item.animalDescription, item.animalDetails, rec(item.animal).description),
    title: str(item.title, item.subject) ?? 'بلاغ إنقاذ',
    description: str(item.description, item.details) ?? '',
    governorate: str(item.governorate, item.governorateName, rec(item.governorate).nameAr, rec(item.governorate).name, location.governorateName) ?? '',
    city: str(item.city, item.areaName, rec(item.area).nameAr, rec(item.area).name, location.areaName),
    address: str(item.address, location.address) ?? '',
    latitude: num(item.latitude, location.latitude) ?? 0,
    longitude: num(item.longitude, location.longitude) ?? 0,
    reporter: {
      id: ident(reporter.id, item.userId, item.reporterId),
      name: str(reporter.name, reporter.fullName, item.reporterName) ?? 'مستخدم',
      phone: str(reporter.phone, reporter.phoneNumber, item.reporterPhone),
      email: str(reporter.email, item.reporterEmail),
      isGuest: Boolean(reporter.isGuest ?? item.isGuest ?? !ident(reporter.id, item.userId)),
    },
    assignedOrganization: Object.keys(org).length || item.organizationId ? { id: ident(org.id, item.organizationId), name: str(org.name, org.organizationName, item.organizationName) ?? 'جمعية' } : undefined,
    media: arr(item.media ?? item.attachments ?? item.images).map((m, index) => { const x = rec(m); const url = str(x.url, x.fileUrl, x.imageUrl, typeof m === 'string' ? m : undefined) ?? ''; return { id: ident(x.id, x.mediaId, `${ident(item.id, item.reportId)}-${index}`), type: String(x.type ?? x.mediaType ?? 'IMAGE').toUpperCase().includes('VIDEO') ? 'VIDEO' : 'IMAGE', url, thumbnailUrl: str(x.thumbnailUrl), createdAt: str(x.createdAt, x.creationTime) ?? createdAt }; }),
    createdAt, updatedAt,
    verifiedAt: str(item.verifiedAt), assignedAt: str(item.assignedAt), receivedAt: str(item.receivedAt), closedAt: str(item.closedAt, item.resolvedAt),
    internalNotesCount: num(item.internalNotesCount, item.notesCount) ?? 0,
    rejectionReason: str(item.rejectionReason, item.reason),
  };
}
function normalizeList(payload: unknown, filters: ReportFilters): ReportListResult {
  const body = rec(unwrap(payload)); const items = arr(body.items ?? body.reports ?? body.data ?? unwrap(payload)).map(normalizeReport);
  const total = num(body.total, body.totalCount, body.count) ?? items.length; const page = num(body.page, body.pageNumber) ?? filters.page; const pageSize = num(body.pageSize, body.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}
function normalizeSummary(payload: unknown): ReportSummary {
  const b = rec(unwrap(payload)); return { todayCount: num(b.todayCount, b.today, b.reportsToday) ?? 0, unassignedCount: num(b.unassignedCount, b.unassigned) ?? 0, enRouteCount: num(b.enRouteCount, b.enRoute, b.activeCount) ?? 0, receivedTodayCount: num(b.receivedTodayCount, b.receivedToday) ?? 0 };
}
function note(v: unknown): ReportNote { const x = rec(v); const a = rec(x.admin ?? x.actor ?? x.createdBy); return { id: ident(x.id, x.noteId, crypto.randomUUID()), adminName: str(x.adminName, x.actorName, a.name, a.fullName) ?? 'مسؤول النظام', adminRole: str(x.adminRole, x.actorRole, a.role, a.roleName) ?? 'مسؤول', createdAt: str(x.createdAt, x.creationTime) ?? iso(), note: str(x.note, x.body, x.text) ?? '' }; }
function timeline(v: unknown): ReportTimelineEvent { const x = rec(v); return { id: ident(x.id, crypto.randomUUID()), action: str(x.action, x.title, x.event) ?? 'تحديث', actor: str(x.actor, x.actorName, rec(x.actor).name), timestamp: str(x.timestamp, x.createdAt, x.creationTime) ?? iso(), details: str(x.details, x.description, x.note), tone: str(x.tone) as ReportTimelineEvent['tone'] }; }
function normalizeDetails(payload: unknown): ReportDetails | null { const raw = unwrap(payload); if (raw == null) return null; const b = rec(raw); return { report: normalizeReport(b.report ?? b), timeline: arr(b.timeline ?? b.activity ?? b.events).map(timeline), notes: arr(b.notes ?? b.internalNotes).map(note) }; }
function org(v: unknown): EligibleOrganization { const x = rec(v); return { id: ident(x.id, x.organizationId), name: str(x.name, x.organizationName) ?? 'جمعية', governorate: str(x.governorate, x.governorateName, rec(x.governorate).nameAr) ?? '', distanceKm: num(x.distanceKm, x.distance), activeReports: num(x.activeReports, x.activeReportsCount) ?? 0, availability: String(x.availability ?? x.status ?? 'AVAILABLE').toUpperCase().includes('UNAVAILABLE') ? 'UNAVAILABLE' : String(x.availability ?? x.status ?? '').toUpperCase().includes('LIMIT') ? 'LIMITED' : 'AVAILABLE' }; }
function qs(filters: ReportFilters) { const p = new URLSearchParams(); if (filters.search.trim()) p.set('search', filters.search.trim()); if (filters.status) p.set('status', filters.status); if (filters.governorate && /^\d+$/.test(filters.governorate)) p.set('governorateId', filters.governorate); if (filters.organizationId) p.set('organizationId', filters.organizationId); p.set('page', String(filters.page)); p.set('pageSize', String(filters.pageSize)); return p.toString(); }

export async function getReports(filters: ReportFilters, signal?: AbortSignal) { return normalizeList(await apiClient.get<unknown>(`/api/dashboard/reports?${qs(filters)}`, signal), filters); }
export async function getReportSummary(signal?: AbortSignal) { return normalizeSummary(await apiClient.get<unknown>('/api/dashboard/reports/summary', signal)); }
export async function getReportById(id: string, signal?: AbortSignal) { return normalizeDetails(await apiClient.get<unknown>(`/api/dashboard/reports/${encodeURIComponent(id)}`, signal)); }
export async function getEligibleOrganizations(search: string, signal?: AbortSignal) { const q = new URLSearchParams(); if (search.trim()) q.set('search', search.trim()); const payload = await apiClient.get<unknown>(`/api/dashboard/reports/eligible-organizations${q.size ? `?${q}` : ''}`, signal); const body = rec(unwrap(payload)); return arr(body.items ?? body.organizations ?? body.data ?? unwrap(payload)).map(org); }
export async function assignReport(id: string, organizationId: string) { await apiClient.post(`/api/dashboard/reports/${encodeURIComponent(id)}/assign`, { organizationId: Number(organizationId), note: null }); return getReportById(id); }
export async function adminOverrideReportStatus(id: string, input: AdminStatusOverrideInput) { await apiClient.patch(`/api/dashboard/reports/${encodeURIComponent(id)}/status`, { status: input.status, reason: input.reason }); return getReportById(id); }
export async function deleteReport(id: string, input: DeleteReportInput) { return apiClient.delete(`/api/dashboard/reports/${encodeURIComponent(id)}`, { reason: input.reason }); }
export async function addReportNote(id: string, value: string) { const payload = await apiClient.post<unknown>(`/api/dashboard/reports/${encodeURIComponent(id)}/notes`, { note: value }); const raw = unwrap(payload); return note(Object.keys(rec(raw)).length ? raw : { note: value }); }
