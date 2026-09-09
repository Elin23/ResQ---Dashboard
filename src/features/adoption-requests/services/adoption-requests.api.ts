import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  AdoptionApplication,
  AdoptionInternalNote,
  AdoptionRequest,
  AdoptionRequestDetails,
  AdoptionRequestFilters,
  AdoptionRequestListResult,
  AdoptionRequestStatus,
  AdoptionRequestSummary,
  AdoptionTimelineEvent,
  RejectAdoptionInput,
} from '../types';

type JsonRecord = Record<string, unknown>;
const rec = (v: unknown): JsonRecord => v && typeof v === 'object' && !Array.isArray(v) ? v as JsonRecord : {};
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const str = (...v: unknown[]): string | undefined => v.find((x) => typeof x === 'string' && x.trim()) as string | undefined;
const num = (...v: unknown[]): number | undefined => { for (const x of v) { const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : Number.NaN; if (Number.isFinite(n)) return n; } return undefined; };
const ident = (...v: unknown[]): string => String(v.find((x) => x !== null && x !== undefined && String(x).trim()) ?? '');
const iso = () => new Date().toISOString();
const unwrap = (payload: unknown): unknown => { const r = rec(payload); return r.data ?? r.result ?? r.value ?? payload; };

function status(value: unknown): AdoptionRequestStatus {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw.includes('ADOPT') || raw.includes('COMPLET') || raw === '4') return 'ADOPTED';
  if (raw.includes('REJECT') || raw === '3') return 'REJECTED';
  if (raw.includes('PUBLISH') || raw.includes('APPROV') || raw.includes('ACTIVE') || raw === '2') return 'PUBLISHED';
  return 'PENDING_REVIEW';
}
function species(value: unknown): AdoptionRequest['animal']['species'] {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw.includes('CAT') || raw === '2') return 'CAT';
  if (raw.includes('BIRD') || raw === '3') return 'BIRD';
  if (raw.includes('OTHER') || raw === '4') return 'OTHER';
  return 'DOG';
}
function accountStatus(value: unknown): AdoptionRequest['publisher']['accountStatus'] {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('SUSPEND') || raw === '2') return 'SUSPENDED';
  if (raw.includes('BLOCK') || raw === '3') return 'BLOCKED';
  if (raw.includes('DEACT') || raw.includes('DISABL') || ['4','5','6'].includes(raw)) return 'DEACTIVATED';
  return 'ACTIVE';
}
function normalizeRequest(value: unknown): AdoptionRequest {
  const item = rec(value); const animalObj = rec(item.animal); const publisher = rec(item.publisher ?? item.user ?? item.organization); const location = rec(item.location);
  const submittedAt = str(item.submittedAt, item.createdAt, item.creationTime) ?? iso();
  const updatedAt = str(item.updatedAt, item.lastModificationTime, item.modifiedAt) ?? submittedAt;
  const publisherType = String(item.publisherType ?? publisher.type ?? (item.organizationId ? 'ORGANIZATION' : 'USER')).toUpperCase().includes('ORG') ? 'ORGANIZATION' : 'USER';
  return {
    id: ident(item.id, item.adoptionRequestId, item.adoptionAdId),
    animal: {
      id: ident(animalObj.id, item.animalId),
      name: str(animalObj.name, item.animalName),
      species: species(animalObj.species ?? item.species ?? item.animalType),
      breed: str(animalObj.breed, item.breed),
      sex: (() => { const raw = String(animalObj.sex ?? animalObj.gender ?? item.sex ?? item.gender ?? 'UNKNOWN').toUpperCase(); return raw.includes('FEMALE') || raw === '2' ? 'FEMALE' : raw.includes('MALE') || raw === '1' ? 'MALE' : 'UNKNOWN'; })(),
      estimatedAgeMonths: num(animalObj.estimatedAgeMonths, animalObj.ageMonths, item.ageMonths),
      ageText: str(animalObj.age, item.age, item.animalAge),
      healthStatus: str(animalObj.healthStatus, item.healthStatus),
      vaccinated: typeof (animalObj.vaccinated ?? item.vaccinated) === 'boolean' ? Boolean(animalObj.vaccinated ?? item.vaccinated) : undefined,
      freeOfInfectiousDiseases: typeof (animalObj.freeOfInfectiousDiseases ?? item.freeOfInfectiousDiseases) === 'boolean' ? Boolean(animalObj.freeOfInfectiousDiseases ?? item.freeOfInfectiousDiseases) : undefined,
      veterinaryExamined: typeof (animalObj.veterinaryExamined ?? item.veterinaryExamined) === 'boolean' ? Boolean(animalObj.veterinaryExamined ?? item.veterinaryExamined) : undefined,
      imageUrls: arr(animalObj.imageUrls ?? item.imageUrls ?? item.images ?? animalObj.images ?? item.media).map((x) => resolveMediaUrl(typeof x === 'string' ? x : str(rec(x).url, rec(x).imageUrl, rec(x).fileUrl))).filter(Boolean),
      description: str(animalObj.description, item.animalDescription, item.description) ?? '',
    },
    publisher: {
      type: publisherType,
      id: ident(publisher.id, item.publisherId, item.userId, item.organizationId),
      name: str(publisher.name, publisher.fullName, publisher.organizationName, item.publisherName) ?? (publisherType === 'ORGANIZATION' ? 'جمعية' : 'مستخدم'),
      phone: str(publisher.phone, publisher.phoneNumber, item.contactPhone),
      email: str(publisher.email, item.contactEmail),
      city: str(publisher.city, publisher.areaName, item.city, location.areaName),
      accountStatus: accountStatus(publisher.accountStatus ?? publisher.status),
      memberSince: str(publisher.memberSince, publisher.createdAt, publisher.creationTime),
    },
    status: status(item.status ?? item.adStatus),
    submittedAt, updatedAt,
    reviewedAt: str(item.reviewedAt), completedAt: str(item.completedAt), publishedAt: str(item.publishedAt, item.approvedAt), rejectedAt: str(item.rejectedAt), adoptedAt: str(item.adoptedAt),
    location: str(item.locationName, item.location, item.address, location.address) ?? [str(item.governorateName), str(item.areaName, item.city)].filter(Boolean).join(' - '),
    requirements: str(item.requirements, item.adoptionRequirements), moderationReason: str(item.moderationReason, item.rejectionReason, item.reason),
    reviewer: Object.keys(rec(item.reviewer)).length ? { id: ident(rec(item.reviewer).id), name: str(rec(item.reviewer).name, rec(item.reviewer).fullName) ?? 'مسؤول' } : undefined,
    applicationsCount: num(item.applicationsCount, item.totalApplications) ?? 0,
    pendingApplicationsCount: num(item.pendingApplicationsCount, item.pendingApplications) ?? 0,
    acceptedApplicationId: ident(item.acceptedApplicationId) || undefined,
    internalNotesCount: num(item.internalNotesCount, item.notesCount) ?? 0,
  };
}
function normalizeList(payload: unknown, filters: AdoptionRequestFilters): AdoptionRequestListResult {
  const b = rec(unwrap(payload)); const items = arr(b.items ?? b.adoptionRequests ?? b.ads ?? b.data ?? unwrap(payload)).map(normalizeRequest); const total = num(b.total, b.totalCount, b.count) ?? items.length; const page = num(b.page, b.pageNumber) ?? filters.page; const pageSize = num(b.pageSize, b.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}
function normalizeSummary(payload: unknown): AdoptionRequestSummary { const b = rec(unwrap(payload)); return { pendingReview: num(b.pendingReview, b.pending, b.pendingReviewCount) ?? 0, published: num(b.published, b.active, b.publishedCount) ?? 0, withApplications: num(b.withApplications, b.withApplicationsCount) ?? 0, pendingApplications: num(b.pendingApplications, b.pendingApplicationsCount) ?? 0, rejected: num(b.rejected, b.rejectedCount) ?? 0, adopted: num(b.adopted, b.completed, b.adoptedCount) ?? 0 }; }
function application(v: unknown): AdoptionApplication { const x = rec(v); const applicant = rec(x.applicant ?? x.user); return { id: ident(x.id, x.applicationId), applicant: { id: ident(applicant.id, x.userId), name: str(applicant.name, applicant.fullName, x.applicantName) ?? 'مستخدم', phone: str(applicant.phone, applicant.phoneNumber), email: str(applicant.email), city: str(applicant.city, applicant.areaName), accountStatus: accountStatus(applicant.status) ?? 'ACTIVE', memberSince: str(applicant.memberSince, applicant.createdAt, applicant.creationTime) ?? iso() }, status: (() => { const raw = String(x.status ?? 'PENDING').toUpperCase(); if (raw.includes('ACCEPT') || raw === '2') return 'ACCEPTED'; if (raw.includes('REJECT') || raw === '3') return 'REJECTED'; if (raw.includes('WITHDRAW') || raw === '4') return 'WITHDRAWN'; return 'PENDING'; })(), message: str(x.message, x.note), submittedAt: str(x.submittedAt, x.createdAt, x.creationTime) ?? iso(), respondedAt: str(x.respondedAt), ownerResponse: str(x.ownerResponse, x.response), contactShared: Boolean(x.contactShared ?? x.isContactShared) }; }
function timeline(v: unknown): AdoptionTimelineEvent { const x = rec(v); const action = String(x.action ?? x.type ?? 'SUBMITTED').toUpperCase() as AdoptionTimelineEvent['action']; return { id: ident(x.id, crypto.randomUUID()), action, title: str(x.title, x.label, x.action) ?? 'تحديث', actor: str(x.actor, x.actorName, rec(x.actor).name), timestamp: str(x.timestamp, x.createdAt, x.creationTime) ?? iso(), note: str(x.note, x.details, x.description), tone: str(x.tone) as AdoptionTimelineEvent['tone'] }; }
function note(v: unknown): AdoptionInternalNote { const x = rec(v); const a = rec(x.admin ?? x.actor ?? x.createdBy); return { id: ident(x.id, x.noteId, crypto.randomUUID()), adminName: str(x.adminName, x.actorName, a.name, a.fullName) ?? 'مسؤول النظام', adminRole: str(x.adminRole, x.actorRole, a.role, a.roleName) ?? 'مسؤول', createdAt: str(x.createdAt, x.creationTime) ?? iso(), note: str(x.note, x.body, x.text) ?? '' }; }
function normalizeDetails(payload: unknown): AdoptionRequestDetails | null { const raw = unwrap(payload); if (raw == null) return null; const b = rec(raw); return { request: normalizeRequest(b.request ?? b.adoptionRequest ?? b), applications: arr(b.applications ?? b.adoptionApplications).map(application), timeline: arr(b.timeline ?? b.activity ?? b.events).map(timeline), notes: arr(b.notes ?? b.internalNotes).map(note) }; }
function statusParam(value?: AdoptionRequestStatus) { return value ? ({ PENDING_REVIEW: '1', PUBLISHED: '2', REJECTED: '3', ADOPTED: '4' } as const)[value] : undefined; }
function qs(filters: AdoptionRequestFilters) { const p = new URLSearchParams(); if (filters.search.trim()) p.set('search', filters.search.trim()); const s = statusParam(filters.status); if (s) p.set('status', s); if (filters.city && /^\d+$/.test(filters.city)) p.set('governorateId', filters.city); if (filters.species) p.set('species', filters.species); if (filters.publisherType) p.set('publisherType', filters.publisherType); if (filters.organizationId) p.set('organizationId', filters.organizationId); if (filters.userId) p.set('userId', filters.userId); if (filters.dateFrom) p.set('dateFrom', filters.dateFrom); if (filters.dateTo) p.set('dateTo', filters.dateTo); if (filters.sortBy) p.set('sortBy', filters.sortBy); if (filters.sortDirection) p.set('sortDirection', filters.sortDirection); p.set('page', String(filters.page)); p.set('pageSize', String(filters.pageSize)); return p.toString(); }

export async function getAdoptionRequests(filters: AdoptionRequestFilters, signal?: AbortSignal) { return normalizeList(await apiClient.get<unknown>(`/api/dashboard/adoption-requests?${qs(filters)}`, signal), filters); }
export async function getAdoptionRequestById(id: string, signal?: AbortSignal) { return normalizeDetails(await apiClient.get<unknown>(`/api/dashboard/adoption-requests/${encodeURIComponent(id)}`, signal)); }
export async function getAdoptionRequestSummary(signal?: AbortSignal) { return normalizeSummary(await apiClient.get<unknown>('/api/dashboard/adoption-requests/summary', signal)); }
export async function approveAdoptionRequest(id: string, noteValue?: string) { await apiClient.post(`/api/dashboard/adoption-requests/${encodeURIComponent(id)}/approve`, { note: noteValue ?? null, reason: null }); return getAdoptionRequestById(id); }
export async function rejectAdoptionRequest(id: string, input: RejectAdoptionInput) { await apiClient.post(`/api/dashboard/adoption-requests/${encodeURIComponent(id)}/reject`, { note: null, reason: input.otherReason || input.reason }); return getAdoptionRequestById(id); }
export async function deleteAdoptionRequest(id: string, reason: string) { return apiClient.delete(`/api/dashboard/adoption-requests/${encodeURIComponent(id)}`, { reason }); }
export async function addAdoptionNote(id: string, value: string) { const payload = await apiClient.post<unknown>(`/api/dashboard/adoption-requests/${encodeURIComponent(id)}/notes`, { note: value }); const raw = unwrap(payload); return note(Object.keys(rec(raw)).length ? raw : { note: value }); }
