import type { AdminSession } from '@/features/auth/session';
import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import { mockDelay } from '@/services/mock/delay';
import type {
  AdoptionApplication,
  AdoptionAnimalRef,
  AdoptionInternalNote,
  AdoptionPublisher,
  AdoptionRequest,
  AdoptionRequestDetails,
  AdoptionRequestFilters,
  AdoptionRequestListResult,
  AdoptionRequestSummary,
  AdoptionTimelineEvent,
  RejectAdoptionInput,
} from '../types';

const clone = <T,>(value: T): T => structuredClone(value);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const daysAgo = (days: number) => hoursAgo(days * 24);
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const publishers: Record<string, AdoptionPublisher> = {
  U1: { type: 'USER', id: 'USR-001', name: 'ليلى خليل', phone: '+963 944 215 830', email: 'layla@example.com', city: 'دمشق', accountStatus: 'ACTIVE', memberSince: daysAgo(420) },
  U2: { type: 'USER', id: 'USR-003', name: 'سارة العبد', phone: '+963 933 441 205', email: 'sara@example.com', city: 'حمص', accountStatus: 'ACTIVE', memberSince: daysAgo(260) },
  O1: { type: 'ORGANIZATION', id: 'ORG-001', name: 'جمعية أمان للحيوان', phone: '+963 11 445 7812', email: 'care@aman.org', city: 'دمشق' },
  O2: { type: 'ORGANIZATION', id: 'ORG-003', name: 'جمعية رفق', phone: '+963 21 553 9021', email: 'hello@rifq.org', city: 'حلب' },
};

const animals: Record<string, AdoptionAnimalRef> = {
  A1: { id: 'ADAN-001', name: 'لوز', species: 'CAT', breed: 'بلدي', sex: 'FEMALE', estimatedAgeMonths: 18, imageUrls: [image('photo-1573865526739-10659fec78a5')], description: 'قطة هادئة وودودة، معتادة على المنزل وتستخدم الرمل.' },
  A2: { id: 'ADAN-002', name: 'روكي', species: 'DOG', breed: 'مختلط', sex: 'MALE', estimatedAgeMonths: 30, imageUrls: [image('photo-1552053831-71594a27632d')], description: 'كلب اجتماعي ونشيط، مناسب لعائلة لديها مساحة جيدة.' },
  A3: { id: 'ADAN-003', name: 'مشمش', species: 'CAT', breed: 'بلدي', sex: 'MALE', estimatedAgeMonths: 8, imageUrls: [image('photo-1592194996308-7b43878e84a6')], description: 'قط صغير لعوب وصحته جيدة، يبحث عن منزل دائم.' },
  A4: { id: 'ADAN-004', name: 'بيلا', species: 'DOG', breed: 'مختلط', sex: 'FEMALE', estimatedAgeMonths: 14, imageUrls: [image('photo-1587300003388-59208cc962cb')], description: 'كلبة أليفة، مطعمة وتتعامل جيداً مع الأشخاص.' },
  A5: { id: 'ADAN-005', name: 'ريشو', species: 'BIRD', breed: 'كناري', sex: 'UNKNOWN', estimatedAgeMonths: 12, imageUrls: [image('photo-1552728089-57bdde30beb3')], description: 'طائر بصحة جيدة مع القفص وبعض المستلزمات.' },
};

const applicants = {
  m1: { id: 'USR-008', name: 'مروان حسن', phone: '+963 955 771 932', email: 'marwan@example.com', city: 'دمشق', accountStatus: 'ACTIVE' as const, memberSince: daysAgo(190) },
  m2: { id: 'USR-011', name: 'نادين يوسف', phone: '+963 988 212 414', email: 'nadine@example.com', city: 'دمشق', accountStatus: 'ACTIVE' as const, memberSince: daysAgo(310) },
  m3: { id: 'USR-013', name: 'عمر ياسين', phone: '+963 944 804 112', email: 'omar@example.com', city: 'حلب', accountStatus: 'ACTIVE' as const, memberSince: daysAgo(120) },
};

interface Seed {
  id: string;
  animalId: string;
  publisherId: string;
  status: AdoptionRequest['status'];
  submittedAt: string;
  updatedAt: string;
  publishedAt?: string;
  rejectedAt?: string;
  adoptedAt?: string;
  location: string;
  requirements?: string;
  moderationReason?: string;
  reviewer?: AdoptionRequest['reviewer'];
  acceptedApplicationId?: string;
}

let records: Seed[] = [
  { id: 'ADP-2026-0101', animalId: 'A1', publisherId: 'U1', status: 'PUBLISHED', submittedAt: daysAgo(7), updatedAt: hoursAgo(3), publishedAt: daysAgo(6), location: 'دمشق — المزة', requirements: 'يفضل منزل هادئ دون كلاب.', reviewer: { id: 'ADM-004', name: 'هبة منصور' }, acceptedApplicationId: 'APP-0101-2' },
  { id: 'ADP-2026-0102', animalId: 'A2', publisherId: 'O1', status: 'PENDING_REVIEW', submittedAt: hoursAgo(2), updatedAt: hoursAgo(2), location: 'دمشق — كفرسوسة', requirements: 'عائلة لديها وقت للمشي اليومي.' },
  { id: 'ADP-2026-0103', animalId: 'A3', publisherId: 'U2', status: 'REJECTED', submittedAt: daysAgo(3), updatedAt: daysAgo(2), rejectedAt: daysAgo(2), location: 'حمص — الإنشاءات', moderationReason: 'إحدى الصور المرفقة غير مناسبة للنشر.', reviewer: { id: 'mock-admin-001', name: 'أحمد الخطيب' } },
  { id: 'ADP-2026-0104', animalId: 'A4', publisherId: 'O2', status: 'PUBLISHED', submittedAt: daysAgo(12), updatedAt: hoursAgo(8), publishedAt: daysAgo(11), location: 'حلب — الحمدانية', requirements: 'يفضل وجود مساحة خارجية آمنة.', reviewer: { id: 'ADM-004', name: 'هبة منصور' } },
  { id: 'ADP-2026-0105', animalId: 'A5', publisherId: 'U1', status: 'PENDING_REVIEW', submittedAt: hoursAgo(8), updatedAt: hoursAgo(8), location: 'دمشق — البرامكة' },
  { id: 'ADP-2026-0106', animalId: 'A2', publisherId: 'O1', status: 'ADOPTED', submittedAt: daysAgo(45), updatedAt: daysAgo(12), publishedAt: daysAgo(44), adoptedAt: daysAgo(12), location: 'دمشق — كفرسوسة', reviewer: { id: 'mock-admin-001', name: 'أحمد الخطيب' }, acceptedApplicationId: 'APP-0106-1' },
];

const applicationsByListing = new Map<string, AdoptionApplication[]>([
  ['ADP-2026-0101', [
    { id: 'APP-0101-1', applicant: applicants.m1, status: 'REJECTED', message: 'لدي خبرة مع القطط وأعيش في شقة هادئة.', submittedAt: daysAgo(4), respondedAt: daysAgo(3), ownerResponse: 'تم اختيار طلب أنسب لاحتياجات لوز.', contactShared: false },
    { id: 'APP-0101-2', applicant: applicants.m2, status: 'ACCEPTED', message: 'أبحث عن قطة منزلية وأستطيع توفير الرعاية البيطرية.', submittedAt: daysAgo(2), respondedAt: hoursAgo(3), ownerResponse: 'موافقة، يمكن متابعة التواصل لترتيب اللقاء.', contactShared: true },
  ]],
  ['ADP-2026-0104', [
    { id: 'APP-0104-1', applicant: applicants.m3, status: 'PENDING', message: 'لدينا منزل مع حديقة وخبرة سابقة بالكلاب.', submittedAt: hoursAgo(14), contactShared: false },
  ]],
  ['ADP-2026-0106', [
    { id: 'APP-0106-1', applicant: applicants.m1, status: 'ACCEPTED', message: 'أرغب بتبني روكي وتوفير منزل دائم له.', submittedAt: daysAgo(18), respondedAt: daysAgo(16), ownerResponse: 'تمت الموافقة والتنسيق مباشرة.', contactShared: true },
  ]],
]);

const notesById = new Map<string, AdoptionInternalNote[]>();
const timelineById = new Map<string, AdoptionTimelineEvent[]>();

function publisherOf(seed: Seed) {
  return publishers[seed.publisherId]!;
}

function applicationsOf(id: string) {
  return applicationsByListing.get(id) ?? [];
}

function buildTimeline(seed: Seed): AdoptionTimelineEvent[] {
  const publisher = publisherOf(seed);
  const events: AdoptionTimelineEvent[] = [
    { id: `${seed.id}-submitted`, action: 'SUBMITTED', title: 'أرسل الناشر طلب عرض الحيوان للتبني', actor: publisher.name, timestamp: seed.submittedAt, tone: 'pending' },
  ];
  if (seed.publishedAt) events.unshift({ id: `${seed.id}-published`, action: 'PUBLISHED', title: 'وافق الأدمن وتم نشر عرض التبني', actor: seed.reviewer?.name, timestamp: seed.publishedAt, tone: 'success' });
  if (seed.rejectedAt) events.unshift({ id: `${seed.id}-rejected`, action: 'REJECTED', title: 'رفض الأدمن نشر العرض', actor: seed.reviewer?.name, timestamp: seed.rejectedAt, note: seed.moderationReason, tone: 'critical' });
  for (const app of applicationsOf(seed.id)) {
    events.unshift({ id: `${seed.id}-${app.id}-received`, action: 'APPLICATION_RECEIVED', title: 'وصل طلب تبنٍ جديد', actor: app.applicant.name, timestamp: app.submittedAt, tone: 'info' });
    if (app.respondedAt && app.status === 'ACCEPTED') events.unshift({ id: `${seed.id}-${app.id}-accepted`, action: 'APPLICATION_ACCEPTED', title: 'وافق صاحب الحيوان على طلب التبني', actor: publisher.name, timestamp: app.respondedAt, note: app.ownerResponse, tone: 'success' });
    if (app.respondedAt && app.status === 'REJECTED') events.unshift({ id: `${seed.id}-${app.id}-rejected`, action: 'APPLICATION_REJECTED', title: 'رفض صاحب الحيوان طلب التبني', actor: publisher.name, timestamp: app.respondedAt, note: app.ownerResponse, tone: 'neutral' });
  }
  if (seed.adoptedAt) events.unshift({ id: `${seed.id}-adopted`, action: 'ADOPTED', title: 'تم تسجيل اكتمال التبني', actor: publisher.name, timestamp: seed.adoptedAt, tone: 'success' });
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function resolve(seed: Seed): AdoptionRequest {
  const apps = applicationsOf(seed.id);
  return {
    id: seed.id,
    animal: clone(animals[seed.animalId]!),
    publisher: clone(publisherOf(seed)),
    status: seed.status,
    submittedAt: seed.submittedAt,
    updatedAt: seed.updatedAt,
    reviewedAt: seed.publishedAt ?? seed.rejectedAt,
    completedAt: seed.adoptedAt,
    publishedAt: seed.publishedAt,
    rejectedAt: seed.rejectedAt,
    adoptedAt: seed.adoptedAt,
    location: seed.location,
    requirements: seed.requirements,
    moderationReason: seed.moderationReason,
    reviewer: seed.reviewer,
    applicationsCount: apps.length,
    pendingApplicationsCount: apps.filter((app) => app.status === 'PENDING').length,
    acceptedApplicationId: seed.acceptedApplicationId,
    internalNotesCount: (notesById.get(seed.id) ?? []).length,
  };
}

function updateSeed(id: string, updater: (seed: Seed) => Seed) {
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error('ADOPTION_LISTING_NOT_FOUND');
  records = records.map((record, current) => (current === index ? updater(record) : record));
  return records[index]!;
}

export const adoptionOrganizationOptions = Object.values(publishers)
  .filter((publisher) => publisher.type === 'ORGANIZATION')
  .map((publisher) => ({ id: publisher.id, name: publisher.name }));

export async function getAdoptionRequests(filters: AdoptionRequestFilters): Promise<AdoptionRequestListResult> {
  await mockDelay(130);
  const needle = filters.search.trim().toLocaleLowerCase('ar');
  let filtered = records.map(resolve).filter((item) => {
    const hay = `${item.id} ${item.animal.name ?? ''} ${item.animal.description} ${item.publisher.name} ${item.location}`.toLocaleLowerCase('ar');
    if (needle && !hay.includes(needle)) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.species && item.animal.species !== filters.species) return false;
    if (filters.publisherType && item.publisher.type !== filters.publisherType) return false;
    if (filters.organizationId && !(item.publisher.type === 'ORGANIZATION' && item.publisher.id === filters.organizationId)) return false;
    if (filters.city && !item.location.includes(filters.city)) return false;
    if (filters.userId && !(item.publisher.type === 'USER' && item.publisher.id === filters.userId)) return false;
    if (filters.dateFrom && new Date(item.submittedAt) < new Date(`${filters.dateFrom}T00:00:00`)) return false;
    if (filters.dateTo && new Date(item.submittedAt) > new Date(`${filters.dateTo}T23:59:59`)) return false;
    return true;
  });
  filtered = filtered.sort((a, b) => {
    if (filters.sortBy === 'status') return (filters.sortDirection === 'asc' ? 1 : -1) * a.status.localeCompare(b.status);
    const field = filters.sortBy ?? 'updatedAt';
    const delta = new Date(a[field]).getTime() - new Date(b[field]).getTime();
    return filters.sortDirection === 'asc' ? delta : -delta;
  });
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);
  return { items: clone(filtered.slice((page - 1) * filters.pageSize, page * filters.pageSize)), total, page, pageSize: filters.pageSize, pageCount };
}

export async function getAdoptionRequestById(id: string): Promise<AdoptionRequestDetails | null> {
  await mockDelay(90);
  const seed = records.find((record) => record.id === id);
  if (!seed) return null;
  const timeline = timelineById.get(id) ?? buildTimeline(seed);
  return { request: resolve(seed), applications: clone(applicationsOf(id)), timeline: clone(timeline), notes: clone(notesById.get(id) ?? []) };
}

export async function getAdoptionRequestSummary(): Promise<AdoptionRequestSummary> {
  await mockDelay(60);
  const resolved = records.map(resolve);
  return {
    pendingReview: resolved.filter((item) => item.status === 'PENDING_REVIEW').length,
    published: resolved.filter((item) => item.status === 'PUBLISHED').length,
    withApplications: resolved.filter((item) => item.applicationsCount > 0 && item.status === 'PUBLISHED').length,
    pendingApplications: resolved.reduce((sum, item) => sum + item.pendingApplicationsCount, 0),
    rejected: resolved.filter((item) => item.status === 'REJECTED').length,
    adopted: resolved.filter((item) => item.status === 'ADOPTED').length,
  };
}

export async function approveAdoptionRequest(id: string, note: string | undefined, actor: AdminSession) {
  await mockDelay(90);
  const current = records.find((record) => record.id === id);
  if (!current) throw new Error('ADOPTION_LISTING_NOT_FOUND');
  if (current.status !== 'PENDING_REVIEW') throw new Error('INVALID_ADOPTION_LISTING_STATE');
  const now = new Date().toISOString();
  const updated = updateSeed(id, (seed) => ({ ...seed, status: 'PUBLISHED', publishedAt: now, updatedAt: now, reviewer: { id: actor.id, name: actor.name }, moderationReason: note }));
  timelineById.set(id, buildTimeline(updated));
  recordAdminAuditEvent(actor, { action: 'ADOPTION_APPROVED', resource: { type: 'ADOPTION_REQUEST', id, label: `عرض تبني ${updated.animalId}` }, reason: note, previousValue: { status: current.status }, newValue: { status: 'PUBLISHED' }, metadata: { source: 'مراجعة عروض التبني' } });
  return resolve(updated);
}

export async function rejectAdoptionRequest(id: string, input: RejectAdoptionInput, actor: AdminSession) {
  await mockDelay(90);
  const current = records.find((record) => record.id === id);
  if (!current) throw new Error('ADOPTION_LISTING_NOT_FOUND');
  if (current.status !== 'PENDING_REVIEW') throw new Error('INVALID_ADOPTION_LISTING_STATE');
  const reason = input.reason === 'سبب آخر' ? input.otherReason ?? input.reason : input.reason;
  const now = new Date().toISOString();
  const updated = updateSeed(id, (seed) => ({ ...seed, status: 'REJECTED', rejectedAt: now, updatedAt: now, reviewer: { id: actor.id, name: actor.name }, moderationReason: reason }));
  timelineById.set(id, buildTimeline(updated));
  recordAdminAuditEvent(actor, { action: 'ADOPTION_REJECTED', resource: { type: 'ADOPTION_REQUEST', id, label: `عرض تبني ${updated.animalId}` }, reason, previousValue: { status: current.status }, newValue: { status: 'REJECTED' }, metadata: { source: 'مراجعة عروض التبني' } });
  return resolve(updated);
}

export async function deleteAdoptionRequest(id: string, reason: string, actor: AdminSession) {
  await mockDelay(90);
  const current = records.find((record) => record.id === id);
  if (!current) throw new Error('ADOPTION_LISTING_NOT_FOUND');
  records = records.filter((record) => record.id !== id);
  applicationsByListing.delete(id);
  notesById.delete(id);
  timelineById.delete(id);
  recordAdminAuditEvent(actor, { action: 'ADOPTION_REJECTED', resource: { type: 'ADOPTION_REQUEST', id, label: `حذف عرض تبني ${current.animalId}` }, reason, previousValue: { status: current.status }, newValue: { deleted: true }, metadata: { source: 'إدارة عروض التبني' } });
  return { id };
}

export async function addAdoptionNote(id: string, note: string, actor: AdminSession) {
  await mockDelay(70);
  if (!records.some((record) => record.id === id)) throw new Error('ADOPTION_LISTING_NOT_FOUND');
  const created: AdoptionInternalNote = { id: `${id}-note-${Date.now()}`, adminName: actor.name, adminRole: actor.roleLabel, createdAt: new Date().toISOString(), note };
  notesById.set(id, [created, ...(notesById.get(id) ?? [])]);
  return clone(created);
}

export async function getAdoptionDashboardSnapshot() {
  await mockDelay(40);
  const summary = await getAdoptionRequestSummary();
  return { pendingReview: summary.pendingReview, published: summary.published, pendingApplications: summary.pendingApplications };
}

export const adoptionReviewerOptions = [{ id: 'mock-admin-001', name: 'أحمد الخطيب' }, { id: 'ADM-004', name: 'هبة منصور' }] as const;
