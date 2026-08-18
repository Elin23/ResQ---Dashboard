import type { AdoptionApplicationStatus, AdoptionPublisherType, AdoptionRequestStatus } from '../types';

export const adoptionStatusLabels: Record<AdoptionRequestStatus, string> = {
  PENDING_REVIEW: 'بانتظار مراجعة النشر',
  PUBLISHED: 'منشور',
  REJECTED: 'مرفوض النشر',
  ADOPTED: 'تم التبني',
};

export const adoptionApplicationStatusLabels: Record<AdoptionApplicationStatus, string> = {
  PENDING: 'بانتظار رد صاحب الحيوان',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
  WITHDRAWN: 'مسحوب',
};

export const adoptionPublisherTypeLabels: Record<AdoptionPublisherType, string> = {
  USER: 'مستخدم',
  ORGANIZATION: 'جمعية',
};

export const rejectionReasons = [
  'معلومات غير صحيحة أو مضللة',
  'صور غير لائقة أو غير مناسبة للنشر',
  'المحتوى لا يخص حيواناً معروضاً للتبني',
  'بيانات التواصل أو الوصف غير كافية',
  'محتوى مخالف لسياسة المنصة',
  'طلب مكرر',
  'سبب آخر',
] as const;

export const adoptionAnimalSpeciesLabels = {
  DOG: 'كلب',
  CAT: 'قطة',
  BIRD: 'طائر',
  OTHER: 'حيوان آخر',
} as const;
