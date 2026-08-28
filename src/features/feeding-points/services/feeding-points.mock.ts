import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import type { AdminSession } from '@/features/auth/session';
import { getOrganizationFixture } from '@/features/organizations/services/organization-fixtures';
import { getUserById } from '@/features/users/services/users.mock';
import { mockDelay } from '@/services/mock/delay';
import type { DeactivateFeedingPointInput, FeedingPoint, FeedingPointDetails, FeedingPointFilters, FeedingPointInternalNote, FeedingPointIssue, FeedingPointListResult, FeedingPointRefill, FeedingPointSummary, FeedingPointTimelineEvent, RejectFeedingPointInput, RejectIssueInput, ResolveIssueInput, ReviewRefillInput } from '../types';

const now = Date.now();

const hoursAgo = (n: number) =>
  new Date(now - n * 3_600_000).toISOString();

const daysAgo = (n: number) =>
  new Date(now - n * 86_400_000).toISOString();

const clone = <T,>(value: T): T =>
  structuredClone(value);

const media = (id: string, seed: number) => [
  {
    id: `${id}-img-1`,
    type: 'IMAGE' as const,
    url: `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`,
    caption: 'صورة توثيقية للموقع',
    createdAt: daysAgo(4),
  },
  {
    id: `${id}-img-2`,
    type: 'IMAGE' as const,
    url: `https://images.unsplash.com/photo-${seed + 1}?auto=format&fit=crop&w=1200&q=70`,
    caption: 'صورة إضافية للنقطة',
    createdAt: daysAgo(2),
  },
];

const orgName = (id: string) =>
  getOrganizationFixture(id)?.name ?? 'جمعية مسجلة';

let points: FeedingPoint[] = [
  {
    id: 'FP-0042',
    name: 'نقطة حديقة المزة',
    status: 'ACTIVE',
    description: 'نقطة ثابتة قرب الحديقة العامة تخدم الحيوانات في المنطقة.',
    location: {
      governorate: 'دمشق',
      city: 'المزة',
      address: 'قرب حديقة المزة العامة، المدخل الشرقي',
      latitude: 33.4997,
      longitude: 36.2508,
    },
    createdBy: {
      type: 'ORGANIZATION',
      id: 'ORG-001',
      name: orgName('ORG-001'),
    },
    media: media('FP-0042', 1592194996308),
    condition: 'GOOD',
    foodLevel: 'MEDIUM',
    waterAvailable: true,
    lastVerifiedRefillAt: hoursAgo(18),
    latestRefillReportAt: hoursAgo(2),
    createdAt: daysAgo(190),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'FP-0043',
    name: 'نقطة الفرقان المقترحة',
    status: 'PENDING',
    description: 'موقع مقترح في شارع هادئ قريب من تجمع قطط معروف.',
    location: {
      governorate: 'حلب',
      city: 'الفرقان',
      address: 'الفرقان، قرب الحديقة الصغيرة',
      latitude: 36.2074,
      longitude: 37.1242,
    },
    createdBy: {
      type: 'USER',
      id: 'USR-1003',
      name: 'مستخدم مسجل',
    },
    media: media('FP-0043', 1518791841217),
    condition: 'UNKNOWN',
    foodLevel: 'UNKNOWN',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    reviewMetadata: {
      nearbyPointId: 'FP-0051',
      distanceMeters: 120,
    },
  },
  {
    id: 'FP-0044',
    name: 'نقطة الوعر الغربية',
    status: 'ACTIVE',
    description: 'نقطة ثابتة في الساحة الغربية وتحتاج متابعة دورية.',
    location: {
      governorate: 'حمص',
      city: 'الوعر',
      address: 'الوعر، جانب الساحة الغربية',
      latitude: 34.7426,
      longitude: 36.6764,
    },
    createdBy: {
      type: 'ORGANIZATION',
      id: 'ORG-004',
      name: orgName('ORG-004'),
    },
    media: media('FP-0044', 1548681528),
    condition: 'DAMAGED',
    foodLevel: 'LOW',
    waterAvailable: false,
    lastVerifiedRefillAt: daysAgo(2),
    latestRefillReportAt: hoursAgo(8),
    createdAt: daysAgo(145),
    updatedAt: hoursAgo(8),
  },
  {
    id: 'FP-0045',
    name: 'نقطة ركن الدين',
    status: 'ACTIVE',
    location: {
      governorate: 'دمشق',
      city: 'ركن الدين',
      address: 'ركن الدين، قرب ساحة شمدين',
      latitude: 33.5353,
      longitude: 36.2924,
    },
    createdBy: {
      type: 'USER',
      id: 'USR-1001',
      name: 'مستخدم مسجل',
    },
    media: media('FP-0045', 1535930749574),
    condition: 'GOOD',
    foodLevel: 'FULL',
    waterAvailable: true,
    lastVerifiedRefillAt: hoursAgo(5),
    latestRefillReportAt: hoursAgo(5),
    createdAt: daysAgo(120),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'FP-0046',
    name: 'نقطة الزراعة',
    status: 'ACTIVE',
    location: {
      governorate: 'اللاذقية',
      city: 'الزراعة',
      address: 'حي الزراعة، خلف الموقف',
      latitude: 35.5326,
      longitude: 35.7909,
    },
    createdBy: {
      type: 'USER',
      id: 'USR-1004',
      name: 'مستخدم مسجل',
    },
    media: media('FP-0046', 1518717758536),
    condition: 'NEEDS_CLEANING',
    foodLevel: 'MEDIUM',
    waterAvailable: true,
    lastVerifiedRefillAt: daysAgo(1),
    latestRefillReportAt: daysAgo(1),
    createdAt: daysAgo(88),
    updatedAt: daysAgo(1),
  },
  {
    id: 'FP-0047',
    name: 'نقطة المحطة',
    status: 'INACTIVE',
    location: {
      governorate: 'درعا',
      city: 'المحطة',
      address: 'حي المحطة، الشارع الرئيسي',
      latitude: 32.6261,
      longitude: 36.1078,
    },
    createdBy: {
      type: 'ORGANIZATION',
      id: 'ORG-006',
      name: orgName('ORG-006'),
    },
    media: media('FP-0047', 1537151608828),
    condition: 'MISSING',
    foodLevel: 'UNKNOWN',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(12),
    inactiveReason: 'تعذر الوصول إلى موقع النقطة بعد أعمال الطريق.',
  },
  {
    id: 'FP-0048',
    name: 'نقطة جرمانا',
    status: 'REJECTED',
    location: {
      governorate: 'ريف دمشق',
      city: 'جرمانا',
      address: 'جرمانا، قرب المدخل الشمالي',
      latitude: 33.4867,
      longitude: 36.3468,
    },
    createdBy: {
      type: 'USER',
      id: 'USR-1002',
      name: 'مستخدم مسجل',
    },
    media: media('FP-0048', 1573865526739),
    condition: 'UNKNOWN',
    foodLevel: 'UNKNOWN',
    createdAt: daysAgo(19),
    updatedAt: daysAgo(16),
    rejectionReason: 'الموقع غير آمن بسبب حركة المركبات الكثيفة.',
  },
  {
    id: 'FP-0049',
    name: 'نقطة طرطوس البحرية',
    status: 'ACTIVE',
    location: {
      governorate: 'طرطوس',
      city: 'المدينة',
      address: 'الكورنيش الشرقي، قرب موقف الحافلات',
      latitude: 34.8958,
      longitude: 35.8866,
    },
    createdBy: {
      type: 'USER',
      id: 'USR-1006',
      name: 'مستخدم مسجل',
    },
    media: media('FP-0049', 1518022525094),
    condition: 'GOOD',
    foodLevel: 'LOW',
    waterAvailable: false,
    lastVerifiedRefillAt: daysAgo(3),
    latestRefillReportAt: hoursAgo(4),
    createdAt: daysAgo(70),
    updatedAt: hoursAgo(4),
  },
  {
    id: 'FP-0051',
    name: 'نقطة الفرقان المركزية',
    status: 'ACTIVE',
    location: {
      governorate: 'حلب',
      city: 'الفرقان',
      address: 'الفرقان، قرب دوار الحديقة',
      latitude: 36.2081,
      longitude: 37.1233,
    },
    createdBy: {
      type: 'ORGANIZATION',
      id: 'ORG-003',
      name: orgName('ORG-003'),
    },
    media: media('FP-0051', 1546182990),
    condition: 'GOOD',
    foodLevel: 'MEDIUM',
    waterAvailable: true,
    lastVerifiedRefillAt: daysAgo(2),
    latestRefillReportAt: daysAgo(2),
    createdAt: daysAgo(210),
    updatedAt: daysAgo(2),
  },
  {
    id: 'FP-0052',
    name: 'نقطة الميدان',
    status: 'PENDING',
    location: {
      governorate: 'دمشق',
      city: 'الميدان',
      address: 'الميدان، زقاق جانبي هادئ',
      latitude: 33.4975,
      longitude: 36.3067,
    },
    createdBy: {
      type: 'USER',
      id: 'USR-1301',
      name: 'مستخدم مسجل',
    },
    media: media('FP-0052', 1558788353),
    condition: 'GOOD',
    foodLevel: 'UNKNOWN',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
];

const refills = new Map<string, FeedingPointRefill[]>();
const issues = new Map<string, FeedingPointIssue[]>();
const timelines = new Map<string, FeedingPointTimelineEvent[]>();
const notes = new Map<string, FeedingPointInternalNote[]>();

function makeRefill(
  pointId: string,
  suffix: string,
  status: FeedingPointRefill['reviewStatus'],
  actor: FeedingPointRefill['submittedBy'],
  at: string,
  seed: number,
  note?: string,
): FeedingPointRefill {
  return {
    id: `RF-${pointId}-${suffix}`,
    feedingPointId: pointId,
    submittedBy: actor,
    foodLevelAfter: 'FULL',
    waterAvailableAfter: true,
    note,
    media: media(`RF-${pointId}-${suffix}`, seed).slice(0, 1),
    occurredAt: at,
    createdAt: at,
    reviewStatus: status,
    ...(status === 'VERIFIED'
      ? {
          reviewedAt: at,
          reviewedBy: {
            id: 'ADM-001',
            name: 'أحمد الخطيب',
          },
        }
      : {}),
    ...(status === 'REJECTED'
      ? {
          reviewedAt: at,
          reviewedBy: {
            id: 'ADM-001',
            name: 'أحمد الخطيب',
          },
          rejectionReason: 'الصورة لا تثبت إعادة التعبئة بشكل كافٍ',
        }
      : {}),
  };
}

// Seed refill, issue, timeline, and note history for the mock repository.
function seed() {
  refills.set('FP-0042', [
    makeRefill(
      'FP-0042',
      '02',
      'PENDING',
      {
        type: 'USER',
        id: 'USR-1001',
        name: 'مستخدم مسجل',
      },
      hoursAgo(2),
      1526334889164,
      'تمت إضافة الطعام والماء.',
    ),
    makeRefill(
      'FP-0042',
      '01',
      'VERIFIED',
      {
        type: 'ORGANIZATION',
        id: 'ORG-001',
        name: orgName('ORG-001'),
      },
      hoursAgo(18),
      1517849845537,
    ),
  ]);

  refills.set('FP-0044', [
    makeRefill(
      'FP-0044',
      '02',
      'PENDING',
      {
        type: 'ORGANIZATION',
        id: 'ORG-004',
        name: orgName('ORG-004'),
      },
      hoursAgo(8),
      1547592180,
      'تمت تعبئة الوعاء رغم وجود ضرر بالحامل.',
    ),
    makeRefill(
      'FP-0044',
      '01',
      'VERIFIED',
      {
        type: 'USER',
        id: 'USR-1003',
        name: 'مستخدم مسجل',
      },
      daysAgo(2),
      1495567720989,
    ),
  ]);

  refills.set('FP-0045', [
    makeRefill(
      'FP-0045',
      '01',
      'VERIFIED',
      {
        type: 'USER',
        id: 'USR-1004',
        name: 'مستخدم مسجل',
      },
      hoursAgo(5),
      1558944351,
    ),
  ]);

  refills.set('FP-0046', [
    makeRefill(
      'FP-0046',
      '01',
      'VERIFIED',
      {
        type: 'ORGANIZATION',
        id: 'ORG-005',
        name: orgName('ORG-005'),
      },
      daysAgo(1),
      1543852786,
    ),
  ]);

  refills.set('FP-0049', [
    makeRefill(
      'FP-0049',
      '03',
      'PENDING',
      {
        type: 'USER',
        id: 'USR-1006',
        name: 'مستخدم مسجل',
      },
      hoursAgo(4),
      1496196614463,
      'أعدت تعبئة الطعام فقط.',
    ),
    makeRefill(
      'FP-0049',
      '02',
      'REJECTED',
      {
        type: 'USER',
        id: 'USR-1002',
        name: 'مستخدم مسجل',
      },
      daysAgo(1),
      1531988042231,
    ),
    makeRefill(
      'FP-0049',
      '01',
      'VERIFIED',
      {
        type: 'ORGANIZATION',
        id: 'ORG-005',
        name: orgName('ORG-005'),
      },
      daysAgo(3),
      1527864048,
    ),
  ]);

  refills.set('FP-0051', [
    makeRefill(
      'FP-0051',
      '01',
      'VERIFIED',
      {
        type: 'ORGANIZATION',
        id: 'ORG-003',
        name: orgName('ORG-003'),
      },
      daysAgo(2),
      1560807707,
    ),
  ]);

  issues.set('FP-0044', [
    {
      id: 'ISS-102',
      feedingPointId: 'FP-0044',
      type: 'DAMAGED',
      status: 'OPEN',
      description: 'الحامل الخارجي متضرر والوعاء غير ثابت.',
      submittedBy: {
        type: 'ORGANIZATION',
        id: 'ORG-004',
        name: orgName('ORG-004'),
      },
      media: media('ISS-102', 1599305445).slice(0, 1),
      createdAt: hoursAgo(10),
    },
  ]);

  issues.set('FP-0046', [
    {
      id: 'ISS-103',
      feedingPointId: 'FP-0046',
      type: 'DIRTY',
      status: 'RESOLVED',
      description: 'تراكم أتربة حول أوعية الطعام.',
      submittedBy: {
        type: 'USER',
        id: 'USR-1004',
        name: 'مستخدم مسجل',
      },
      createdAt: daysAgo(5),
      resolvedAt: daysAgo(4),
      resolutionNote: 'تم تنظيف النقطة وتعقيم الأوعية.',
    },
  ]);

  for (const point of points) {
    const events: FeedingPointTimelineEvent[] = [
      {
        id: `${point.id}-created`,
        action: 'تم تقديم طلب إضافة نقطة إطعام',
        actor: point.createdBy.name,
        timestamp: point.createdAt,
        tone: 'info',
      },
    ];

    if (point.status === 'ACTIVE') {
      events.unshift({
        id: `${point.id}-approved`,
        action: 'تمت الموافقة على نشر نقطة الإطعام',
        actor: 'فريق الإدارة',
        timestamp: point.updatedAt,
        tone: 'success',
      });
    }

    if (point.status === 'REJECTED') {
      events.unshift({
        id: `${point.id}-rejected`,
        action: 'تم رفض طلب إضافة النقطة',
        actor: 'فريق الإدارة',
        timestamp: point.updatedAt,
        details: point.rejectionReason,
        tone: 'critical',
      });
    }

    if (point.status === 'INACTIVE') {
      events.unshift({
        id: `${point.id}-inactive`,
        action: 'تم تعطيل نقطة الإطعام',
        actor: 'فريق الإدارة',
        timestamp: point.updatedAt,
        details: point.inactiveReason,
        tone: 'neutral',
      });
    }

    timelines.set(point.id, events);
    notes.set(point.id, []);
  }
}

seed();

// Replace mock user labels with the current user fixture when available.
async function hydrateActor<T extends { type: 'USER' | 'ORGANIZATION'; id: string; name: string }>(actor: T): Promise<T> {
  if (actor.type === 'USER') {
    const user = await getUserById(actor.id);

    if (user) {
      return {
        ...actor,
        name: user.user.fullName,
      };
    }
  }

  return actor;
}

async function hydratePoint(point: FeedingPoint): Promise<FeedingPoint> {
  return {
    ...point,
    createdBy: await hydrateActor(point.createdBy),
  };
}

async function hydrateRefill(refill: FeedingPointRefill): Promise<FeedingPointRefill> {
  return {
    ...refill,
    submittedBy: await hydrateActor(refill.submittedBy),
  };
}

async function hydrateIssue(issue: FeedingPointIssue): Promise<FeedingPointIssue> {
  return {
    ...issue,
    submittedBy: await hydrateActor(issue.submittedBy),
  };
}

function addEvent(id: string, event: Omit<FeedingPointTimelineEvent, 'id' | 'timestamp'>) {
  const item = {
    id: `${id}-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  // New operational events should appear first in the timeline.
  timelines.set(id, [
    item,
    ...(timelines.get(id) ?? []),
  ]);
}

function updatePoint(id: string, updater: (point: FeedingPoint) => FeedingPoint) {
  const index = points.findIndex((point) => point.id === id);

  if (index < 0) {
    throw new Error('FEEDING_POINT_NOT_FOUND');
  }

  const current = points[index]!;
  const next = updater(current);

  points = [
    ...points.slice(0, index),
    next,
    ...points.slice(index + 1),
  ];

  return next;
}

function pendingRefillCount(id: string) {
  return (refills.get(id) ?? []).filter(
    (item) => item.reviewStatus === 'PENDING',
  ).length;
}

function verifiedRefillCount(id: string) {
  return (refills.get(id) ?? []).filter(
    (item) => item.reviewStatus === 'VERIFIED',
  ).length;
}

function openIssueCount(id: string) {
  return (issues.get(id) ?? []).filter(
    (item) => item.status === 'OPEN' || item.status === 'UNDER_REVIEW',
  ).length;
}

function needsRefill(point: FeedingPoint) {
  if (point.status !== 'ACTIVE') {
    return false;
  }

  if (point.foodLevel === 'LOW' || point.foodLevel === 'EMPTY') {
    return true;
  }

  if (!point.lastVerifiedRefillAt) {
    return true;
  }

  // Consider an active point stale when no refill was verified for 48 hours.
  return (
    Date.now() -
      new Date(point.lastVerifiedRefillAt).getTime() >
    48 * 3_600_000
  );
}

export async function getFeedingPoints(filters: FeedingPointFilters): Promise<FeedingPointListResult> {
  await mockDelay(80);

  let list = await Promise.all(
    points.map(hydratePoint),
  );

  const query = filters.search
    .trim()
    .toLocaleLowerCase('ar');

  list = list.filter((point) => {
    const hay =
      `${point.id} ${point.name ?? ''} ${point.location.address} ${point.location.city ?? ''} ${point.createdBy.name}`
        .toLocaleLowerCase('ar');

    if (query && !hay.includes(query)) {
      return false;
    }

    if (filters.status && point.status !== filters.status) {
      return false;
    }

    if (
      filters.creatorType &&
      point.createdBy.type !== filters.creatorType
    ) {
      return false;
    }

    if (
      filters.governorate &&
      point.location.governorate !== filters.governorate
    ) {
      return false;
    }

    if (
      filters.organizationId &&
      (
        point.createdBy.type !== 'ORGANIZATION' ||
        point.createdBy.id !== filters.organizationId
      )
    ) {
      return false;
    }

    if (
      filters.pendingRefills !== undefined &&
      (pendingRefillCount(point.id) > 0) !== filters.pendingRefills
    ) {
      return false;
    }

    if (
      filters.hasOpenIssues !== undefined &&
      (openIssueCount(point.id) > 0) !== filters.hasOpenIssues
    ) {
      return false;
    }

    if (
      filters.updatedFrom &&
      new Date(point.updatedAt) <
        new Date(`${filters.updatedFrom}T00:00:00`)
    ) {
      return false;
    }

    if (
      filters.updatedTo &&
      new Date(point.updatedAt) >
        new Date(`${filters.updatedTo}T23:59:59`)
    ) {
      return false;
    }

    return true;
  });

  list.sort((a, b) => {
    const by = filters.sortBy ?? 'updatedAt';

    let value = 0;

    if (by === 'name') {
      value = (a.name ?? a.id).localeCompare(
        b.name ?? b.id,
        'ar',
      );
    } else if (by === 'status') {
      value = a.status.localeCompare(b.status);
    } else {
      value =
        new Date(a[by]).getTime() -
        new Date(b[by]).getTime();
    }

    return (filters.sortDirection === 'asc' ? 1 : -1) * value;
  });

  const total = list.length;
  const pageCount = Math.max(
    1,
    Math.ceil(total / filters.pageSize),
  );
  const page = Math.min(
    filters.page,
    pageCount,
  );

  const items = list
    .slice(
      (page - 1) * filters.pageSize,
      page * filters.pageSize,
    )
    .map((point) => ({
      ...clone(point),
      pendingRefillsCount: pendingRefillCount(point.id),
      verifiedRefillsCount: verifiedRefillCount(point.id),
      openIssuesCount: openIssueCount(point.id),
      needsRefill: needsRefill(point),
    }));

  return {
    items,
    total,
    page,
    pageSize: filters.pageSize,
    pageCount,
  };
}

export async function getFeedingPointSummary(): Promise<FeedingPointSummary> {
  await mockDelay(40);

  return {
    pendingPoints: points.filter(
      (point) => point.status === 'PENDING',
    ).length,
    pendingRefills: [...refills.values()]
      .flat()
      .filter(
        (item) => item.reviewStatus === 'PENDING',
      ).length,
    activePoints: points.filter(
      (point) => point.status === 'ACTIVE',
    ).length,
    inactivePoints: points.filter(
      (point) => point.status === 'INACTIVE',
    ).length,
  };
}

export async function getFeedingPointById(id: string): Promise<FeedingPointDetails | null> {
  await mockDelay(70);

  const raw = points.find(
    (point) => point.id === id,
  );

  if (!raw) {
    return null;
  }

  return {
    point: clone(
      await hydratePoint(raw),
    ),
    refills: clone(
      await Promise.all(
        (refills.get(id) ?? []).map(hydrateRefill),
      ),
    ).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    ),
    issues: clone(
      await Promise.all(
        (issues.get(id) ?? []).map(hydrateIssue),
      ),
    ),
    timeline: clone(
      timelines.get(id) ?? [],
    ).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    ),
    notes: clone(
      notes.get(id) ?? [],
    ),
  };
}

export async function approveFeedingPoint(id: string, actor: AdminSession) {
  await mockDelay(70);

  const current = points.find(
    (point) => point.id === id,
  );

  if (!current || current.status !== 'PENDING') {
    throw new Error('INVALID_POINT_TRANSITION');
  }

  const next = updatePoint(id, (point) => ({
    ...point,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  }));

  addEvent(id, {
    action: 'تمت الموافقة على نشر نقطة الإطعام',
    actor: actor.name,
    tone: 'success',
  });

  recordAdminAuditEvent(actor, {
    action: 'FEEDING_POINT_APPROVED',
    resource: {
      type: 'FEEDING_POINT',
      id,
      label: next.name ?? id,
    },
    previousValue: {
      status: 'PENDING',
    },
    newValue: {
      status: 'ACTIVE',
    },
    metadata: {
      source: 'نقاط الإطعام',
    },
  });

  return clone(next);
}

export async function rejectFeedingPoint(id: string, input: RejectFeedingPointInput, actor: AdminSession) {
  await mockDelay(70);

  const current = points.find(
    (point) => point.id === id,
  );

  if (!current || current.status !== 'PENDING') {
    throw new Error('INVALID_POINT_TRANSITION');
  }

  const reason =
    input.reason === 'سبب آخر'
      ? input.otherReason ?? input.reason
      : input.reason;

  const next = updatePoint(id, (point) => ({
    ...point,
    status: 'REJECTED',
    rejectionReason: reason,
    updatedAt: new Date().toISOString(),
  }));

  addEvent(id, {
    action: 'تم رفض طلب إضافة نقطة الإطعام',
    actor: actor.name,
    details: reason,
    tone: 'critical',
  });

  recordAdminAuditEvent(actor, {
    action: 'FEEDING_POINT_REJECTED',
    resource: {
      type: 'FEEDING_POINT',
      id,
      label: next.name ?? id,
    },
    reason,
    previousValue: {
      status: 'PENDING',
    },
    newValue: {
      status: 'REJECTED',
    },
    metadata: {
      source: 'نقاط الإطعام',
    },
  });

  return clone(next);
}

export async function deactivateFeedingPoint(id: string, input: DeactivateFeedingPointInput, actor: AdminSession) {
  await mockDelay(70);

  const current = points.find(
    (point) => point.id === id,
  );

  if (!current || current.status !== 'ACTIVE') {
    throw new Error('INVALID_POINT_TRANSITION');
  }

  const reason =
    input.reason === 'سبب آخر'
      ? input.otherReason ?? input.reason
      : input.reason;

  const next = updatePoint(id, (point) => ({
    ...point,
    status: 'INACTIVE',
    inactiveReason: reason,
    updatedAt: new Date().toISOString(),
  }));

  addEvent(id, {
    action: 'تم تعطيل نقطة الإطعام',
    actor: actor.name,
    details: reason,
    tone: 'critical',
  });

  recordAdminAuditEvent(actor, {
    action: 'FEEDING_POINT_DEACTIVATED',
    resource: {
      type: 'FEEDING_POINT',
      id,
      label: next.name ?? id,
    },
    reason,
    previousValue: {
      status: 'ACTIVE',
    },
    newValue: {
      status: 'INACTIVE',
    },
    metadata: {
      source: 'نقاط الإطعام',
    },
  });

  return clone(next);
}

export async function reactivateFeedingPoint(id: string, actor: AdminSession) {
  await mockDelay(60);

  const current = points.find(
    (point) => point.id === id,
  );

  if (!current || current.status !== 'INACTIVE') {
    throw new Error('INVALID_POINT_TRANSITION');
  }

  const next = updatePoint(id, (point) => ({
    ...point,
    status: 'ACTIVE',
    inactiveReason: undefined,
    updatedAt: new Date().toISOString(),
  }));

  addEvent(id, {
    action: 'تمت إعادة تفعيل نقطة الإطعام',
    actor: actor.name,
    tone: 'success',
  });

  return clone(next);
}

export async function reviewFeedingPointRefill(pointId: string, refillId: string, input: ReviewRefillInput, actor: AdminSession) {
  await mockDelay(70);

  const list = refills.get(pointId) ?? [];
  const target = list.find(
    (item) => item.id === refillId,
  );

  if (!target || target.reviewStatus !== 'PENDING') {
    throw new Error('INVALID_REFILL_TRANSITION');
  }

  const reviewedAt = new Date().toISOString();

  const next: FeedingPointRefill = {
    ...target,
    reviewStatus:
      input.decision === 'VERIFY'
        ? 'VERIFIED'
        : 'REJECTED',
    reviewedAt,
    reviewedBy: {
      id: actor.id,
      name: actor.name,
    },
    rejectionReason:
      input.decision === 'REJECT'
        ? input.reason
        : undefined,
  };

  refills.set(
    pointId,
    list.map((item) =>
      item.id === refillId
        ? next
        : item,
    ),
  );

  // Verified refills update the latest known state of the feeding point.
  if (input.decision === 'VERIFY') {
    const point = updatePoint(pointId, (point) => ({
      ...point,
      foodLevel:
        target.foodLevelAfter ??
        point.foodLevel,
      waterAvailable:
        target.waterAvailableAfter ??
        point.waterAvailable,
      lastVerifiedRefillAt:
        target.occurredAt,
      latestRefillReportAt:
        target.occurredAt,
      updatedAt: reviewedAt,
    }));

    addEvent(pointId, {
      action: 'تم التحقق من إعادة تعبئة النقطة',
      actor: actor.name,
      details: `المبلّغ: ${target.submittedBy.name}`,
      tone: 'success',
    });

    recordAdminAuditEvent(actor, {
      action: 'FEEDING_POINT_REFILL_VERIFIED',
      resource: {
        type: 'FEEDING_POINT',
        id: pointId,
        label: point.name ?? pointId,
      },
      newValue: {
        refillId: target.id,
        status: 'VERIFIED',
      },
      metadata: {
        source: 'نقاط الإطعام',
      },
    });
  } else {
    const point = points.find(
      (item) => item.id === pointId,
    );

    addEvent(pointId, {
      action: 'تم رفض بلاغ إعادة التعبئة',
      actor: actor.name,
      details: input.reason,
      tone: 'critical',
    });

    recordAdminAuditEvent(actor, {
      action: 'FEEDING_POINT_REFILL_REJECTED',
      resource: {
        type: 'FEEDING_POINT',
        id: pointId,
        label: point?.name ?? pointId,
      },
      reason: input.reason,
      newValue: {
        refillId: target.id,
        status: 'REJECTED',
      },
      metadata: {
        source: 'نقاط الإطعام',
      },
    });
  }

  return clone(next);
}

export async function startIssueReview(pointId: string, issueId: string, actor: AdminSession) {
  await mockDelay(60);

  const list = issues.get(pointId) ?? [];
  const target = list.find(
    (item) => item.id === issueId,
  );

  if (!target || target.status !== 'OPEN') {
    throw new Error('INVALID_ISSUE_TRANSITION');
  }

  const next = {
    ...target,
    status: 'UNDER_REVIEW' as const,
  };

  issues.set(
    pointId,
    list.map((item) =>
      item.id === issueId
        ? next
        : item,
    ),
  );

  addEvent(pointId, {
    action: 'بدأت مراجعة مشكلة',
    actor: actor.name,
    details: issueId,
    tone: 'pending',
  });

  return clone(next);
}

export async function resolveIssue(pointId: string, issueId: string, input: ResolveIssueInput, actor: AdminSession) {
  await mockDelay(70);

  const list = issues.get(pointId) ?? [];
  const target = list.find(
    (item) => item.id === issueId,
  );

  if (
    !target ||
    !['OPEN', 'UNDER_REVIEW'].includes(target.status)
  ) {
    throw new Error('INVALID_ISSUE_TRANSITION');
  }

  const resolvedAt = new Date().toISOString();

  const next = {
    ...target,
    status: 'RESOLVED' as const,
    resolvedAt,
    resolutionNote: input.resolutionNote,
  };

  issues.set(
    pointId,
    list.map((item) =>
      item.id === issueId
        ? next
        : item,
    ),
  );

  // Resolving cleaning or damage issues restores the point condition.
  if (target.type === 'DIRTY') {
    updatePoint(pointId, (point) => ({
      ...point,
      condition: 'GOOD',
      updatedAt: resolvedAt,
    }));
  }

  if (target.type === 'DAMAGED') {
    updatePoint(pointId, (point) => ({
      ...point,
      condition: 'GOOD',
      updatedAt: resolvedAt,
    }));
  }

  addEvent(pointId, {
    action: 'تم حل مشكلة نقطة الإطعام',
    actor: actor.name,
    details: input.resolutionNote,
    tone: 'success',
  });

  return clone(next);
}

export async function rejectIssue(pointId: string, issueId: string, input: RejectIssueInput, actor: AdminSession) {
  await mockDelay(65);

  const list = issues.get(pointId) ?? [];
  const target = list.find(
    (item) => item.id === issueId,
  );

  if (
    !target ||
    !['OPEN', 'UNDER_REVIEW'].includes(target.status)
  ) {
    throw new Error('INVALID_ISSUE_TRANSITION');
  }

  const reason =
    input.reason === 'سبب آخر'
      ? input.otherReason ?? input.reason
      : input.reason;

  const next = {
    ...target,
    status: 'REJECTED' as const,
    rejectionReason: reason,
  };

  issues.set(
    pointId,
    list.map((item) =>
      item.id === issueId
        ? next
        : item,
    ),
  );

  addEvent(pointId, {
    action: 'تم رفض بلاغ المشكلة',
    actor: actor.name,
    details: reason,
    tone: 'neutral',
  });

  return clone(next);
}

export async function addFeedingPointNote(id: string, note: string, actor: AdminSession) {
  await mockDelay(55);

  if (!points.some((point) => point.id === id)) {
    throw new Error('FEEDING_POINT_NOT_FOUND');
  }

  const created: FeedingPointInternalNote = {
    id: `${id}-note-${Date.now()}`,
    adminName: actor.name,
    adminRole: actor.roleLabel,
    createdAt: new Date().toISOString(),
    note,
  };

  // Internal notes are kept newest-first for the admin details page.
  notes.set(id, [
    created,
    ...(notes.get(id) ?? []),
  ]);

  return clone(created);
}

export async function getResponsibleFeedingPointCount(organizationId: string) {
  await mockDelay(30);

  return points.filter(
    (point) =>
      point.createdBy.type === 'ORGANIZATION' &&
      point.createdBy.id === organizationId &&
      point.status !== 'REJECTED',
  ).length;
}