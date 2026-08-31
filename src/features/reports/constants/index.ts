import type { AnimalType, ReportSeverity, ReportStatus } from '../types';

export const reportStatusLabels: Record<ReportStatus, string> = {
  EN_ROUTE: 'يتم التوجه لمكان البلاغ',
  RECEIVED: 'تم الاستلام',
  CLOSED: 'إغلاق الحالة',
};

export const reportSeverityLabels: Record<ReportSeverity, string> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'عالية',
  CRITICAL: 'حرجة',
};

export const animalTypeLabels: Record<AnimalType, string> = {
  DOG: 'كلب',
  CAT: 'قطة',
  BIRD: 'طائر',
  OTHER: 'حيوان آخر',
};
