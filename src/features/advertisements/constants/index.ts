import type { AdvertisementPlacement, AdvertisementStatus } from '../types';

export const advertisementStatusLabels: Record<AdvertisementStatus, string> = {
  DRAFT: 'مسودة',
  PENDING_REVIEW: 'بانتظار المراجعة',
  SCHEDULED: 'مجدول',
  ACTIVE: 'منشور',
  PAUSED: 'متوقف',
  EXPIRED: 'منتهي',
  REJECTED: 'مرفوض',
  DELETED: 'محذوف',
};

export const advertisementPlacementConfig: Record<AdvertisementPlacement, { label: string }> = {
  HOME_BANNER: { label: 'الرئيسية' },
  ADOPTION: { label: 'التبني' },
  ORGANIZATIONS: { label: 'الجمعيات' },
  MAP: { label: 'الخريطة' },
  SEARCH: { label: 'البحث' },
};
