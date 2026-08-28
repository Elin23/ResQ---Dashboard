import type { Permission } from '@/features/auth/permissions';
import { safeDate, safeFormatDate } from '@/lib/runtime-safety';

import { auditResourceLabels, sensitiveFields } from '../constants';
import type { AuditEvent, AuditResourceType, AuditValue } from '../types';

export function formatAuditTimestamp(value: string) {
  return safeFormatDate(value, {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone: 'Asia/Damascus',
  });
}

export function formatAuditRelative(value: string) {
  const date = safeDate(value);

  if (!date) {
    return '—';
  }

  const difference = Date.now() - date.getTime();
  const future = difference < 0;
  const minutes = Math.round(Math.abs(difference) / 60_000);

  if (minutes < 1) {
    return 'الآن';
  }

  if (minutes < 60) {
    return future ? `بعد ${minutes} دقيقة` : `منذ ${minutes} دقيقة`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return future ? `بعد ${hours} ساعة` : `منذ ${hours} ساعة`;
  }

  const days = Math.round(hours / 24);

  return future ? `بعد ${days} يوم` : `منذ ${days} يوم`;
}

export function resourcePath(type: AuditResourceType, id: string) {
  // Content routes depend on the content ID prefix.
  if (type === 'CONTENT') {
    const root = id.startsWith('ST-')
      ? '/content/success-stories'
      : id.startsWith('AWR-')
        ? '/content/awareness'
        : '/content/articles';

    return `${root}/${id}`;
  }

  if (type === 'SYSTEM_SETTING') {
    return '/settings';
  }

  const roots: Partial<Record<AuditResourceType, string>> = {
    REPORT: '/reports',
    ADOPTION_REQUEST: '/adoption-requests',
    ORGANIZATION: '/organizations',
    USER: '/users',
    FEEDING_POINT: '/feeding-points',
    DONATION: '/donations',
    ADVERTISEMENT: '/advertisements',
    NOTIFICATION: '/notifications',
    SUPPORT_TICKET: '/support',
    ADMIN: '/settings/admin-users',
    ROLE: '/settings/roles',
  };

  const root = roots[type];

  return root ? `${root}/${id}` : undefined;
}

export function resourcePermission(type: AuditResourceType): Permission | undefined {
  const permissions: Partial<Record<AuditResourceType, Permission>> = {
    REPORT: 'reports:view',
    ADOPTION_REQUEST: 'adoption:read',
    ORGANIZATION: 'organizations:read',
    USER: 'users:read',
    FEEDING_POINT: 'feeding_points.read',
    DONATION: 'donations.read',
    ADVERTISEMENT: 'advertisements.read',
    CONTENT: 'content.read',
    NOTIFICATION: 'notifications.read',
    SUPPORT_TICKET: 'support.read',
    ADMIN: 'admins.read',
    ROLE: 'roles.read',
    SYSTEM_SETTING: 'settings.read',
  };

  return permissions[type];
}

export function valueRows(value: AuditValue | undefined, canSensitive: boolean) {
  if (value === undefined) {
    return [];
  }

  if (value === null || typeof value !== 'object') {
    return [{ field: 'القيمة', value: String(value) }];
  }

  // Mask sensitive fields when the current admin cannot view them.
  return Object.entries(value).map(([field, item]) => ({
    field,
    value:
      !canSensitive && sensitiveFields.has(field)
        ? '••••••'
        : String(item ?? '—'),
  }));
}

export function auditCsv(events: AuditEvent[], includeTechnical: boolean) {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;

  const headers = [
    'eventId',
    'timestamp',
    'actor',
    'role',
    'action',
    'resourceType',
    'resourceId',
    'reason',
    'source',
    ...(includeTechnical ? ['correlationId'] : []),
  ];

  const lines = [headers.join(',')];

  for (const event of events) {
    lines.push(
      [
        event.id,
        event.timestamp,
        event.actor.name,
        event.actor.role ?? '',
        event.action,
        event.resource.type,
        event.resource.id,
        event.reason ?? '',
        event.metadata?.source ?? '',
        ...(includeTechnical
          ? [event.requestContext?.correlationId ?? '']
          : []),
      ]
        .map((value) => quote(value))
        .join(','),
    );
  }

  // BOM keeps Arabic text readable when the CSV is opened in Excel.
  return '\uFEFF' + lines.join('\n');
}

export function downloadTextFile(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = name;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function resourceLabel(type: AuditResourceType) {
  return auditResourceLabels[type];
}