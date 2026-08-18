import type { FeedingPointCondition, FeedingPointCreatorType, FeedingPointFoodLevel, FeedingPointIssueType, FeedingPointStatus, RefillReviewStatus } from '../types';

export const feedingPointStatusLabels: Record<FeedingPointStatus, string> = {
  PENDING: 'بانتظار المراجعة',
  ACTIVE: 'نشطة',
  INACTIVE: 'معطلة',
  REJECTED: 'مرفوضة',
};

export const refillReviewStatusLabels: Record<RefillReviewStatus, string> = {
  PENDING: 'بانتظار التحقق',
  VERIFIED: 'تم التحقق',
  REJECTED: 'مرفوضة',
};

export const foodLevelLabels: Record<FeedingPointFoodLevel, string> = {
  FULL: 'ممتلئة',
  MEDIUM: 'متوسطة',
  LOW: 'منخفضة',
  EMPTY: 'فارغة',
  UNKNOWN: 'غير معروف',
};

export const conditionLabels: Record<FeedingPointCondition, string> = {
  GOOD: 'جيدة',
  NEEDS_CLEANING: 'تحتاج تنظيف',
  DAMAGED: 'متضررة',
  MISSING: 'مفقودة',
  UNKNOWN: 'غير معروف',
};

export const creatorTypeLabels: Record<FeedingPointCreatorType, string> = {
  USER: 'مستخدم',
  ORGANIZATION: 'جمعية',
};

export const issueTypeLabels: Record<FeedingPointIssueType, string> = {
  EMPTY: 'نفاد الطعام',
  NO_WATER: 'لا توجد مياه',
  DAMAGED: 'ضرر في النقطة',
  DIRTY: 'تحتاج تنظيف',
  MISSING: 'النقطة مفقودة',
  UNSAFE_LOCATION: 'موقع غير آمن',
  OTHER: 'مشكلة أخرى',
};

export const issueStatusLabels = { OPEN: 'مفتوحة', UNDER_REVIEW: 'قيد المراجعة', RESOLVED: 'تم الحل', REJECTED: 'مرفوضة' } as const;
export const feedingPointRejectReasons = ['تعذر التحقق من وجود النقطة', 'الصور غير واضحة أو غير كافية', 'الموقع غير مناسب', 'النقطة مكررة', 'الموقع غير آمن', 'معلومات غير كافية', 'سبب آخر'] as const;
export const feedingPointInactiveReasons = ['النقطة لم تعد موجودة', 'الموقع أصبح غير آمن', 'تعذر الوصول إلى الموقع', 'طلب من صاحب الاقتراح', 'قرار إداري', 'سبب آخر'] as const;
export const refillRejectReasons = ['الصورة لا تثبت إعادة التعبئة', 'الصورة قديمة أو غير مرتبطة بالنقطة', 'المعلومات لا تطابق الموقع', 'بلاغ تعبئة مكرر', 'سبب آخر'] as const;
export const issueRejectReasons = ['المشكلة غير موجودة', 'بلاغ مكرر', 'الصورة أو المعلومات غير واضحة', 'تم حل المشكلة مسبقًا', 'سبب آخر'] as const;
