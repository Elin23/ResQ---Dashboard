import { apiClient } from '@/services/api/client';
import type { AttentionItem, DashboardRange, DashboardSummary, GeographicSnapshot, RecentActivity } from '../types';

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
    // The dashboard backend currently exposes aggregate summary data only for these sections.
    // Keep unsupported visualization collections empty instead of fabricating data in the client.
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
    return {
      id: text(item.id) || `activity-${index}`,
      kind,
      actor: text(item.actor) || 'النظام',
      action,
      resource: text(item.description) || `${resourceType || 'RESOURCE'} ${resourceId}`.trim(),
      occurredAt: timestamp(item.at),
      target,
    };
  });
}

function normalizeGeography(value: unknown): GeographicSnapshot {
  const rows = arr(value).map(rec);
  const reports = rows.reduce((sum, item) => sum + num(item.reports), 0);
  const feedingPoints = rows.reduce((sum, item) => sum + num(item.feedingPoints), 0);
  return {
    coverageLabel: rows.length ? `${rows.length} محافظة` : 'لا توجد بيانات جغرافية',
    lastSyncedAt: new Date().toISOString(),
    layers: [
      { key: 'waiting-reports', label: 'البلاغات', count: reports, tone: 'pending' },
      { key: 'missions', label: 'نقاط الإطعام', count: feedingPoints, tone: 'info' },
    ],
  };
}

export async function getDashboardSummary(range: DashboardRange, signal?: AbortSignal): Promise<DashboardSummary> {
  return normalizeSummary(await apiClient.get<unknown>(`/api/dashboard/dashboard/summary?range=${encodeURIComponent(range)}`, signal));
}

export async function getAttentionQueue(signal?: AbortSignal): Promise<AttentionItem[]> {
  return normalizeAttention(await apiClient.get<unknown[]>('/api/dashboard/dashboard/attention', signal));
}

export async function getRecentActivity(signal?: AbortSignal): Promise<RecentActivity[]> {
  return normalizeActivity(await apiClient.get<unknown[]>('/api/dashboard/dashboard/recent-activity', signal));
}

export async function getGeographicSnapshot(signal?: AbortSignal): Promise<GeographicSnapshot> {
  return normalizeGeography(await apiClient.get<unknown[]>('/api/dashboard/dashboard/geographic-snapshot', signal));
}
