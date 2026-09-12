import { apiClient } from '@/services/api/client';
import * as adoptionApi from '@/features/adoption-requests/services/adoption-requests.api';
import * as donationsApi from '@/features/donations/services/donations.api';
import * as feedingPointsApi from '@/features/feeding-points/services/feeding-points.api';
import * as organizationsApi from '@/features/organizations/services/organizations.api';
import * as reportsApi from '@/features/reports/services/reports.api';
import type { Report } from '@/features/reports/types';
import type { AttentionItem, DashboardRange, DashboardSummary, GeographicSnapshot, RecentActivity, WeeklyReportPoint } from '../types';

type R = Record<string, unknown>;
const rec = (value: unknown): R => value && typeof value === 'object' && !Array.isArray(value) ? value as R : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const num = (...values: unknown[]): number => {
  for (const value of values) {
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};
const text = (...values: unknown[]): string => String(values.find((value) => typeof value === 'string' && value.trim()) ?? '');
const timestamp = (value: unknown): string => {
  const raw = text(value);
  if (!raw) return new Date().toISOString();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
};

const animalLabels: Record<Report['animalType'], string> = {
  DOG: 'كلب',
  CAT: 'قط',
  BIRD: 'طائر',
  OTHER: 'حيوان',
};

function rangeStart(range: DashboardRange): Date {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === '7D') start.setDate(start.getDate() - 6);
  if (range === '30D') start.setDate(start.getDate() - 29);
  return start;
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', { weekday: 'short' }).format(date);
}

function buildWeeklyReports(reports: Report[]): WeeklyReportPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return { key, date, received: 0, closed: 0 };
  });
  const byDay = new Map(days.map((day) => [day.key, day]));

  for (const report of reports) {
    const created = new Date(report.createdAt);
    if (!Number.isNaN(created.getTime())) {
      const key = `${created.getFullYear()}-${created.getMonth()}-${created.getDate()}`;
      const bucket = byDay.get(key);
      if (bucket) bucket.received += 1;
    }
    if (report.closedAt) {
      const closed = new Date(report.closedAt);
      if (!Number.isNaN(closed.getTime())) {
        const key = `${closed.getFullYear()}-${closed.getMonth()}-${closed.getDate()}`;
        const bucket = byDay.get(key);
        if (bucket) bucket.closed += 1;
      }
    }
  }

  return days.map(({ date, received, closed }) => ({ day: formatDay(date), received, closed }));
}

async function getRecentReports(signal?: AbortSignal): Promise<Report[]> {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 7);
  dateFrom.setHours(0, 0, 0, 0);
  const first = await reportsApi.getReports({
    search: '',
    dateFrom: dateFrom.toISOString(),
    page: 1,
    pageSize: 100,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  }, signal);

  const pageCount = Math.min(first.pageCount, 10);
  if (pageCount <= 1) return first.items;

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => reportsApi.getReports({
      search: '',
      dateFrom: dateFrom.toISOString(),
      page: index + 2,
      pageSize: 100,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    }, signal)),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

function normalizeSummary(value: unknown): DashboardSummary {
  const root = rec(value);
  const reports = rec(root.reports);
  const adoption = rec(root.adoption);
  const organizations = rec(root.organizations);
  const feedingPoints = rec(root.feedingPoints);
  const donations = rec(root.donations);

  return {
    generatedAt: timestamp(root.generatedAt),
    metrics: [
      { id: 'reports-total', label: 'إجمالي البلاغات', value: num(reports.total), context: `${num(reports.open)} مفتوح`, tone: 'info', target: '/reports', iconKey: 'reports' },
      { id: 'reports-critical', label: 'بلاغات حرجة مفتوحة', value: num(reports.critical), context: 'تحتاج متابعة', tone: 'critical', target: '/reports', iconKey: 'critical' },
      { id: 'adoption-pending', label: 'تبنّي بانتظار المراجعة', value: num(adoption.pending), context: `${num(adoption.adopted)} مكتمل`, tone: 'pending', target: '/adoption-requests', iconKey: 'adoptions' },
      { id: 'organizations-active', label: 'الجمعيات النشطة', value: num(organizations.active), context: `من ${num(organizations.total)}`, tone: 'success', target: '/organizations', iconKey: 'organizations' },
      { id: 'feeding-points-pending', label: 'نقاط إطعام معلّقة', value: num(feedingPoints.pending), context: `${num(feedingPoints.active)} نشطة`, tone: 'pending', target: '/feeding-points', iconKey: 'waiting' },
      { id: 'donations-raised', label: 'إجمالي التبرعات المقبولة', value: num(donations.raised).toLocaleString('ar-SA-u-nu-latn'), context: `${num(donations.campaigns)} حملة`, tone: 'success', target: '/donations', iconKey: 'donations' },
    ],
    activeMissions: [],
    criticalReports: [],
    weeklyReports: [],
    operationalSummary: [
      { label: 'بلاغات مفتوحة', value: num(reports.open) },
      { label: 'طلبات تبني معلقة', value: num(adoption.pending) },
      { label: 'نقاط إطعام نشطة', value: num(feedingPoints.active) },
      { label: 'جمعيات نشطة', value: num(organizations.active) },
    ],
  };
}

async function buildSummaryFromFeatureApis(range: DashboardRange, signal?: AbortSignal): Promise<DashboardSummary> {
  const [reportSummary, adoptionSummary, organizationSummary, feedingSummary, donationSummary, recentReports] = await Promise.allSettled([
    reportsApi.getReportSummary(signal),
    adoptionApi.getAdoptionRequestSummary(signal),
    organizationsApi.getOrganizationSummary(signal),
    feedingPointsApi.getFeedingPointSummary(signal),
    donationsApi.getDonationSummary(undefined, signal),
    getRecentReports(signal),
  ]);

  const reports = reportSummary.status === 'fulfilled' ? reportSummary.value : undefined;
  const adoption = adoptionSummary.status === 'fulfilled' ? adoptionSummary.value : undefined;
  const organizations = organizationSummary.status === 'fulfilled' ? organizationSummary.value : undefined;
  const feeding = feedingSummary.status === 'fulfilled' ? feedingSummary.value : undefined;
  const donations = donationSummary.status === 'fulfilled' ? donationSummary.value : undefined;
  const reportItems = recentReports.status === 'fulfilled' ? recentReports.value : [];

  if (!reports && !adoption && !organizations && !feeding && !donations && reportItems.length === 0) {
    throw new Error('تعذر تحميل بيانات لوحة التحكم من جميع الخدمات المتاحة.');
  }

  const inSelectedRange = reportItems.filter((report) => new Date(report.createdAt).getTime() >= rangeStart(range).getTime());
  const openReports = reportItems.filter((report) => report.status !== 'CLOSED');
  const critical = openReports.filter((report) => report.severity === 'CRITICAL' || report.severity === 'HIGH');
  const activeMissions = openReports.filter((report) => Boolean(report.assignedOrganization)).slice(0, 10).map((report) => ({
    id: report.id,
    animal: report.title || animalLabels[report.animalType],
    location: [report.governorate, report.city, report.address].filter(Boolean).join('، '),
    organization: report.assignedOrganization?.name ?? 'غير محدد',
    stage: (`report:${report.status}`) as const,
    progress: report.status === 'RECEIVED' ? 75 : 40,
    startedAt: report.assignedAt ?? report.createdAt,
    priority: report.severity,
  }));

  const raised = donations?.total.reduce((sum, entry) => sum + entry.amountMinor, 0) ?? 0;
  const reportsTotal = range === 'TODAY' || range === '7D' ? inSelectedRange.length : reports?.totalCount ?? inSelectedRange.length;

  return {
    generatedAt: new Date().toISOString(),
    metrics: [
      { id: 'reports-total', label: 'إجمالي البلاغات', value: reportsTotal, context: `${openReports.length || ((reports?.enRouteCount ?? 0) + (reports?.receivedCount ?? 0))} مفتوح`, tone: 'info', target: '/reports', iconKey: 'reports' },
      { id: 'reports-critical', label: 'بلاغات حرجة مفتوحة', value: critical.length, context: 'تحتاج متابعة', tone: 'critical', target: '/reports', iconKey: 'critical' },
      { id: 'adoption-pending', label: 'تبنّي بانتظار المراجعة', value: adoption?.pendingReview ?? 0, context: `${adoption?.adopted ?? 0} مكتمل`, tone: 'pending', target: '/adoption-requests', iconKey: 'adoptions' },
      { id: 'organizations-active', label: 'الجمعيات النشطة', value: organizations?.active ?? 0, context: `من ${organizations?.total ?? 0}`, tone: 'success', target: '/organizations', iconKey: 'organizations' },
      { id: 'feeding-points-pending', label: 'نقاط إطعام معلّقة', value: feeding?.pendingPoints ?? 0, context: `${feeding?.activePoints ?? 0} نشطة`, tone: 'pending', target: '/feeding-points', iconKey: 'waiting' },
      { id: 'donations-raised', label: 'إجمالي التبرعات المقبولة', value: raised.toLocaleString('ar-SA-u-nu-latn'), context: `${donations?.publishedCampaigns ?? 0} حملة`, tone: 'success', target: '/donations', iconKey: 'donations' },
    ],
    activeMissions,
    criticalReports: critical.slice(0, 10).map((report) => ({
      id: report.id,
      animal: report.title || animalLabels[report.animalType],
      location: [report.governorate, report.city, report.address].filter(Boolean).join('، '),
      severity: report.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      status: (`report:${report.status}`) as const,
      submittedAt: report.createdAt,
    })),
    weeklyReports: buildWeeklyReports(reportItems),
    operationalSummary: [
      { label: 'بلاغات مفتوحة', value: openReports.length || ((reports?.enRouteCount ?? 0) + (reports?.receivedCount ?? 0)) },
      { label: 'طلبات تبني معلقة', value: adoption?.pendingReview ?? 0 },
      { label: 'نقاط إطعام نشطة', value: feeding?.activePoints ?? 0 },
      { label: 'جمعيات نشطة', value: organizations?.active ?? 0 },
    ],
  };
}

async function supplementSummary(summary: DashboardSummary, range: DashboardRange, signal?: AbortSignal): Promise<DashboardSummary> {
  const needsFeatureData = summary.weeklyReports.length === 0 || summary.activeMissions.length === 0 || summary.criticalReports.length === 0;
  if (!needsFeatureData) return summary;
  try {
    const fallback = await buildSummaryFromFeatureApis(range, signal);
    return {
      ...summary,
      weeklyReports: summary.weeklyReports.length ? summary.weeklyReports : fallback.weeklyReports,
      activeMissions: summary.activeMissions.length ? summary.activeMissions : fallback.activeMissions,
      criticalReports: summary.criticalReports.length ? summary.criticalReports : fallback.criticalReports,
    };
  } catch {
    return summary;
  }
}

function normalizeAttention(value: unknown): AttentionItem[] {
  return arr(value).map((entry, index) => {
    const item = rec(entry);
    const type = text(item.type).toUpperCase();
    const resourceId = text(item.resourceId);
    const createdAt = new Date(timestamp(item.createdAt)).getTime();
    const waitingMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60_000));
    const target = type === 'REPORT'
      ? `/reports/${encodeURIComponent(resourceId)}`
      : type === 'ADOPTION'
        ? `/adoption-requests/${encodeURIComponent(resourceId)}`
        : type === 'ORGANIZATION'
          ? `/organizations/${encodeURIComponent(resourceId)}`
          : '/';
    const severity: AttentionItem['severity'] = type === 'REPORT' ? 'critical' : 'pending';
    return {
      id: text(item.id) || `attention-${index}`,
      title: text(item.title) || 'عنصر يحتاج متابعة',
      detail: type === 'REPORT' ? 'بلاغ حرج مفتوح' : type === 'ADOPTION' ? 'طلب تبنّي بانتظار المراجعة' : 'جمعية تحتاج متابعة',
      severity,
      waitingMinutes,
      target,
      actionLabel: 'فتح التفاصيل',
    };
  });
}

async function buildAttentionFromFeatureApis(signal?: AbortSignal): Promise<AttentionItem[]> {
  const [reportsResult, adoptionsResult, organizationsResult] = await Promise.allSettled([
    reportsApi.getReports({ search: '', page: 1, pageSize: 30, sortBy: 'createdAt', sortDirection: 'desc' }, signal),
    adoptionApi.getAdoptionRequests({ search: '', status: 'PENDING_REVIEW', page: 1, pageSize: 10, sortBy: 'submittedAt', sortDirection: 'desc' }, signal),
    organizationsApi.getOrganizations({ search: '', verificationStatus: 'PENDING', page: 1, pageSize: 10, sortBy: 'createdAt', sortDirection: 'desc' }, signal),
  ]);
  const now = Date.now();
  const waiting = (date: string) => Math.max(0, Math.floor((now - new Date(date).getTime()) / 60_000));
  const items: AttentionItem[] = [];

  if (reportsResult.status === 'fulfilled') {
    items.push(...reportsResult.value.items
      .filter((report) => report.status !== 'CLOSED' && (report.severity === 'CRITICAL' || report.severity === 'HIGH'))
      .map((report) => ({ id: `report-${report.id}`, title: report.title, detail: 'بلاغ حرج مفتوح', severity: 'critical' as const, waitingMinutes: waiting(report.createdAt), target: `/reports/${encodeURIComponent(report.id)}`, actionLabel: 'فتح التفاصيل' })));
  }
  if (adoptionsResult.status === 'fulfilled') {
    items.push(...adoptionsResult.value.items.map((request) => ({ id: `adoption-${request.id}`, title: request.title, detail: 'طلب تبنّي بانتظار المراجعة', severity: 'pending' as const, waitingMinutes: waiting(request.submittedAt), target: `/adoption-requests/${encodeURIComponent(request.id)}`, actionLabel: 'فتح التفاصيل' })));
  }
  if (organizationsResult.status === 'fulfilled') {
    items.push(...organizationsResult.value.items.map((organization) => ({ id: `organization-${organization.id}`, title: organization.name, detail: 'جمعية تحتاج مراجعة', severity: 'pending' as const, waitingMinutes: waiting(organization.createdAt), target: `/organizations/${encodeURIComponent(organization.id)}`, actionLabel: 'فتح التفاصيل' })));
  }
  return items.sort((a, b) => b.waitingMinutes - a.waitingMinutes).slice(0, 10);
}

function normalizeActivity(value: unknown): RecentActivity[] {
  return arr(value).map((entry, index) => {
    const item = rec(entry);
    const resourceType = text(item.resourceType).toUpperCase();
    const resourceId = text(item.resourceId);
    const target = resourceType.includes('ORGANIZATION') ? `/organizations/${encodeURIComponent(resourceId)}`
      : resourceType.includes('REPORT') ? `/reports/${encodeURIComponent(resourceId)}`
        : resourceType.includes('ADOPTION') ? `/adoption-requests/${encodeURIComponent(resourceId)}`
          : resourceType.includes('ADVERTISEMENT') ? `/advertisements/${encodeURIComponent(resourceId)}`
            : '/audit-log';
    const action = text(item.action) || 'UPDATE';
    const kind: RecentActivity['kind'] = resourceType.includes('ORGANIZATION') ? 'organization-approved'
      : resourceType.includes('ADOPTION') ? 'adoption-approved'
        : resourceType.includes('ADVERTISEMENT') ? 'advertisement-suspended'
          : action.includes('COMPLETE') || action.includes('CLOSE') ? 'mission-completed'
            : 'mission-assigned';
    return { id: text(item.id) || `activity-${index}`, kind, actor: text(item.actor) || 'النظام', action, resource: text(item.description) || `${resourceType || 'RESOURCE'} ${resourceId}`.trim(), occurredAt: timestamp(item.at), target };
  });
}

function normalizeGeography(value: unknown): GeographicSnapshot {
  const rows = arr(value).map(rec);
  const reports = rows.reduce((sum, item) => sum + num(item.reports), 0);
  const feedingPoints = rows.reduce((sum, item) => sum + num(item.feedingPoints), 0);
  return { coverageLabel: rows.length ? `${rows.length} محافظة` : 'لا توجد بيانات جغرافية', lastSyncedAt: new Date().toISOString(), layers: [{ key: 'waiting-reports', label: 'البلاغات', count: reports, tone: 'pending' }, { key: 'missions', label: 'نقاط الإطعام', count: feedingPoints, tone: 'info' }] };
}

export async function getDashboardSummary(range: DashboardRange, signal?: AbortSignal): Promise<DashboardSummary> {
  try {
    const summary = normalizeSummary(await apiClient.get<unknown>(`/api/dashboard/dashboard/summary?range=${encodeURIComponent(range)}`, signal));
    return supplementSummary(summary, range, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return buildSummaryFromFeatureApis(range, signal);
  }
}

export async function getAttentionQueue(signal?: AbortSignal): Promise<AttentionItem[]> {
  try {
    return normalizeAttention(await apiClient.get<unknown[]>('/api/dashboard/dashboard/attention', signal));
  } catch (error) {
    if (signal?.aborted) throw error;
    return buildAttentionFromFeatureApis(signal);
  }
}

export async function getRecentActivity(signal?: AbortSignal): Promise<RecentActivity[]> {
  return normalizeActivity(await apiClient.get<unknown[]>('/api/dashboard/dashboard/recent-activity', signal));
}

export async function getGeographicSnapshot(signal?: AbortSignal): Promise<GeographicSnapshot> {
  return normalizeGeography(await apiClient.get<unknown[]>('/api/dashboard/dashboard/geographic-snapshot', signal));
}
