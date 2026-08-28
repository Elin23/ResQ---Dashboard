import { safeFormatDate } from '@/lib/runtime-safety';

import { deepLinkPatterns, notificationAudienceTypeLabels } from '../constants';
import type { NotificationAudience, NotificationChannel } from '../types';

// Only allow supported internal application routes.
export function isValidNotificationDeepLink(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  if (
    value.startsWith('javascript:') ||
    value.startsWith('data:') ||
    value.startsWith('http:') ||
    value.startsWith('https:')
  ) {
    return false;
  }

  return deepLinkPatterns.some((item) => item.pattern.test(value));
}

export function summarizeAudience(audience: NotificationAudience): string {
  if (!audience) {
    return 'جمهور مخصص';
  }

  if (audience.everyone) {
    return 'جميع مستخدمي ResQ';
  }

  const parts: string[] = [];

  if (audience.userTypes?.length) {
    parts.push(
      audience.userTypes
        .map((type) => notificationAudienceTypeLabels[type] ?? 'نوع مستخدم')
        .join('، '),
    );
  }

  if (audience.governorates?.length) {
    parts.push(`في ${audience.governorates.join('، ')}`);
  }

  if (audience.organizationIds?.length) {
    parts.push(`${audience.organizationIds.length} جمعيات محددة`);
  }

  if (audience.userIds?.length) {
    parts.push(`${audience.userIds.length} مستخدمين محددين`);
  }

  return parts.join(' · ') || 'جمهور مخصص';
}

export function formatChannels(channels: NotificationChannel[]): string {
  return (Array.isArray(channels) ? channels : [])
    .map((channel) => (channel === 'IN_APP' ? 'داخل التطبيق' : 'Push'))
    .join(' + ') || '—';
}

// Display notification timestamps using the operational Damascus timezone.
export function formatDateTime(value?: string): string {
  return safeFormatDate(value, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Damascus',
  });
}