import { getAdoptionDashboardSnapshot } from '@/features/adoption-requests/services/adoption-requests.mock';
import { getDonationSummary } from '@/features/donations/services/donations.mock';
import { formatMoney } from '@/features/donations/utils';
import { getOrganizationDashboardSnapshot } from '@/features/organizations/services/organizations.mock';
import { getReportOperationalSnapshot } from '@/features/reports/services/reports.mock';
import { mockDelay } from '@/services/mock/delay';
import type { AttentionItem, DashboardRange, DashboardSummary, GeographicSnapshot, RecentActivity } from '../types';

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60);
}

const rangeMultiplier: Record<DashboardRange, number> = {
  TODAY: 1,
  '7D': 5.8,
  '30D': 23.4,
};

export async function getDashboardSummary(range: DashboardRange): Promise<DashboardSummary> {
  await mockDelay(220);

  const multiplier = rangeMultiplier[range];

  // Load the dashboard snapshots in parallel to keep the mock response fast.
  const [reportSnapshot, adoptionSnapshot, organizationSnapshot, donationSnapshot] = await Promise.all([
    getReportOperationalSnapshot(),
    getAdoptionDashboardSnapshot(),
    getOrganizationDashboardSnapshot(),
    getDonationSummary(),
  ]);

  return {
    generatedAt: new Date().toISOString(),

    metrics: [
      {
        id: 'today-reports',
        label: 'بلاغات اليوم',
        value: reportSnapshot.todayCount,
        context: 'البلاغات المسجلة اليوم',
        tone: 'info',
        target: '/reports?range=today',
        iconKey: 'reports',
      },
      {
        id: 'waiting-org',
        label: 'بانتظار جمعية',
        value: reportSnapshot.unassignedCount,
        context: 'بلاغات لم تستلمها جمعية بعد',
        tone: 'pending',
        target: '/reports',
        iconKey: 'waiting',
      },
      {
        id: 'donations-month',
        label: 'تبرعات مؤرشفة هذا الشهر',
        value:
          donationSnapshot.thisMonth
            .map((transaction) =>
              formatMoney(transaction.amountMinor, transaction.currency),
            )
            .join(' + ') || '0 ل.س',
        context: `${donationSnapshot.donorCount} متبرع ضمن الأرشيف`,
        tone: 'success',
        target: '/donations',
        iconKey: 'donations',
      },
      {
        id: 'adoption-pending',
        label: 'عروض تبني للمراجعة',
        value: adoptionSnapshot.pendingReview,
        context: `${adoptionSnapshot.pendingApplications} طلبات تبنٍ بانتظار رد الناشر`,
        tone: 'pending',
        target: '/adoption-requests?status=PENDING_REVIEW',
        iconKey: 'adoptions',
      },
      {
        id: 'organizations-pending',
        label: 'جمعيات تنتظر الاعتماد',
        value: organizationSnapshot.pending,
        context: 'تحتاج إلى مراجعة المستندات',
        tone: 'pending',
        target: '/organizations?status=PENDING_VERIFICATION',
        iconKey: 'organizations',
      },
    ],

    /*
     * Keep this field temporarily while DashboardSummary still expects it.
     * It can be removed after ActiveMission is removed from the dashboard types.
     */
    activeMissions: [],

    criticalReports: [
      {
        id: 'RQ-2026-00481',
        animal: 'كلب',
        location: 'دمشق — المزة',
        severity: 'CRITICAL',
        status: 'report:EN_ROUTE',
        submittedAt: minutesAgo(14),
      },
      {
        id: 'RQ-2026-00484',
        animal: 'قطة',
        location: 'دمشق — باب توما',
        severity: 'CRITICAL',
        status: 'report:RECEIVED',
        submittedAt: minutesAgo(27),
      },
      {
        id: 'RQ-2026-00486',
        animal: 'كلب',
        location: 'حلب — الحمدانية',
        severity: 'CRITICAL',
        status: 'report:EN_ROUTE',
        submittedAt: minutesAgo(39),
      },
      {
        id: 'RQ-2026-00504',
        animal: 'كلب',
        location: 'دمشق — برزة',
        severity: 'CRITICAL',
        status: 'report:CLOSED',
        submittedAt: minutesAgo(51),
      },
    ],

    weeklyReports: [
      { day: 'السبت', received: 32, closed: 24 },
      { day: 'الأحد', received: 41, closed: 31 },
      { day: 'الاثنين', received: 38, closed: 35 },
      { day: 'الثلاثاء', received: 46, closed: 39 },
      { day: 'الأربعاء', received: 43, closed: 37 },
      { day: 'الخميس', received: 51, closed: 44 },
      { day: 'الجمعة', received: 34, closed: 29 },
    ],

    operationalSummary: [
      {
        label: 'تم إغلاق الحالات',
        value: Math.round(62 * multiplier),
      },
      {
        label: 'تم التبني',
        value: Math.round(29 * multiplier),
      },
      {
        label: 'عروض منشورة',
        value: adoptionSnapshot.published,
      },
    ],
  };
}

export async function getAttentionQueue(): Promise<AttentionItem[]> {
  await mockDelay(160);

  const [reportSnapshot, organizationSnapshot, adoptionSnapshot] = await Promise.all([
    getReportOperationalSnapshot(),
    getOrganizationDashboardSnapshot(),
    getAdoptionDashboardSnapshot(),
  ]);

  const items: AttentionItem[] = [];

  // Only add attention items when there is actual work waiting for review.
  if (reportSnapshot.unassignedCount > 0) {
    items.push({
      id: 'att-reports-waiting',
      title: `${reportSnapshot.unassignedCount} بلاغات بانتظار جمعية`,
      detail: 'بلاغات منشورة لم تستلمها جمعية حتى الآن',
      severity: 'critical',
      waitingMinutes: 47,
      target: '/reports',
      actionLabel: 'عرض البلاغات',
    });
  }

  if (organizationSnapshot.pending > 0) {
    items.push({
      id: 'att-organizations',
      title: `${organizationSnapshot.pending} جمعيات تنتظر التحقق`,
      detail: 'طلبات انضمام تحتاج مراجعة المستندات',
      severity: 'pending',
      waitingMinutes: 185,
      target: '/organizations?status=PENDING_VERIFICATION',
      actionLabel: 'مراجعة الجمعيات',
    });
  }

  if (adoptionSnapshot.pendingReview > 0) {
    items.push({
      id: 'att-adoptions',
      title: `${adoptionSnapshot.pendingReview} عروض تبني بانتظار المراجعة`,
      detail: 'طلبات نشر من مستخدمين أو جمعيات تحتاج تدقيق المحتوى قبل ظهورها',
      severity: 'pending',
      waitingMinutes: 1_560,
      target: '/adoption-requests?status=PENDING_REVIEW',
      actionLabel: 'مراجعة الطلبات',
    });
  }

  return items;
}

/*
 * This is no longer shown on the current dashboard,
 * but it stays temporarily in case another hook still imports it.
 */
export async function getRecentActivity(): Promise<RecentActivity[]> {
  await mockDelay(190);

  return [
    {
      id: 'act-1',
      kind: 'organization-approved',
      actor: 'محمد السالم',
      action: 'اعتمد جمعية',
      resource: 'جمعية أمان للحيوان',
      occurredAt: minutesAgo(21),
      target: '/organizations?status=ACTIVE',
    },
    {
      id: 'act-2',
      kind: 'adoption-approved',
      actor: 'نورة القحطاني',
      action: 'اعتمدت نشر عرض تبني',
      resource: 'ADP-2026-0101',
      occurredAt: hoursAgo(2),
      target: '/adoption-requests?status=PUBLISHED',
    },
  ];
}

/*
 * This is also no longer used by the current dashboard.
 * There is no rescue mission layer in the current structure.
 */
export async function getGeographicSnapshot(): Promise<GeographicSnapshot> {
  await mockDelay(140);

  const [reportSnapshot, organizationSnapshot] = await Promise.all([
    getReportOperationalSnapshot(),
    getOrganizationDashboardSnapshot(),
  ]);

  return {
    coverageLabel: 'المحافظات السورية ضمن نطاق التشغيل',
    lastSyncedAt: new Date().toISOString(),

    layers: [
      {
        key: 'waiting-reports',
        label: 'بلاغات بانتظار جمعية',
        count: reportSnapshot.unassignedCount,
        tone: 'critical',
      },
      {
        key: 'organizations',
        label: 'جمعيات نشطة',
        count: organizationSnapshot.active ?? 0,
        tone: 'success',
      },
    ],
  };
}