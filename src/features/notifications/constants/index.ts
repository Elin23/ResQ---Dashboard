import type { NotificationAudienceUserType, NotificationChannel, NotificationDeliveryStatus } from '../types';

export const notificationStatusLabels: Record<NotificationDeliveryStatus, string> = {
  DRAFT: 'مسودة',
  SCHEDULED: 'مجدول',
  SENDING: 'قيد الإرسال',
  SENT: 'تم الإرسال',
  PARTIALLY_SENT: 'إرسال جزئي',
  FAILED: 'فشل',
  CANCELLED: 'ملغي',
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  IN_APP: 'داخل التطبيق',
  PUSH: 'Push',
};

export const notificationAudienceTypeLabels: Record<NotificationAudienceUserType, string> = {
  USER: 'المستخدمون',
  ORGANIZATION: 'الجمعيات',
};

export const governorates = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'درعا',
] as const;

// Only allow deep links that match known application routes.
export const deepLinkPatterns = [
  {
    label: 'بلاغ',
    pattern: /^\/reports\/[A-Za-z0-9-]+$/,
  },
  {
    label: 'طلب تبني',
    pattern: /^\/adoption-requests\/[A-Za-z0-9-]+$/,
  },
  {
    label: 'جمعية',
    pattern: /^\/organizations\/[A-Za-z0-9-]+$/,
  },
  {
    label: 'مقال منشور',
    pattern: /^\/content\/articles\/[A-Za-z0-9-]+$/,
  },
] as const;

export const notificationTimezone = 'Asia/Damascus';

export const titleMaxLength = 90;

export const bodyMaxLength = 420;