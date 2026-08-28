import type { AdminSession } from '@/features/auth/session';
import { recordAdminAuditEvent } from '@/features/audit-log/services/audit-log.mock';
import { mockDelay } from '@/services/mock/delay';

import type { Advertisement, AdvertisementAdvertiserSummary, AdvertisementDetails, AdvertisementFilters, AdvertisementListResult, AdvertisementSummary, AdvertisementTimelineEvent, CreateAdvertisementInput } from '../types';

const now = Date.now();

const days = (offset: number) =>
  new Date(now + offset * 86_400_000).toISOString();

const hours = (offset: number) =>
  new Date(now + offset * 3_600_000).toISOString();

const image = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;

const clone = <T,>(value: T): T => structuredClone(value);

const rows: Advertisement[] = [
  {
    id: 'ADVT-2026-0031',
    advertiser: {
      type: 'CLIENT',
      name: 'شركة بيت الحيوان',
    },
    ownerName: 'شركة بيت الحيوان',
    ownerPhone: '0999 123 456',
    agreedAmountMinor: 3_500_000 * 100,
    currency: 'SYP',
    paid: true,
    paymentMethod: 'TRANSFER',
    transferReference: 'TR-2026-118',
    title: 'خصم على مستلزمات الحيوانات',
    publicationTitle: 'خصم خاص لمستخدمي ResQ',
    description: 'عرض على مستلزمات الطعام والعناية لفترة محدودة.',
    creative: {
      type: 'BANNER',
      imageUrl: image('1548199973-03cce0bbc87b'),
      altText: 'إعلان مستلزمات الحيوانات',
      callToActionLabel: 'اعرف أكثر',
    },
    placement: 'HOME_BANNER',
    publicationPhone: '0999 123 456',
    publicationEmail: 'ads@pet-house.example',
    websiteUrl: 'https://example.org/pet-house',
    startAt: days(-2),
    endAt: days(12),
    status: 'ACTIVE',
    createdAt: days(-4),
    updatedAt: hours(-8),
    activatedAt: days(-2),
    performance: {
      impressions: 13400,
      clicks: 620,
      clickThroughRate: 4.6,
      mockData: true,
    },
  },
  {
    id: 'ADVT-2026-0032',
    advertiser: {
      type: 'CLIENT',
      name: 'متجر رفيق',
    },
    ownerName: 'متجر رفيق',
    ownerPhone: '0944 555 221',
    agreedAmountMinor: 2_000_000 * 100,
    currency: 'SYP',
    paid: false,
    paymentMethod: 'TRANSFER',
    title: 'حملة متجر رفيق',
    publicationTitle: 'احتياجات يومية للحيوانات',
    description: 'إعلان جاهز للنشر بعد تأكيد الدفع.',
    creative: {
      type: 'IMAGE',
      imageUrl: image('1517849845537-4d257902454a'),
      altText: 'إعلان متجر رفيق',
    },
    placement: 'ADOPTION',
    publicationPhone: '0944 555 221',
    publicationEmail: 'contact@rafeeq.example',
    startAt: days(3),
    endAt: days(17),
    status: 'DRAFT',
    createdAt: days(-1),
    updatedAt: hours(-5),
    performance: {
      mockData: true,
    },
  },
  {
    id: 'ADVT-2026-0028',
    advertiser: {
      type: 'CLIENT',
      name: 'مركز أليف',
    },
    ownerName: 'مركز أليف',
    ownerPhone: '0933 771 004',
    agreedAmountMinor: 2_750_000 * 100,
    currency: 'SYP',
    paid: true,
    paymentMethod: 'CASH',
    title: 'تعريف بخدمات مركز أليف',
    publicationTitle: 'رعاية يومية للحيوانات المنزلية',
    description: 'إعلان تعريفي.',
    creative: {
      type: 'BANNER',
      imageUrl: image('1558788353-f76d92427f16'),
      altText: 'إعلان مركز أليف',
    },
    placement: 'SEARCH',
    publicationPhone: '0933 771 004',
    publicationEmail: 'hello@aleef.example',
    startAt: days(-10),
    endAt: days(5),
    status: 'PAUSED',
    createdAt: days(-15),
    updatedAt: hours(-20),
    activatedAt: days(-10),
    pausedAt: hours(-20),
    pauseReason: 'طلب صاحب الإعلان إيقافه مؤقتًا.',
    performance: {
      impressions: 9200,
      clicks: 311,
      clickThroughRate: 3.4,
      mockData: true,
    },
  },
];

const timelines = new Map<string, AdvertisementTimelineEvent[]>();

// Build the initial timeline from the current mock advertisement state.
for (const ad of rows) {
  const events: AdvertisementTimelineEvent[] = [
    {
      id: `${ad.id}-created`,
      title: 'تمت إضافة الإعلان من لوحة الإدارة',
      timestamp: ad.createdAt,
      tone: 'info',
    },
  ];

  if (ad.activatedAt) {
    events.unshift({
      id: `${ad.id}-active`,
      title: 'تم نشر الإعلان في التطبيق',
      timestamp: ad.activatedAt,
      tone: 'success',
    });
  }

  if (ad.pausedAt) {
    events.unshift({
      id: `${ad.id}-paused`,
      title: 'تم إيقاف الإعلان مؤقتًا',
      timestamp: ad.pausedAt,
      details: ad.pauseReason,
      tone: 'pending',
    });
  }

  timelines.set(ad.id, events);
}

function find(id: string) {
  const advertisement = rows.find((item) => item.id === id);

  if (!advertisement) {
    throw new Error('ADVERTISEMENT_NOT_FOUND');
  }

  return advertisement;
}

function filtered(filters: AdvertisementFilters) {
  const needle = filters.search.trim().toLocaleLowerCase('ar');

  return rows.filter((ad) => {
    if (ad.status === 'DELETED') {
      return false;
    }

    if (
      needle &&
      !`${ad.id} ${ad.publicationTitle} ${ad.ownerName} ${ad.transferReference ?? ''}`
        .toLocaleLowerCase('ar')
        .includes(needle)
    ) {
      return false;
    }

    if (filters.status && ad.status !== filters.status) {
      return false;
    }

    if (filters.placement && ad.placement !== filters.placement) {
      return false;
    }

    if (
      filters.dateFrom &&
      new Date(ad.createdAt) < new Date(`${filters.dateFrom}T00:00:00`)
    ) {
      return false;
    }

    if (
      filters.dateTo &&
      new Date(ad.createdAt) > new Date(`${filters.dateTo}T23:59:59`)
    ) {
      return false;
    }

    return true;
  });
}

export async function getAdvertisements(filters: AdvertisementFilters): Promise<AdvertisementListResult> {
  await mockDelay(80);

  const items = filtered(filters).sort(
    (a, b) =>
      (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) *
      (filters.sortDirection === 'asc' ? -1 : 1),
  );

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * filters.pageSize;

  return {
    items: clone(items.slice(start, start + filters.pageSize)),
    total,
    page,
    pageSize: filters.pageSize,
    pageCount,
  };
}

export async function getAdvertisementSummary(): Promise<AdvertisementSummary> {
  await mockDelay(45);

  return {
    draft: rows.filter((item) => item.status === 'DRAFT').length,
    pendingReview: rows.filter((item) => item.status === 'PENDING_REVIEW').length,
    scheduled: rows.filter((item) => item.status === 'SCHEDULED').length,
    active: rows.filter((item) => item.status === 'ACTIVE').length,
    paused: rows.filter((item) => item.status === 'PAUSED').length,
    expired: rows.filter((item) => item.status === 'EXPIRED').length,
    rejected: rows.filter((item) => item.status === 'REJECTED').length,
    unpaid: rows.filter((item) => !item.paid && item.status !== 'DELETED').length,
  };
}

export async function getAdvertisementById(id: string): Promise<AdvertisementDetails | undefined> {
  await mockDelay(60);

  const advertisement = rows.find(
    (item) => item.id === id && item.status !== 'DELETED',
  );

  if (!advertisement) {
    return undefined;
  }

  return {
    advertisement: clone(advertisement),
    timeline: clone(timelines.get(id) ?? []),
  };
}

export async function createAdvertisement(input: CreateAdvertisementInput, actor: AdminSession): Promise<Advertisement> {
  await mockDelay(90);

  const timestamp = new Date().toISOString();
  const id = `ADVT-2026-${String(30 + rows.length + 1).padStart(4, '0')}`;

  const advertisement: Advertisement = {
    id,
    advertiser: {
      type: 'CLIENT',
      name: input.ownerName,
    },
    ownerName: input.ownerName,
    ownerPhone: input.ownerPhone,
    agreedAmountMinor: input.agreedAmountMinor,
    currency: 'SYP',
    paid: input.paid,
    paymentMethod: input.paymentMethod,
    transferReference:
      input.paymentMethod === 'TRANSFER'
        ? input.transferReference
        : undefined,
    title: input.publicationTitle,
    publicationTitle: input.publicationTitle,
    description: input.description,
    creative: {
      type: 'BANNER',
      imageUrl: input.imageUrls[0]!,
      galleryUrls: input.imageUrls.slice(1),
      altText: input.publicationTitle,
    },
    placement: input.placement,
    publicationPhone: input.publicationPhone,
    publicationEmail: input.publicationEmail,
    websiteUrl: input.websiteUrl,
    startAt: input.startAt,
    endAt: input.endAt,
    status: 'DRAFT',
    createdAt: timestamp,
    updatedAt: timestamp,
    performance: {
      mockData: true,
    },
  };

  rows.unshift(advertisement);

  timelines.set(id, [
    {
      id: `${id}-created`,
      title: 'تمت إضافة الإعلان من لوحة الإدارة',
      actor: actor.name,
      timestamp,
      tone: 'info',
    },
  ]);

  return clone(advertisement);
}

export async function activateAdvertisement(id: string, actor: AdminSession): Promise<Advertisement> {
  await mockDelay(70);

  const ad = find(id);

  // An advertisement cannot go live before payment is confirmed.
  if (!ad.paid) {
    throw new Error('PAYMENT_NOT_CONFIRMED');
  }

  const timestamp = new Date().toISOString();

  ad.status = 'ACTIVE';
  ad.activatedAt = timestamp;
  ad.pausedAt = undefined;
  ad.pauseReason = undefined;
  ad.updatedAt = timestamp;

  timelines.set(id, [
    {
      id: `${id}-active-${Date.now()}`,
      title: 'تم نشر الإعلان في التطبيق',
      actor: actor.name,
      timestamp,
      tone: 'success',
    },
    ...(timelines.get(id) ?? []),
  ]);

  recordAdminAuditEvent(actor, {
    action: 'ADVERTISEMENT_APPROVED',
    resource: {
      type: 'ADVERTISEMENT',
      id,
      label: ad.publicationTitle,
    },
    newValue: {
      status: 'ACTIVE',
    },
    metadata: {
      source: 'إدارة الإعلانات',
    },
  });

  return clone(ad);
}

export async function pauseAdvertisement(id: string, reason: string, actor: AdminSession): Promise<Advertisement> {
  await mockDelay(70);

  const ad = find(id);

  if (ad.status !== 'ACTIVE') {
    throw new Error('INVALID_STATUS');
  }

  const timestamp = new Date().toISOString();

  ad.status = 'PAUSED';
  ad.pausedAt = timestamp;
  ad.pauseReason = reason;
  ad.updatedAt = timestamp;

  timelines.set(id, [
    {
      id: `${id}-paused-${Date.now()}`,
      title: 'تم إيقاف الإعلان مؤقتًا',
      actor: actor.name,
      timestamp,
      details: reason,
      tone: 'pending',
    },
    ...(timelines.get(id) ?? []),
  ]);

  recordAdminAuditEvent(actor, {
    action: 'ADVERTISEMENT_PAUSED',
    resource: {
      type: 'ADVERTISEMENT',
      id,
      label: ad.publicationTitle,
    },
    reason,
    newValue: {
      status: 'PAUSED',
    },
    metadata: {
      source: 'إدارة الإعلانات',
    },
  });

  return clone(ad);
}

export async function deleteAdvertisement(id: string, reason: string, actor: AdminSession): Promise<void> {
  await mockDelay(65);

  const ad = find(id);

  // Use a soft delete so the record still exists in mock history.
  ad.status = 'DELETED';
  ad.updatedAt = new Date().toISOString();

  recordAdminAuditEvent(actor, {
    action: 'ADVERTISEMENT_EXPIRED',
    resource: {
      type: 'ADVERTISEMENT',
      id,
      label: ad.publicationTitle,
    },
    reason,
    newValue: {
      status: 'DELETED',
    },
    metadata: {
      source: 'إدارة الإعلانات',
    },
  });
}

export async function getAdvertiserAdvertisementSummary(_advertiserType: string, advertiserId?: string): Promise<AdvertisementAdvertiserSummary> {
  await mockDelay(35);

  const scope = advertiserId
    ? rows.filter(
        (item) =>
          item.advertiser.id === advertiserId &&
          item.status !== 'DELETED',
      )
    : [];

  return {
    active: scope.filter((item) => item.status === 'ACTIVE').length,
    pending: scope.filter((item) =>
      ['DRAFT', 'PENDING_REVIEW', 'SCHEDULED'].includes(item.status),
    ).length,
    paused: scope.filter((item) => item.status === 'PAUSED').length,
    recent: clone(scope.slice(0, 3)),
  };
}