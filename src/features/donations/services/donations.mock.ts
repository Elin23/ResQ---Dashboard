import type { AdminSession } from '@/features/auth/session';
import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import { mockDelay } from '@/services/mock/delay';
import type {
  DonationArchiveEntry,
  DonationCampaign,
  DonationCampaignDetails,
  DonationCampaignFilters,
  DonationCampaignListResult,
  DonationCampaignTimelineEvent,
  DonationSummary,
  MoneyTotal,
} from '../types';

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 86_400_000).toISOString();
const hoursAgo = (hours: number) => new Date(now - hours * 3_600_000).toISOString();
const image = (seed: string) => `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;
const clone = <T,>(value: T): T => structuredClone(value);

const campaigns: DonationCampaign[] = [
  {
    id: 'CMP-2026-0014',
    title: 'دعم مأوى الرحمة خلال شهر آب',
    description: 'حملة مجتمعية لتأمين الغذاء ومستلزمات النظافة للحيوانات الموجودة في المأوى.',
    publisher: { id: 'USR-01042', name: 'ليلى محمود' },
    beneficiaryOrganization: { id: 'ORG-001', name: 'جمعية الرحمة للحيوان' },
    media: [{ id: 'm-1', type: 'IMAGE', url: image('1548199973-03cce0bbc87b'), alt: 'صورة من مأوى الجمعية' }],
    status: 'PUBLISHED',
    targetAmountMinor: 25_000_000 * 100,
    raisedAmountMinor: 17_350_000 * 100,
    currency: 'SYP',
    donorCount: 34,
    submittedAt: daysAgo(14),
    reviewedAt: daysAgo(13),
    publishedAt: daysAgo(13),
    createdAt: daysAgo(14),
    updatedAt: hoursAgo(7),
  },
  {
    id: 'CMP-2026-0017',
    title: 'مستلزمات شتوية لجمعية أمان',
    description: 'جمع تبرعات لشراء بطانيات وأوعية طعام ومستلزمات رعاية أساسية.',
    publisher: { id: 'USR-01081', name: 'سامر الخطيب' },
    beneficiaryOrganization: { id: 'ORG-003', name: 'جمعية أمان للحيوان' },
    media: [{ id: 'm-2', type: 'IMAGE', url: image('1558788353-f76d92427f16'), alt: 'مستلزمات رعاية للحيوانات' }],
    status: 'PENDING_REVIEW',
    targetAmountMinor: 18_000_000 * 100,
    raisedAmountMinor: 0,
    currency: 'SYP',
    donorCount: 0,
    submittedAt: hoursAgo(9),
    createdAt: hoursAgo(11),
    updatedAt: hoursAgo(9),
  },
  {
    id: 'CMP-2026-0012',
    title: 'دعم مركز رعاية مؤقت',
    description: 'حملة مقترحة لدعم تجهيز مساحة رعاية مؤقتة.',
    publisher: { id: 'USR-01063', name: 'نورا حمود' },
    beneficiaryOrganization: { id: 'ORG-002', name: 'جمعية رفق دمشق' },
    media: [{ id: 'm-3', type: 'IMAGE', url: image('1537151625747-768eb6cf92b2'), alt: 'مساحة رعاية للحيوانات' }],
    status: 'REJECTED',
    targetAmountMinor: 12_000_000 * 100,
    raisedAmountMinor: 0,
    currency: 'SYP',
    donorCount: 0,
    submittedAt: daysAgo(20),
    reviewedAt: daysAgo(19),
    rejectionReason: 'الصور المرفقة لا تثبت بشكل كافٍ ارتباط الحملة بالموقع المذكور.',
    createdAt: daysAgo(21),
    updatedAt: daysAgo(19),
  },
];

const donors = new Map<string, DonationArchiveEntry[]>([
  ['CMP-2026-0014', [
    { id: 'DNR-001', displayName: 'أحمد حسن', anonymous: false, amountMinor: 1_500_000 * 100, currency: 'SYP', donatedAt: hoursAgo(10) },
    { id: 'DNR-002', displayName: 'متبرع مجهول', anonymous: true, amountMinor: 500_000 * 100, currency: 'SYP', donatedAt: hoursAgo(18) },
    { id: 'DNR-003', displayName: 'رنا سليمان', anonymous: false, amountMinor: 2_000_000 * 100, currency: 'SYP', donatedAt: daysAgo(2) },
    { id: 'DNR-004', displayName: 'يوسف مراد', anonymous: false, amountMinor: 750_000 * 100, currency: 'SYP', donatedAt: daysAgo(3) },
  ]],
]);

const timelines = new Map<string, DonationCampaignTimelineEvent[]>();
for (const campaign of campaigns) {
  const events: DonationCampaignTimelineEvent[] = [
    { id: `${campaign.id}-submitted`, title: 'تم إرسال حملة التبرع للمراجعة', timestamp: campaign.submittedAt, tone: 'pending' },
  ];
  if (campaign.publishedAt) events.unshift({ id: `${campaign.id}-published`, title: 'وافق الأدمن على نشر الحملة', timestamp: campaign.publishedAt, actor: 'فريق الإدارة', tone: 'success' });
  if (campaign.status === 'REJECTED') events.unshift({ id: `${campaign.id}-rejected`, title: 'تم رفض نشر الحملة', timestamp: campaign.reviewedAt ?? campaign.updatedAt, actor: 'فريق الإدارة', details: campaign.rejectionReason, tone: 'critical' });
  timelines.set(campaign.id, events);
}

function findCampaign(id: string): DonationCampaign {
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) throw new Error('DONATION_CAMPAIGN_NOT_FOUND');
  return campaign;
}

function filtered(filters: DonationCampaignFilters): DonationCampaign[] {
  const needle = filters.search.trim().toLocaleLowerCase('ar');
  return campaigns.filter((campaign) => {
    const haystack = `${campaign.id} ${campaign.title} ${campaign.publisher.name} ${campaign.beneficiaryOrganization.name}`.toLocaleLowerCase('ar');
    if (needle && !haystack.includes(needle)) return false;
    if (filters.status && campaign.status !== filters.status) return false;
    if (filters.organizationId && campaign.beneficiaryOrganization.id !== filters.organizationId) return false;
    if (filters.dateFrom && new Date(campaign.submittedAt) < new Date(`${filters.dateFrom}T00:00:00`)) return false;
    if (filters.dateTo && new Date(campaign.submittedAt) > new Date(`${filters.dateTo}T23:59:59`)) return false;
    return campaign.status !== 'DELETED';
  });
}

export async function getDonationCampaigns(filters: DonationCampaignFilters): Promise<DonationCampaignListResult> {
  await mockDelay(90);
  const sortBy = filters.sortBy ?? 'updatedAt';
  const direction = filters.sortDirection === 'asc' ? 1 : -1;
  const items = filtered(filters).sort((a, b) => {
    if (sortBy === 'raisedAmountMinor') return (a.raisedAmountMinor - b.raisedAmountMinor) * direction;
    if (sortBy === 'status') return a.status.localeCompare(b.status) * direction;
    const av = sortBy === 'submittedAt' ? a.submittedAt : a.updatedAt;
    const bv = sortBy === 'submittedAt' ? b.submittedAt : b.updatedAt;
    return (new Date(av).getTime() - new Date(bv).getTime()) * direction;
  });
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * filters.pageSize;
  return { items: clone(items.slice(start, start + filters.pageSize)), total, page, pageSize: filters.pageSize, pageCount };
}

export async function getDonationCampaignById(id: string): Promise<DonationCampaignDetails | null> {
  await mockDelay(70);
  const campaign = campaigns.find((item) => item.id === id && item.status !== 'DELETED');
  if (!campaign) return null;
  return { campaign: clone(campaign), donors: clone(donors.get(id) ?? []), timeline: clone(timelines.get(id) ?? []) };
}

export async function getDonationSummary(filters?: Partial<DonationCampaignFilters>): Promise<DonationSummary> {
  await mockDelay(55);
  const scope = filters?.organizationId ? campaigns.filter((item) => item.beneficiaryOrganization.id === filters.organizationId && item.status !== 'DELETED') : campaigns.filter((item) => item.status !== 'DELETED');
  const published = scope.filter((item) => ['PUBLISHED', 'CLOSED'].includes(item.status));
  const totalAmount = published.reduce((sum, item) => sum + item.raisedAmountMinor, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthAmount = published.filter((item) => (item.publishedAt ?? item.updatedAt).startsWith(currentMonth)).reduce((sum, item) => sum + item.raisedAmountMinor, 0);
  const total: MoneyTotal[] = totalAmount ? [{ currency: 'SYP', amountMinor: totalAmount }] : [];
  const thisMonth: MoneyTotal[] = monthAmount ? [{ currency: 'SYP', amountMinor: monthAmount }] : [];
  return {
    total,
    thisMonth,
    completed: published.reduce((sum, item) => sum + item.donorCount, 0),
    pending: scope.filter((item) => item.status === 'PENDING_REVIEW').length,
    publishedCampaigns: published.length,
    donorCount: published.reduce((sum, item) => sum + item.donorCount, 0),
  };
}

export async function approveDonationCampaign(id: string, actor: AdminSession): Promise<DonationCampaign> {
  await mockDelay(80);
  const campaign = findCampaign(id);
  if (campaign.status !== 'PENDING_REVIEW') throw new Error('INVALID_CAMPAIGN_STATE');
  const timestamp = new Date().toISOString();
  campaign.status = 'PUBLISHED';
  campaign.reviewedAt = timestamp;
  campaign.publishedAt = timestamp;
  campaign.updatedAt = timestamp;
  timelines.set(id, [{ id: `${id}-published-${Date.now()}`, title: 'وافق الأدمن على نشر الحملة', actor: actor.name, timestamp, tone: 'success' }, ...(timelines.get(id) ?? [])]);
  recordAdminAuditEvent(actor, { action: 'CONTENT_PUBLISHED', resource: { type: 'DONATION', id, label: campaign.title }, newValue: { status: 'PUBLISHED' }, metadata: { source: 'مراجعة حملات التبرع' } });
  return clone(campaign);
}

export async function rejectDonationCampaign(id: string, reason: string, actor: AdminSession): Promise<DonationCampaign> {
  await mockDelay(80);
  const campaign = findCampaign(id);
  if (campaign.status !== 'PENDING_REVIEW') throw new Error('INVALID_CAMPAIGN_STATE');
  const timestamp = new Date().toISOString();
  campaign.status = 'REJECTED';
  campaign.reviewedAt = timestamp;
  campaign.rejectionReason = reason;
  campaign.updatedAt = timestamp;
  timelines.set(id, [{ id: `${id}-rejected-${Date.now()}`, title: 'تم رفض نشر الحملة', actor: actor.name, timestamp, details: reason, tone: 'critical' }, ...(timelines.get(id) ?? [])]);
  recordAdminAuditEvent(actor, { action: 'CONTENT_ARCHIVED', resource: { type: 'DONATION', id, label: campaign.title }, reason, newValue: { status: 'REJECTED' }, metadata: { source: 'مراجعة حملات التبرع' } });
  return clone(campaign);
}

export async function deleteDonationCampaign(id: string, reason: string, actor: AdminSession): Promise<void> {
  await mockDelay(70);
  const campaign = findCampaign(id);
  campaign.status = 'DELETED';
  campaign.updatedAt = new Date().toISOString();
  recordAdminAuditEvent(actor, { action: 'CONTENT_ARCHIVED', resource: { type: 'DONATION', id, label: campaign.title }, reason, newValue: { status: 'DELETED' }, metadata: { source: 'أرشيف حملات التبرع' } });
}

export async function getDonations(filters: { search?: string; organizationId?: string; dateFrom?: string; dateTo?: string; page: number; pageSize: number }) {
  await mockDelay(45);
  const records = campaigns
    .filter((campaign) => ['PUBLISHED', 'CLOSED'].includes(campaign.status))
    .filter((campaign) => !filters.organizationId || campaign.beneficiaryOrganization.id === filters.organizationId)
    .flatMap((campaign) => (donors.get(campaign.id) ?? []).map((donor) => ({
      id: donor.id,
      amountMinor: donor.amountMinor,
      currency: donor.currency,
      status: 'COMPLETED' as const,
      purpose: 'GENERAL' as const,
      beneficiary: { type: 'ORGANIZATION' as const, id: campaign.beneficiaryOrganization.id, name: campaign.beneficiaryOrganization.name },
      createdAt: donor.donatedAt,
    })))
    .filter((record) => !filters.dateFrom || new Date(record.createdAt) >= new Date(`${filters.dateFrom}T00:00:00`))
    .filter((record) => !filters.dateTo || new Date(record.createdAt) <= new Date(`${filters.dateTo}T23:59:59`));
  const total = records.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * filters.pageSize;
  return { items: clone(records.slice(start, start + filters.pageSize)), total, page, pageSize: filters.pageSize, pageCount };
}
