export const roles = [
  'SUPER_ADMIN',
  'OPERATIONS_ADMIN',
  'ORGANIZATION_REVIEWER',
  'CONTENT_MANAGER',
  'SUPPORT_AGENT',
  'FINANCE_ADMIN',
] as const;

export type AdminRole = (typeof roles)[number];

export const permissions = [
  'dashboard:view',
  'reports:view',
  'reports:update',
  'reports:verify',
  'reports:assign',
  'reports:reject',
  'reports:close',
  'adoption:read',
  'adoption:review',
  'adoption:approve',
  'adoption:reject',
  'adoption:cancel',
  'adoption:complete',
  'adoption:delete',
  'adoption:notes:create',
  'map.read',
  'organizations:read',
  'organizations:review',
  'organizations:verify',
  'organizations:reject',
  'organizations:request_info',
  'organizations:suspend',
  'organizations:reactivate',
  'organizations.documents.review',
  'organizations.notes.create',
  'users:read',
  'users.sensitive.read',
  'users:suspend',
  'users:reactivate',
  'users:block',
  'users:unblock',
  'users.notes.create',
  'feeding_points.read',
  'feeding_points.review',
  'feeding_points.approve',
  'feeding_points.reject',
  'feeding_points.deactivate',
  'feeding_points.reactivate',
  'feeding_points.issues.read',
  'feeding_points.issues.review',
  'feeding_points.issues.resolve',
  'feeding_points.refill.review',
  'feeding_points.notes.create',
  'donations.read',
  'donations.review',
  'donations.approve',
  'donations.reject',
  'donations.delete',
  'donations.export',
  'advertisements.read',
  'advertisements.review',
  'advertisements.approve',
  'advertisements.reject',
  'advertisements.schedule',
  'advertisements.activate',
  'advertisements.pause',
  'advertisements.notes.create',
  'content.read',
  'content.create',
  'content.update',
  'content.review',
  'content.publish',
  'content.schedule',
  'content.archive',
  'faq.read',
  'faq.update',
  'notifications.read',
  'notifications.create',
  'notifications.send',
  'notifications.schedule',
  'notifications.cancel',
  'notifications.templates.read',
  'notifications.templates.update',
  'notifications.system_history.read',
  'support.read',
  'support.requester_sensitive.read',
  'support.assign',
  'support.reply',
  'support.notes.create',
  'support.priority.update',
  'support.status.update',
  'support.escalate',
  'support.resolve',
  'support.close',
  'support.canned_responses.read',
  'audit.read',
  'audit.export',
  'audit.technical.read',
  'admins.read',
  'admins.create',
  'admins.update',
  'admins.suspend',
  'admins.activate',
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  'settings.read',
  'settings.update',
] as const;

export type Permission = (typeof permissions)[number];

export type PermissionModule =
  | 'DASHBOARD'
  | 'REPORTS'
  | 'ADOPTION'
  | 'MAP'
  | 'ORGANIZATIONS'
  | 'USERS'
  | 'FEEDING_POINTS'
  | 'DONATIONS'
  | 'ADVERTISEMENTS'
  | 'CONTENT'
  | 'NOTIFICATIONS'
  | 'SUPPORT'
  | 'AUDIT'
  | 'ADMINISTRATION';

export interface PermissionDefinition {
  key: Permission;
  label: string;
  description: string;
  module: PermissionModule;
  sensitive?: boolean;
}

const moduleNames: Record<PermissionModule, string> = {
  DASHBOARD: 'الرئيسية',
  REPORTS: 'البلاغات',
  ADOPTION: 'التبني',
  MAP: 'الخريطة',
  ORGANIZATIONS: 'الجمعيات',
  USERS: 'المستخدمون',
  FEEDING_POINTS: 'نقاط الإطعام',
  DONATIONS: 'التبرعات',
  ADVERTISEMENTS: 'الإعلانات',
  CONTENT: 'المحتوى',
  NOTIFICATIONS: 'الإشعارات',
  SUPPORT: 'الدعم',
  AUDIT: 'سجل النشاط',
  ADMINISTRATION: 'إدارة النظام',
};

export const permissionModuleLabels = moduleNames;

const actionLabels: Record<string, string> = {
  view: 'عرض',
  read: 'عرض',
  update: 'تحديث',
  verify: 'تحقق',
  assign: 'إسناد',
  reject: 'رفض',
  close: 'إغلاق',
  reassign: 'إعادة إسناد',
  cancel: 'إلغاء',
  create: 'إنشاء',
  review: 'مراجعة',
  approve: 'اعتماد',
  complete: 'إكمال',
  suspend: 'تعليق',
  reactivate: 'إعادة تفعيل',
  block: 'حظر',
  unblock: 'رفع الحظر',
  deactivate: 'تعطيل',
  resolve: 'حل',
  refund: 'استرداد',
  export: 'تصدير',
  activate: 'تفعيل',
  pause: 'إيقاف مؤقت',
  publish: 'نشر',
  schedule: 'جدولة',
  archive: 'أرشفة',
  send: 'إرسال',
  reply: 'رد',
  escalate: 'تصعيد',
  delete: 'حذف',
  status: 'الحالة',
  health: 'الصحة',
  medical: 'السجل الطبي',
  notes: 'الملاحظات',
  sensitive: 'البيانات الحساسة',
  documents: 'المستندات',
  issues: 'المشكلات',
  templates: 'القوالب',
  technical: 'السياق التقني',
  priority: 'الأولوية',
  refill: 'إعادة التعبئة',
};

const moduleFor = (key: Permission): PermissionModule =>
  key.startsWith('reports')
    ? 'REPORTS'
    : key.startsWith('adoption')
      ? 'ADOPTION'
      : key.startsWith('organizations')
        ? 'ORGANIZATIONS'
        : key.startsWith('users')
          ? 'USERS'
          : key.startsWith('feeding_points')
            ? 'FEEDING_POINTS'
            : key.startsWith('donations')
              ? 'DONATIONS'
              : key.startsWith('advertisements')
                ? 'ADVERTISEMENTS'
                : key.startsWith('content') || key.startsWith('faq')
                  ? 'CONTENT'
                  : key.startsWith('notifications')
                    ? 'NOTIFICATIONS'
                    : key.startsWith('support')
                      ? 'SUPPORT'
                      : key.startsWith('audit')
                        ? 'AUDIT'
                        : key.startsWith('map')
                          ? 'MAP'
                          : key.startsWith('dashboard')
                            ? 'DASHBOARD'
                            : 'ADMINISTRATION';

// Build a readable Arabic label from the permission key when no custom label exists.
const friendly = (key: Permission) => {
  const parts = key.split(/[.:]/);
  const module = moduleNames[moduleFor(key)];
  const translated = parts
    .slice(1)
    .map((part) => actionLabels[part] ?? part.replaceAll('_', ' '))
    .join(' · ');

  return translated ? `${translated} — ${module}` : module;
};

const sensitiveKeys = new Set<Permission>([
  'users.sensitive.read',
  'audit.technical.read',
  'admins.suspend',
  'admins.activate',
  'roles.update',
  'roles.delete',
  'settings.update',
]);

const explicitLabels: Partial<Record<Permission, string>> = {
  'admins.read': 'عرض المستخدمين الإداريين',
  'admins.create': 'دعوة مسؤول جديد',
  'admins.update': 'تحديث حسابات المسؤولين',
  'admins.suspend': 'تعليق حساب مسؤول',
  'admins.activate': 'إعادة تفعيل مسؤول',
  'roles.read': 'عرض الأدوار والصلاحيات',
  'roles.create': 'إنشاء دور إداري',
  'roles.update': 'تعديل صلاحيات الأدوار',
  'roles.delete': 'حذف دور مخصص',
  'settings.read': 'عرض إعدادات النظام',
  'settings.update': 'تعديل إعدادات النظام',
  'users.sensitive.read': 'عرض البيانات الحساسة للمستخدمين',
  'audit.technical.read': 'عرض السياق التقني لسجل النشاط',
  'audit.export': 'تصدير سجل النشاط',
  'notifications.send': 'إرسال إشعار جماعي فورًا',
  'content.publish': 'نشر المحتوى',
  'reports:assign': 'إسناد البلاغات',
  'organizations:suspend': 'تعليق الجمعيات',
  'users:block': 'حظر المستخدمين',
};

export const permissionDefinitions: PermissionDefinition[] = permissions.map((key) => ({
  key,
  label: explicitLabels[key] ?? friendly(key),
  description: explicitLabels[key]
    ? `يسمح بـ ${explicitLabels[key]}.`
    : `صلاحية ${friendly(key)} ضمن وحدة ${moduleNames[moduleFor(key)]}.`,
  module: moduleFor(key),
  sensitive: sensitiveKeys.has(key),
}));

export const roleLabels: Record<AdminRole, string> = {
  SUPER_ADMIN: 'مدير النظام',
  OPERATIONS_ADMIN: 'مدير العمليات',
  ORGANIZATION_REVIEWER: 'مراجع الجمعيات',
  CONTENT_MANAGER: 'مدير المحتوى',
  SUPPORT_AGENT: 'وكيل الدعم',
  FINANCE_ADMIN: 'مدير المالية',
};

export const roleDescriptions: Record<AdminRole, string> = {
  SUPER_ADMIN: 'إدارة شاملة للنظام والصلاحيات والإعدادات الحساسة.',
  OPERATIONS_ADMIN: 'إدارة العمليات والبلاغات والموارد التشغيلية.',
  ORGANIZATION_REVIEWER: 'مراجعة واعتماد الجهات مع صلاحيات محدودة.',
  CONTENT_MANAGER: 'إدارة المحتوى والإعلانات واتصالات المحتوى.',
  SUPPORT_AGENT: 'إدارة تذاكر الدعم وسياق المستخدمين اللازم للخدمة.',
  FINANCE_ADMIN: 'إدارة التبرعات والسجلات المالية دون صلاحيات تشغيلية غير لازمة.',
};

const allPermissions = new Set<Permission>(permissions);

const sets: Record<AdminRole, Set<Permission>> = {
  SUPER_ADMIN: new Set(allPermissions),

  OPERATIONS_ADMIN: new Set([
    'dashboard:view',
    'reports:view',
    'reports:update',
    'reports:verify',
    'reports:assign',
    'reports:reject',
    'reports:close',
    'adoption:read',
    'adoption:review',
    'adoption:approve',
    'adoption:reject',
    'adoption:cancel',
    'adoption:complete',
    'adoption:delete',
    'adoption:notes:create',
    'map.read',
    'organizations:read',
    'organizations:review',
    'organizations:suspend',
    'organizations:reactivate',
    'organizations.notes.create',
    'users:read',
    'users.notes.create',
    'feeding_points.read',
    'feeding_points.review',
    'feeding_points.approve',
    'feeding_points.reject',
    'feeding_points.deactivate',
    'feeding_points.reactivate',
    'feeding_points.issues.read',
    'feeding_points.issues.review',
    'feeding_points.issues.resolve',
    'feeding_points.refill.review',
    'feeding_points.notes.create',
    'donations.read',
    'audit.read',
    'notifications.read',
    'notifications.create',
    'notifications.send',
    'notifications.schedule',
    'notifications.cancel',
    'admins.read',
    'roles.read',
    'settings.read',
  ]),

  ORGANIZATION_REVIEWER: new Set([
    'dashboard:view',
    'organizations:read',
    'organizations:review',
    'organizations:verify',
    'organizations:reject',
    'organizations:request_info',
    'organizations.documents.review',
    'organizations.notes.create',
    'adoption:read',
    'adoption:review',
    'adoption:notes:create',
    'users:read',
    'map.read',
    'feeding_points.read',
    'feeding_points.issues.read',
  ]),

  CONTENT_MANAGER: new Set([
    'dashboard:view',
    'content.read',
    'content.create',
    'content.update',
    'content.review',
    'content.publish',
    'content.schedule',
    'content.archive',
    'faq.read',
    'faq.update',
    'advertisements.read',
    'advertisements.review',
    'advertisements.approve',
    'advertisements.reject',
    'advertisements.schedule',
    'advertisements.activate',
    'advertisements.pause',
    'advertisements.notes.create',
    'notifications.read',
    'notifications.create',
    'notifications.schedule',
    'notifications.templates.read',
    'notifications.templates.update',
  ]),

  SUPPORT_AGENT: new Set([
    'dashboard:view',
    'reports:view',
    'adoption:read',
    'support.read',
    'support.requester_sensitive.read',
    'support.assign',
    'support.reply',
    'support.notes.create',
    'support.priority.update',
    'support.status.update',
    'support.escalate',
    'support.resolve',
    'support.canned_responses.read',
    'users:read',
    'users.sensitive.read',
    'users.notes.create',
    'map.read',
    'feeding_points.read',
    'feeding_points.issues.read',
  ]),

  FINANCE_ADMIN: new Set([
    'dashboard:view',
    'reports:view',
    'donations.read',
    'donations.review',
    'donations.approve',
    'donations.reject',
    'donations.delete',
    'donations.export',
    'users:read',
    'organizations:read',
  ]),
};

export const rolePermissions: Record<AdminRole, ReadonlySet<Permission>> = sets;

export const getRolePermissions = (role: AdminRole): Permission[] => [...sets[role]];

// SUPER_ADMIN always keeps the full permission set.
export const replaceRolePermissions = (role: AdminRole, next: readonly Permission[]): void => {
  if (role === 'SUPER_ADMIN') {
    return;
  }

  sets[role].clear();
  next.forEach((permission) => sets[role].add(permission));
};