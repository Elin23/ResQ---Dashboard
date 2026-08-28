import type { ArticleCategory, ContentStatus } from '../types';

export const contentStatusLabels: Record<ContentStatus, string> = {
  DRAFT: 'مسودة',
  IN_REVIEW: 'قيد المراجعة',
  SCHEDULED: 'مجدول',
  PUBLISHED: 'منشور',
  ARCHIVED: 'مؤرشف',
};

export const articleCategoryLabels: Record<ArticleCategory, string> = {
  ANIMAL_CARE: 'العناية بالحيوانات',
  HEALTH: 'الصحة',
  NUTRITION: 'التغذية',
  BEHAVIOR: 'السلوك',
  SAFETY: 'السلامة',
  ADOPTION: 'التبني',
  OTHER: 'أخرى',
};

// Reuse the label maps directly when building select options.
export const contentStatusOptions = Object.entries(contentStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

export const articleCategoryOptions = Object.entries(articleCategoryLabels).map(([value, label]) => ({
  value,
  label,
}));

export const commonTags = [
  'إنقاذ',
  'رعاية',
  'صحة',
  'تغذية',
  'تعقيم',
  'تبني',
  'سلامة',
  'قطط',
  'كلاب',
];

export const faqCategories = [
  'الحساب',
  'البلاغات',
  'الإنقاذ',
  'التبني',
  'التبرعات',
  'عام',
];

export const awarenessAudienceLabels = {
  ALL: 'الجميع',
  USERS: 'المستخدمون',
  ORGANIZATIONS: 'الجمعيات',
} as const;