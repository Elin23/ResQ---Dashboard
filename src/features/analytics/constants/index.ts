import type { AnalyticsRangePreset } from '../types';
export { operationalTargets } from '@/features/settings/services/settings.mock';

export const analyticsRangeLabels = {
  today: 'اليوم',
  '7d': 'آخر 7 أيام',
  '30d': 'آخر 30 يومًا',
  month: 'هذا الشهر',
  '3m': 'آخر 3 أشهر',
  year: 'هذه السنة',
  custom: 'فترة مخصصة',
} as const;

export const analyticsRangeOptions: Array<{ value: AnalyticsRangePreset; label: string }> = [
  { value: 'today', label: analyticsRangeLabels.today },
  { value: '7d', label: analyticsRangeLabels['7d'] },
  { value: '30d', label: analyticsRangeLabels['30d'] },
  { value: 'month', label: analyticsRangeLabels.month },
  { value: '3m', label: analyticsRangeLabels['3m'] },
  { value: 'year', label: analyticsRangeLabels.year },
  { value: 'custom', label: analyticsRangeLabels.custom },
];

export const chartPalette = {
  primary: 'hsl(var(--color-primary))',
  success: 'hsl(var(--color-success))',
  pending: 'hsl(var(--color-pending))',
  critical: 'hsl(var(--color-critical))',
  info: 'hsl(var(--color-info))',
  neutral: 'hsl(var(--color-muted-foreground))',
} as const;

export const metricDefinitions = {
  reportCompletionRate: 'البلاغات بحالة تم الإنقاذ أو مغلق ÷ إجمالي البلاغات ضمن الفترة.',
  missionAcceptance: 'المدة بين إسناد المهمة وقبولها، للمهام التي تحتوي وقت قبول.',
  missionArrival: 'المدة بين إسناد المهمة والوصول للموقع، للمهام التي تحتوي وقت وصول.',
  rescueCompletionRate: 'المهام المكتملة ÷ (المهام المكتملة + الملغاة + النشطة) ضمن الفترة.',
  adoptionCompletionRate: 'طلبات التبني المكتملة ÷ جميع الطلبات المقدمة ضمن الفترة.',
  adoptionWaiting: 'المدة بين تقديم طلب التبني وإكماله للطلبات المكتملة.',
  activeUser: 'مستخدم حالته ACTIVE وكان آخر نشاط له خلال 30 يومًا من نهاية الفترة.',
} as const;
