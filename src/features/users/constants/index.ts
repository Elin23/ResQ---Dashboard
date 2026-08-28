import type { UserAccountStatus, UserModerationAction, UserVerificationStatus } from '../types';

export const accountStatusLabels: Record<UserAccountStatus, string> = {
  ACTIVE: 'نشط',
  SUSPENDED: 'معلق',
  BLOCKED: 'محظور',
  DEACTIVATED: 'معطل',
};

export const verificationLabels: Record<UserVerificationStatus, string> = {
  UNVERIFIED: 'غير موثق',
  PHONE_VERIFIED: 'رقم الهاتف موثق',
  VERIFIED: 'موثق',
};

export const moderationLabels: Record<UserModerationAction, string> = {
  WARNING: 'تحذير إداري',
  SUSPEND: 'تعليق الحساب',
  REACTIVATE: 'إعادة تفعيل',
  BLOCK: 'حظر الحساب',
  UNBLOCK: 'رفع الحظر',
};

// Keep moderation reasons centralized for consistent admin workflows.
export const suspensionReasons = [
  'إساءة استخدام المنصة',
  'إرسال بلاغات مضللة متكررة',
  'مخالفة شروط الاستخدام',
  'نشاط مريب',
  'طلب من المستخدم',
  'سبب آخر',
] as const;

export const blockReasons = [
  'إساءة استخدام خطرة أو متكررة',
  'محاولات احتيال أو انتحال',
  'تهديد سلامة المستخدمين أو الحيوانات',
  'نشاط آلي أو مريب مؤكد',
  'مخالفة جسيمة لشروط الاستخدام',
  'سبب آخر',
] as const;

export const userGovernorates = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'درعا',
] as const;