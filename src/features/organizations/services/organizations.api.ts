import { apiClient } from '@/services/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  Organization,
  OrganizationAssignmentOption,
  OrganizationDetails,
  OrganizationFilters,
  OrganizationListResult,
  OrganizationSummary,
  RejectOrganizationInput,
  RequestInfoInput,
  ReviewDocumentInput,
  SuspendOrganizationInput,
} from '../types';

type JsonRecord = Record<string, unknown>;
const rec = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (...values: unknown[]): string | undefined => values.find((value) => typeof value === 'string' && value.trim()) as string | undefined;
const num = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};
const ident = (...values: unknown[]): string => String(values.find((value) => value !== null && value !== undefined && String(value).trim()) ?? '');
const iso = () => new Date().toISOString();
const unwrap = (payload: unknown): unknown => {
  const root = rec(payload);
  return root.data ?? root.result ?? root.value ?? payload;
};

function status(value: unknown): Organization['status'] {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('SUSPEND')) return 'SUSPENDED';
  if (raw.includes('REJECT')) return 'REJECTED';
  if (raw.includes('ACTIVE') || raw.includes('APPROV') || raw === '1') return 'ACTIVE';
  return 'PENDING_VERIFICATION';
}

function verification(value: unknown): Organization['verificationStatus'] {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('MORE') || raw.includes('INFO')) return 'MORE_INFO_REQUIRED';
  if (raw.includes('REJECT')) return 'REJECTED';
  if (raw.includes('VERIF') || raw.includes('APPROV')) return 'VERIFIED';
  if (raw.includes('REVIEW')) return 'IN_REVIEW';
  return 'NOT_REVIEWED';
}

function normalizeOrganization(value: unknown): Organization {
  const item = rec(value);
  const location = rec(item.location ?? item.place);
  const primary = rec(item.primaryContact ?? item.contactPerson ?? item.representative);
  const stats = rec(item.statistics ?? item.stats);
  const createdAt = str(item.createdAt, item.creationTime, item.registeredAt) ?? iso();
  const updatedAt = str(item.updatedAt, item.lastModificationTime, item.modifiedAt) ?? createdAt;

  return {
    id: ident(item.id, item.organizationId),
    name: str(item.name, item.organizationName, item.nameAr) ?? 'جمعية',
    shortName: str(item.shortName),
    description: str(item.description, item.bio),
    logoUrl: resolveMediaUrl(str(item.logoUrl, item.logo, item.imageUrl)) || undefined,
    coverImageUrl: resolveMediaUrl(str(item.coverImageUrl, item.coverUrl)) || undefined,
    status: status(item.status ?? item.organizationStatus),
    verificationStatus: verification(item.verificationStatus ?? item.reviewStatus),
    registrationNumber: str(item.registrationNumber, item.registerNumber, item.organizationNumber),
    licenseNumber: str(item.licenseNumber),
    foundedYear: num(item.foundedYear, item.establishedYear),
    governorate: str(item.governorate, item.governorateName, rec(item.governorate).name, rec(item.governorate).nameAr, location.governorateName) ?? '',
    city: str(item.city, item.areaName, rec(item.area).name, rec(item.area).nameAr, location.areaName),
    address: str(item.address, location.address) ?? '',
    latitude: num(item.latitude, location.latitude),
    longitude: num(item.longitude, location.longitude),
    phone: str(item.phone, item.phoneNumber, primary.phone, location.phone) ?? '',
    email: str(item.email, primary.email, location.email) ?? '',
    website: str(item.website, item.webSite, location.website, location.webSite),
    primaryContact: {
      name: str(primary.name, primary.fullName, item.contactName) ?? '',
      role: str(primary.role, primary.position, item.contactRole) ?? '',
      phone: str(primary.phone, primary.phoneNumber),
      email: str(primary.email),
    },
    services: arr(item.services).map((entry) => ({ key: String(typeof entry === 'string' ? entry : rec(entry).key ?? rec(entry).code ?? '').toUpperCase() as Organization['services'][number]['key'] })).filter((entry) => entry.key),
    operatingHours: arr(item.operatingHours ?? item.hours).map((entry) => {
      const row = rec(entry);
      return {
        day: String(row.day ?? 'SATURDAY').toUpperCase() as Organization['operatingHours'][number]['day'],
        closed: Boolean(row.closed ?? row.isClosed),
        open24Hours: typeof row.open24Hours === 'boolean' ? row.open24Hours : undefined,
        opensAt: str(row.opensAt, row.openingTime),
        closesAt: str(row.closesAt, row.closingTime),
      };
    }),
    documents: arr(item.documents).map((entry) => {
      const row = rec(entry);
      return {
        id: ident(row.id, row.documentId),
        type: String(row.type ?? 'OTHER').toUpperCase() as Organization['documents'][number]['type'],
        name: str(row.name, row.fileName) ?? 'مستند',
        url: resolveMediaUrl(str(row.url, row.fileUrl)),
        status: String(row.status ?? 'PENDING').toUpperCase() as Organization['documents'][number]['status'],
        uploadedAt: str(row.uploadedAt, row.createdAt, row.creationTime) ?? createdAt,
        reviewedAt: str(row.reviewedAt),
        rejectionReason: str(row.rejectionReason, row.reason),
        required: typeof row.required === 'boolean' ? row.required : Boolean(row.isRequired),
      };
    }),
    statistics: Object.keys(stats).length ? {
      activeReports: num(stats.activeReports, stats.activeReportsCount) ?? 0,
      closedReports: num(stats.closedReports, stats.closedReportsCount) ?? 0,
      completionRate: num(stats.completionRate),
      pendingAdoptionRequests: num(stats.pendingAdoptionRequests) ?? 0,
      completedAdoptions: num(stats.completedAdoptions) ?? 0,
      rating: num(stats.rating),
      reviewsCount: num(stats.reviewsCount) ?? 0,
      activeAdvertisements: num(stats.activeAdvertisements) ?? 0,
      pendingAdvertisements: num(stats.pendingAdvertisements) ?? 0,
      donationsTotal: num(stats.donationsTotal) ?? 0,
      donationsThisMonth: num(stats.donationsThisMonth) ?? 0,
      recentDonationTransactions: num(stats.recentDonationTransactions) ?? 0,
    } : undefined,
    createdAt,
    updatedAt,
  };
}

function list(payload: unknown, filters: OrganizationFilters): OrganizationListResult {
  const body = rec(unwrap(payload));
  const rawItems = arr(body.items ?? body.organizations ?? body.data ?? unwrap(payload));
  const items = rawItems.map(normalizeOrganization);
  const total = num(body.total, body.totalCount, body.count) ?? items.length;
  const page = num(body.page, body.pageNumber) ?? filters.page;
  const pageSize = num(body.pageSize, body.maxResultCount) ?? filters.pageSize;
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))) };
}

function summary(payload: unknown): OrganizationSummary {
  const body = rec(unwrap(payload));
  return {
    total: num(body.total, body.totalOrganizations) ?? 0,
    pendingVerification: num(body.pendingVerification, body.pendingReview, body.pending, body.pendingOrganizations) ?? 0,
    active: num(body.active, body.approved, body.activeOrganizations) ?? 0,
    suspended: num(body.suspended, body.suspendedOrganizations) ?? 0,
    withActiveReports: num(body.withActiveReports, body.organizationsWithActiveReports) ?? 0,
  };
}

function details(payload: unknown): OrganizationDetails | null {
  const raw = unwrap(payload);
  if (raw == null) return null;
  const body = rec(raw);
  const orgSource = body.organization ?? body;
  const review = rec(body.review ?? body.verificationReview);
  return {
    organization: normalizeOrganization({ ...rec(orgSource), documents: body.documents ?? rec(orgSource).documents }),
    review: {
      reviewer: Object.keys(rec(review.reviewer)).length ? {
        id: ident(rec(review.reviewer).id),
        name: str(rec(review.reviewer).name, rec(review.reviewer).fullName) ?? '',
      } : undefined,
      startedAt: str(review.startedAt),
      checklist: arr(review.checklist).map((entry) => {
        const row = rec(entry);
        return { key: String(row.key ?? row.code ?? ''), label: str(row.label, row.name) ?? '', passed: Boolean(row.passed ?? row.isPassed) };
      }),
      requestedItems: arr(review.requestedItems).map(String),
      adminMessage: str(review.adminMessage, review.message),
      deadline: str(review.deadline),
      rejectionReason: str(review.rejectionReason, review.reason),
    },
    timeline: arr(body.timeline ?? body.activity).map((entry) => {
      const row = rec(entry);
      return {
        id: ident(row.id, crypto.randomUUID()),
        action: str(row.action, row.title, row.event) ?? 'تحديث',
        actor: str(row.actor, row.actorName, rec(row.actor).name),
        timestamp: str(row.timestamp, row.createdAt, row.creationTime) ?? iso(),
        details: str(row.details, row.description, row.note),
        tone: str(row.tone) as OrganizationDetails['timeline'][number]['tone'],
      };
    }),
    notes: arr(body.notes ?? body.internalNotes).map((entry) => {
      const row = rec(entry);
      return {
        id: ident(row.id, crypto.randomUUID()),
        adminName: str(row.adminName, row.actorName, rec(row.actor).name) ?? 'مسؤول النظام',
        adminRole: str(row.adminRole, row.actorRole, rec(row.actor).role) ?? 'مسؤول',
        createdAt: str(row.createdAt, row.creationTime) ?? iso(),
        note: str(row.note, row.body, row.text) ?? '',
      };
    }),
    recentReports: arr(body.recentReports ?? body.reports).map((entry) => {
      const row = rec(entry);
      return { id: ident(row.id, row.reportId), status: String(row.status ?? ''), updatedAt: str(row.updatedAt, row.lastModificationTime, row.createdAt) ?? iso() };
    }),
    recentAdoptions: arr(body.recentAdoptions ?? body.adoptions).map((entry) => {
      const row = rec(entry);
      return {
        id: ident(row.id, row.adoptionRequestId), status: String(row.status ?? ''),
        applicantName: str(row.applicantName, rec(row.applicant).name) ?? '', animalId: ident(row.animalId, rec(row.animal).id),
      };
    }),
  };
}

function qs(filters: OrganizationFilters): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.status) params.set('status', filters.status);
  if (filters.verificationStatus) params.set('verificationStatus', filters.verificationStatus);
  if (filters.activeReports) params.set('activeReports', filters.activeReports);
  if (filters.governorate && /^\d+$/.test(filters.governorate)) params.set('governorateId', filters.governorate);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  return params.toString();
}

export async function getOrganizations(filters: OrganizationFilters, signal?: AbortSignal): Promise<OrganizationListResult> {
  return list(await apiClient.get<unknown>(`/api/dashboard/organizations?${qs(filters)}`, signal), filters);
}
export async function getOrganizationSummary(signal?: AbortSignal): Promise<OrganizationSummary> {
  return summary(await apiClient.get<unknown>('/api/dashboard/organizations/summary', signal));
}
export async function getOrganizationById(id: string, signal?: AbortSignal): Promise<OrganizationDetails | null> {
  return details(await apiClient.get<unknown>(`/api/dashboard/organizations/${encodeURIComponent(id)}`, signal));
}
export async function getAssignableOrganizations(search = '', signal?: AbortSignal): Promise<OrganizationAssignmentOption[]> {
  const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const raw = unwrap(await apiClient.get<unknown>(`/api/dashboard/organizations/assignable${params}`, signal));
  const body = rec(raw);
  return arr(body.items ?? body.organizations ?? raw).map((entry) => {
    const row = rec(entry);
    return {
      id: ident(row.id, row.organizationId), name: str(row.name, row.organizationName) ?? 'جمعية',
      governorate: str(row.governorate, row.governorateName, rec(row.governorate).name) ?? '',
      distanceKm: num(row.distanceKm, row.distance), activeReports: num(row.activeReports, row.activeReportsCount) ?? 0,
      availability: String(row.availability ?? 'AVAILABLE').toUpperCase() as OrganizationAssignmentOption['availability'],
    };
  });
}

const path = (id: string, suffix = '') => `/api/dashboard/organizations/${encodeURIComponent(id)}${suffix}`;
export const startOrganizationReview = (id: string) => apiClient.post(path(id, '/review/start'));
export const approveOrganization = (id: string) => apiClient.post(path(id, '/approve'));
export const rejectOrganization = (id: string, input: RejectOrganizationInput) => apiClient.post(path(id, '/reject'), { reason: input.otherReason || input.reason });
export const requestOrganizationInfo = (id: string, input: RequestInfoInput) => apiClient.post(path(id, '/request-info'), { reason: input.requestedItems.join(', '), message: input.message });
export const suspendOrganization = (id: string, input: SuspendOrganizationInput) => apiClient.post(path(id, '/suspend'), { reason: input.otherReason || input.reason, message: input.note });
export const reactivateOrganization = (id: string) => apiClient.post(path(id, '/reactivate'));
export const reviewOrganizationDocument = (id: string, documentId: string, input: ReviewDocumentInput) => apiClient.post(path(id, `/documents/${encodeURIComponent(documentId)}/review`), { status: input.decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED', reason: input.reason });
export const addOrganizationNote = (id: string, note: string) => apiClient.post(path(id, '/notes'), { note });
