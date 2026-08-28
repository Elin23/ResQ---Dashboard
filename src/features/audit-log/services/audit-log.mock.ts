import { mockDelay } from '@/services/mock/delay';

import { auditActionLabels, auditResourceLabels, sensitiveAuditActions } from '../constants';
import type { AuditAction, AuditEvent, AuditFilters, AuditListResult, AuditResourceType, AuditSummary, AuditValue, RecordAuditInput } from '../types';

const clone = <T>(value: T): T => structuredClone(value);

type AdminLike = {
  id: string;
  name: string;
  roleLabel: string;
};

const events: AuditEvent[] = [
  {
    id: 'AUD-2026-08921',
    actor: { type: 'ADMIN', id: 'ADM-001', name: 'أحمد الخطيب', role: 'مدير العمليات' },
    action: 'REPORT_SEVERITY_CHANGED',
    resource: { type: 'REPORT', id: 'RQ-2026-00481', label: 'كلب مصاب بحادث سير' },
    timestamp: '2026-08-15T14:32:18+03:00',
    reason: 'تدهور الحالة حسب الصور المحدثة',
    previousValue: { severity: 'HIGH' },
    newValue: { severity: 'CRITICAL' },
    metadata: { field: 'severity', source: 'لوحة إدارة البلاغات' },
    requestContext: {
      ipAddress: '192.0.2.44',
      userAgent: 'ResQ Admin Web',
      correlationId: 'corr-rpt-89421',
    },
  },
  {
    id: 'AUD-2026-08922',
    actor: { type: 'ADMIN', id: 'ADM-002', name: 'رنا محمد', role: 'مراجع الجمعيات' },
    action: 'ORGANIZATION_APPROVED',
    resource: { type: 'ORGANIZATION', id: 'ORG-001', label: 'جمعية الرحمة للحيوان' },
    timestamp: '2026-08-15T13:10:05+03:00',
    previousValue: { status: 'PENDING_VERIFICATION', verificationStatus: 'IN_REVIEW' },
    newValue: { status: 'ACTIVE', verificationStatus: 'VERIFIED' },
    metadata: { source: 'ملف الجمعية' },
    requestContext: { correlationId: 'corr-org-89422' },
  },
  {
    id: 'AUD-2026-08923',
    actor: { type: 'SYSTEM', name: 'النظام' },
    action: 'ADVERTISEMENT_EXPIRED',
    resource: { type: 'ADVERTISEMENT', id: 'ADVT-2026-0022', label: 'فحص مجاني للحيوانات المنقذة' },
    timestamp: '2026-08-15T12:00:00+03:00',
    previousValue: { status: 'ACTIVE' },
    newValue: { status: 'EXPIRED' },
    metadata: { source: 'مجدول الحملات', note: 'انتهت فترة الحملة تلقائيًا' },
    requestContext: { correlationId: 'job-ads-expiry-20260815' },
  },
  {
    id: 'AUD-2026-08924',
    actor: { type: 'ADMIN', id: 'ADM-001', name: 'أحمد الخطيب', role: 'مدير العمليات' },
    action: 'REPORT_ASSIGNED',
    resource: { type: 'REPORT', id: 'RQ-2026-00486', label: 'حالة إنقاذ عاجلة' },
    timestamp: '2026-08-15T11:42:31+03:00',
    previousValue: { organization: 'غير مسند' },
    newValue: { organization: 'فريق أمان للإنقاذ' },
    metadata: { source: 'تشغيل البلاغات', relatedResourceIds: ['ORG-003', 'MS-2026-00172'] },
  },
  {
    id: 'AUD-2026-08925',
    actor: { type: 'ADMIN', id: 'ADM-005', name: 'نور المصري', role: 'مدير المالية' },
    action: 'DONATION_REFUND_RECORDED',
    resource: { type: 'DONATION', id: 'DN-2026-00821', label: 'تبرع لجمعية الرحمة للحيوان' },
    timestamp: '2026-08-15T10:25:46+03:00',
    reason: 'طلب المتبرع استرداد العملية المكررة',
    previousValue: { status: 'COMPLETED' },
    newValue: { status: 'REFUNDED' },
    metadata: { source: 'عمليات التبرعات' },
    requestContext: { correlationId: 'corr-fin-89425' },
  },
  {
    id: 'AUD-2026-08926',
    actor: { type: 'ADMIN', id: 'ADM-003', name: 'ليان يوسف', role: 'مدير المحتوى' },
    action: 'CONTENT_PUBLISHED',
    resource: { type: 'CONTENT', id: 'ART-2026-0041', label: 'كيف تعتني بحيوان مصاب حتى وصول المساعدة؟' },
    timestamp: '2026-08-15T09:18:12+03:00',
    previousValue: { status: 'IN_REVIEW' },
    newValue: { status: 'PUBLISHED' },
    metadata: { source: 'نظام إدارة المحتوى' },
  },
  {
    id: 'AUD-2026-08927',
    actor: { type: 'ADMIN', id: 'ADM-003', name: 'ليان يوسف', role: 'مدير المحتوى' },
    action: 'NOTIFICATION_SENT',
    resource: { type: 'NOTIFICATION', id: 'NTF-2026-0041', label: 'تنبيه بخصوص ارتفاع درجات الحرارة' },
    timestamp: '2026-08-15T08:45:00+03:00',
    previousValue: { status: 'DRAFT' },
    newValue: { status: 'SENT' },
    metadata: { source: 'إدارة الإشعارات' },
  },
  {
    id: 'AUD-2026-08928',
    actor: { type: 'ADMIN', id: 'ADM-004', name: 'سامر حسن', role: 'وكيل الدعم' },
    action: 'SUPPORT_TICKET_ASSIGNED',
    resource: { type: 'SUPPORT_TICKET', id: 'SUP-2026-0143', label: 'بلاغ إنقاذ لم يتم تحديثه منذ ساعات' },
    timestamp: '2026-08-15T08:22:11+03:00',
    newValue: { assignee: 'رنا يوسف', status: 'OPEN' },
    metadata: { source: 'مركز الدعم', relatedResourceIds: ['RQ-2026-00481'] },
  },
  {
    id: 'AUD-2026-08929',
    actor: { type: 'ADMIN', id: 'ADM-001', name: 'أحمد الخطيب', role: 'مدير العمليات' },
    action: 'REPORT_ORGANIZATION_CHANGED',
    resource: { type: 'REPORT', id: 'RQ-2026-00493', label: 'بلاغ ريف دمشق' },
    timestamp: '2026-08-14T18:14:50+03:00',
    reason: 'عدم توفر الفريق الأول',
    previousValue: { organization: 'جمعية الرحمة للحيوان' },
    newValue: { organization: 'جمعية رفق دمشق' },
    metadata: { source: 'تشغيل البلاغات', relatedResourceIds: ['RQ-2026-00493'] },
  },
  {
    id: 'AUD-2026-08931',
    actor: { type: 'ADMIN', id: 'ADM-002', name: 'رنا محمد', role: 'مراجع الجمعيات' },
    action: 'ADOPTION_APPROVED',
    resource: { type: 'ADOPTION_REQUEST', id: 'AD-2026-0106', label: 'طلب تبني للحيوان AN-2026-0050' },
    timestamp: '2026-08-14T15:11:09+03:00',
    previousValue: { status: 'UNDER_REVIEW' },
    newValue: { status: 'APPROVED' },
    metadata: { source: 'طلبات التبني' },
  },
  {
    id: 'AUD-2026-08933',
    actor: { type: 'ADMIN', id: 'ADM-006', name: 'ميساء الدروبي', role: 'مدير النظام' },
    action: 'USER_BLOCKED',
    resource: { type: 'USER', id: 'USR-1004', label: 'كريم عبد الله' },
    timestamp: '2026-08-14T11:55:33+03:00',
    reason: 'نشاط مريب متكرر',
    previousValue: { status: 'ACTIVE', email: 'kareem@example.test' },
    newValue: { status: 'BLOCKED', email: 'kareem@example.test' },
    metadata: { source: 'إدارة المستخدمين' },
  },
  {
    id: 'AUD-2026-08934',
    actor: { type: 'ADMIN', id: 'ADM-001', name: 'أحمد الخطيب', role: 'مدير العمليات' },
    action: 'FEEDING_POINT_APPROVED',
    resource: { type: 'FEEDING_POINT', id: 'FP-0043', label: 'نقطة الفرقان' },
    timestamp: '2026-08-14T10:20:15+03:00',
    previousValue: { status: 'PENDING' },
    newValue: { status: 'ACTIVE' },
    metadata: { source: 'نقاط الإطعام' },
  },
  {
    id: 'AUD-2026-08935',
    actor: { type: 'ADMIN', id: 'ADM-003', name: 'ليان يوسف', role: 'مدير المحتوى' },
    action: 'ADVERTISEMENT_PAUSED',
    resource: { type: 'ADVERTISEMENT', id: 'ADVT-2026-0025', label: 'حملة توعية بالتعقيم' },
    timestamp: '2026-08-13T17:41:08+03:00',
    reason: 'مراجعة المحتوى بعد ملاحظة من الجهة',
    previousValue: { status: 'ACTIVE' },
    newValue: { status: 'PAUSED' },
    metadata: { source: 'إدارة الإعلانات' },
  },
  {
    id: 'AUD-2026-08936',
    actor: { type: 'ADMIN', id: 'ADM-006', name: 'ميساء الدروبي', role: 'مدير النظام' },
    action: 'ROLE_UPDATED',
    resource: { type: 'ROLE', id: 'SUPPORT_AGENT', label: 'وكيل الدعم' },
    timestamp: '2026-08-13T15:00:00+03:00',
    reason: 'فصل صلاحية إغلاق التذاكر عن صلاحية الحل',
    previousValue: { permissions: 'support.resolve, support.close' },
    newValue: { permissions: 'support.resolve' },
    metadata: { source: 'إدارة الصلاحيات' },
    requestContext: {
      ipAddress: '198.51.100.17',
      correlationId: 'corr-rbac-89436',
    },
  },
  {
    id: 'AUD-2026-08937',
    actor: { type: 'ADMIN', id: 'ADM-006', name: 'ميساء الدروبي', role: 'مدير النظام' },
    action: 'SYSTEM_SETTING_CHANGED',
    resource: { type: 'SYSTEM_SETTING', id: 'support-targets', label: 'أهداف زمن الاستجابة' },
    timestamp: '2026-08-13T14:20:00+03:00',
    reason: 'تحديث الهدف التشغيلي الداخلي',
    previousValue: { supportFirstResponseMinutes: 45 },
    newValue: { supportFirstResponseMinutes: 30 },
    metadata: { source: 'إعدادات النظام' },
    requestContext: {
      ipAddress: '198.51.100.17',
      correlationId: 'corr-setting-89437',
    },
  },
  {
    id: 'AUD-2026-08938',
    actor: { type: 'ADMIN', id: 'ADM-002', name: 'رنا محمد', role: 'مراجع الجمعيات' },
    action: 'ORGANIZATION_REJECTED',
    resource: { type: 'ORGANIZATION', id: 'ORG-008', label: 'مبادرة حماية الحيوان - حماة' },
    timestamp: '2026-08-12T12:10:00+03:00',
    reason: 'عدم اكتمال متطلبات التسجيل',
    previousValue: { verificationStatus: 'IN_REVIEW' },
    newValue: { status: 'REJECTED', verificationStatus: 'REJECTED' },
    metadata: { source: 'ملف الجمعية' },
  },
  {
    id: 'AUD-2026-08939',
    actor: { type: 'ADMIN', id: 'ADM-004', name: 'سامر حسن', role: 'وكيل الدعم' },
    action: 'SUPPORT_TICKET_RESOLVED',
    resource: { type: 'SUPPORT_TICKET', id: 'SUP-2026-0142', label: 'لم أستطع تعديل رقم الهاتف' },
    timestamp: '2026-08-12T10:44:00+03:00',
    reason: 'تم تحديث رقم الهاتف والتحقق من وصول رمز التوثيق',
    previousValue: { status: 'OPEN' },
    newValue: { status: 'RESOLVED' },
    metadata: { source: 'مركز الدعم' },
  },
  {
    id: 'AUD-2026-08940',
    actor: { type: 'ADMIN', id: 'ADM-003', name: 'ليان يوسف', role: 'مدير المحتوى' },
    action: 'NOTIFICATION_SCHEDULED',
    resource: { type: 'NOTIFICATION', id: 'NTF-2026-0042', label: 'حملة تطعيم مجانية للحيوانات المنقذة' },
    timestamp: '2026-08-11T18:00:00+03:00',
    previousValue: { status: 'DRAFT' },
    newValue: { status: 'SCHEDULED' },
    metadata: { source: 'إدارة الإشعارات' },
  },
];

let sequence = 9000;

export function recordMockAuditEvent(input: RecordAuditInput): AuditEvent {
  const event: AuditEvent = {
    id: `AUD-2026-${sequence++}`,
    actor: clone(input.actor),
    action: input.action,
    resource: clone(input.resource),
    timestamp: input.timestamp ?? new Date().toISOString(),
    reason: input.reason,
    previousValue: clone(input.previousValue),
    newValue: clone(input.newValue),
    metadata: clone(input.metadata),
    requestContext: clone(input.requestContext),
  };

  // New audit events appear first in the activity log.
  events.unshift(event);

  return clone(event);
}

export function recordAdminAuditEvent(actor: AdminLike, input: Omit<RecordAuditInput, 'actor'>) {
  return recordMockAuditEvent({
    ...input,
    actor: {
      type: 'ADMIN',
      id: actor.id,
      name: actor.name,
      role: actor.roleLabel,
    },
  });
}

export function recordSystemAuditEvent(input: Omit<RecordAuditInput, 'actor'>) {
  return recordMockAuditEvent({
    ...input,
    actor: {
      type: 'SYSTEM',
      name: 'النظام',
    },
  });
}

export async function getAuditEvents(filters: AuditFilters): Promise<AuditListResult> {
  await mockDelay(60);

  const needle = filters.search.trim().toLocaleLowerCase('ar');

  let rows = events.filter((event) => {
    const haystack =
      `${event.id} ${event.actor.name} ${event.resource.id} ${event.resource.label ?? ''} ${auditActionLabels[event.action]} ${event.reason ?? ''}`
        .toLocaleLowerCase('ar');

    if (needle && !haystack.includes(needle)) {
      return false;
    }

    if (filters.actorId && event.actor.id !== filters.actorId) {
      return false;
    }

    if (filters.actorRole && event.actor.role !== filters.actorRole) {
      return false;
    }

    if (filters.actorType && event.actor.type !== filters.actorType) {
      return false;
    }

    if (filters.action && event.action !== filters.action) {
      return false;
    }

    if (filters.resourceType && event.resource.type !== filters.resourceType) {
      return false;
    }

    if (filters.resourceId && event.resource.id !== filters.resourceId) {
      return false;
    }

    if (filters.sensitive && !sensitiveAuditActions.has(event.action)) {
      return false;
    }

    if (
      filters.from &&
      new Date(event.timestamp) < new Date(`${filters.from}T00:00:00`)
    ) {
      return false;
    }

    if (
      filters.to &&
      new Date(event.timestamp) > new Date(`${filters.to}T23:59:59`)
    ) {
      return false;
    }

    return true;
  });

  // Sort after filtering so pagination always uses the requested order.
  rows = [...rows].sort(
    (a, b) =>
      (filters.sortDirection === 'asc' ? 1 : -1) *
      (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
  );

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pageCount);

  return {
    items: clone(
      rows.slice(
        (page - 1) * filters.pageSize,
        page * filters.pageSize,
      ),
    ),
    total,
    page,
    pageSize: filters.pageSize,
    pageCount,
  };
}

export async function getAuditEvent(id: string) {
  await mockDelay(25);

  return clone(
    events.find((event) => event.id === id) ?? null,
  );
}

export async function getAuditSummary(filters: Pick<AuditFilters, 'from' | 'to'>): Promise<AuditSummary> {
  await mockDelay(25);

  const rows = events.filter(
    (event) =>
      (!filters.from ||
        new Date(event.timestamp) >=
          new Date(`${filters.from}T00:00:00`)) &&
      (!filters.to ||
        new Date(event.timestamp) <=
          new Date(`${filters.to}T23:59:59`)),
  );

  const today = new Date().toDateString();

  return {
    total: rows.length,
    today: rows.filter(
      (event) => new Date(event.timestamp).toDateString() === today,
    ).length,
    sensitive: rows.filter((event) =>
      sensitiveAuditActions.has(event.action),
    ).length,
    roleChanges: rows.filter((event) =>
      ['ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'ADMIN_ROLES_UPDATED'].includes(event.action),
    ).length,
    settingsChanges: rows.filter((event) =>
      ['SYSTEM_SETTING_CHANGED', 'LOOKUP_VALUE_CREATED', 'LOOKUP_VALUE_UPDATED'].includes(event.action),
    ).length,
  };
}

export async function getAuditFilterOptions() {
  await mockDelay(15);

  return {
    // Map by ID first to avoid showing the same admin more than once.
    actors: Array.from(
      new Map(
        events
          .filter((event) => event.actor.id)
          .map((event) => [
            event.actor.id!,
            {
              id: event.actor.id!,
              name: event.actor.name,
            },
          ]),
      ).values(),
    ),
    roles: [
      ...new Set(
        events
          .map((event) => event.actor.role)
          .filter((value): value is string => Boolean(value)),
      ),
    ],
    actions: [
      ...new Set(events.map((event) => event.action)),
    ] as AuditAction[],
    resourceTypes: [
      ...new Set(events.map((event) => event.resource.type)),
    ] as AuditResourceType[],
  };
}

export async function getAuditExportEvents(filters: AuditFilters) {
  // Export all matching rows instead of only the current table page.
  const result = await getAuditEvents({
    ...filters,
    page: 1,
    pageSize: 1000,
  });

  return result.items;
}

export function describeAuditValue(value: AuditValue | undefined) {
  if (value === undefined) {
    return '—';
  }

  if (value === null || typeof value !== 'object') {
    return String(value);
  }

  return Object.entries(value)
    .map(([key, item]) => `${key}: ${String(item ?? '—')}`)
    .join('، ');
}

export function auditResourceName(type: AuditResourceType) {
  return auditResourceLabels[type];
}