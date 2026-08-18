export type StatusTone = 'neutral' | 'success' | 'pending' | 'critical' | 'info';
export interface StatusMeta { label: string; tone: StatusTone; }

export type SemanticStatus =
  | 'report:EN_ROUTE' | 'report:RECEIVED' | 'report:NEW' | 'report:UNDER_REVIEW' | 'report:VERIFIED' | 'report:WAITING_FOR_ORGANIZATION' | 'report:ASSIGNED' | 'report:IN_PROGRESS' | 'report:RESCUED' | 'report:CLOSED' | 'report:REJECTED'
  | 'animal:RESCUED' | 'animal:UNDER_TREATMENT' | 'animal:RECOVERING' | 'animal:AVAILABLE_FOR_ADOPTION' | 'animal:RESERVED' | 'animal:ADOPTED' | 'animal:NOT_AVAILABLE' | 'animal:DECEASED'
  | 'animal-health:CRITICAL' | 'animal-health:NEEDS_TREATMENT' | 'animal-health:STABLE' | 'animal-health:RECOVERING' | 'animal-health:HEALTHY'
  | 'mission:PENDING' | 'mission:ASSIGNED' | 'mission:ACCEPTED' | 'mission:ON_THE_WAY' | 'mission:ARRIVED' | 'mission:RESCUING' | 'mission:TRANSPORTING' | 'mission:IN_PROGRESS' | 'mission:COMPLETED' | 'mission:CANCELLED'
  | 'adoption:PENDING_REVIEW' | 'adoption:PUBLISHED' | 'adoption:REJECTED' | 'adoption:ADOPTED'
  | 'organization:PENDING_VERIFICATION' | 'organization:ACTIVE' | 'organization:SUSPENDED' | 'organization:REJECTED'
  | 'user:ACTIVE' | 'user:SUSPENDED' | 'user:BLOCKED' | 'user:DEACTIVATED'
  | 'feeding-point:PENDING' | 'feeding-point:ACTIVE' | 'feeding-point:INACTIVE' | 'feeding-point:REJECTED'
  | 'donation:PENDING' | 'donation:COMPLETED' | 'donation:FAILED' | 'donation:REFUNDED' | 'donation:CANCELLED'
  | 'entity:PENDING' | 'entity:VERIFIED' | 'entity:SUSPENDED'
  | 'support:NEW' | 'support:OPEN' | 'support:WAITING_FOR_USER' | 'support:WAITING_FOR_INTERNAL' | 'support:RESOLVED' | 'support:CLOSED'
  | 'advertisement:DRAFT' | 'advertisement:PENDING' | 'advertisement:PENDING_REVIEW' | 'advertisement:SCHEDULED' | 'advertisement:ACTIVE' | 'advertisement:PAUSED' | 'advertisement:REJECTED' | 'advertisement:EXPIRED'
  | 'content:DRAFT' | 'content:IN_REVIEW' | 'content:SCHEDULED' | 'content:PUBLISHED' | 'content:ARCHIVED'
  | 'notification:DRAFT' | 'notification:SCHEDULED' | 'notification:SENDING' | 'notification:SENT' | 'notification:PARTIALLY_SENT' | 'notification:FAILED' | 'notification:CANCELLED';

export const statusCatalog: Record<string, Record<string, StatusMeta>> = {
  report: {
    EN_ROUTE: { label: 'يتم التوجه لمكان البلاغ', tone: 'info' }, RECEIVED: { label: 'تم الاستلام', tone: 'success' },
    NEW: { label: 'جديد', tone: 'info' }, UNDER_REVIEW: { label: 'قيد المراجعة', tone: 'pending' }, VERIFIED: { label: 'تم التحقق', tone: 'success' }, WAITING_FOR_ORGANIZATION: { label: 'بانتظار جمعية', tone: 'pending' }, ASSIGNED: { label: 'تم الإسناد', tone: 'info' }, IN_PROGRESS: { label: 'الإنقاذ جارٍ', tone: 'info' }, RESCUED: { label: 'تم الإنقاذ', tone: 'success' }, CLOSED: { label: 'مغلق', tone: 'neutral' }, REJECTED: { label: 'مرفوض', tone: 'critical' },
  },
  animal: { RESCUED:{label:'تم الإنقاذ',tone:'info'}, UNDER_TREATMENT:{label:'تحت العلاج',tone:'pending'}, RECOVERING:{label:'في التعافي',tone:'info'}, AVAILABLE_FOR_ADOPTION:{label:'جاهز للتبني',tone:'success'}, RESERVED:{label:'محجوز',tone:'pending'}, ADOPTED:{label:'تم تبنيه',tone:'success'}, NOT_AVAILABLE:{label:'غير متاح',tone:'neutral'}, DECEASED:{label:'متوفى',tone:'neutral'} },
  'animal-health': { CRITICAL:{label:'حرجة',tone:'critical'}, NEEDS_TREATMENT:{label:'يحتاج علاجاً',tone:'pending'}, STABLE:{label:'مستقرة',tone:'info'}, RECOVERING:{label:'يتعافى',tone:'info'}, HEALTHY:{label:'سليم',tone:'success'} },
  mission: {
    PENDING: { label: 'بانتظار الإسناد', tone: 'pending' }, ASSIGNED: { label: 'تم الإسناد', tone: 'info' }, ACCEPTED: { label: 'تم قبول المهمة', tone: 'info' }, ON_THE_WAY: { label: 'في الطريق', tone: 'info' }, ARRIVED: { label: 'وصلت الجمعية', tone: 'success' }, RESCUING: { label: 'جاري الإنقاذ', tone: 'pending' }, TRANSPORTING: { label: 'نقل الحيوان', tone: 'info' }, IN_PROGRESS: { label: 'قيد التنفيذ', tone: 'info' }, COMPLETED: { label: 'مكتمل', tone: 'success' }, CANCELLED: { label: 'ملغي', tone: 'critical' },
  },
  adoption: { PENDING_REVIEW: { label: 'بانتظار مراجعة النشر', tone: 'pending' }, PUBLISHED: { label: 'منشور', tone: 'success' }, REJECTED: { label: 'مرفوض النشر', tone: 'critical' }, ADOPTED: { label: 'تم التبني', tone: 'success' } },
  organization: { PENDING_VERIFICATION:{label:'تنتظر التحقق',tone:'pending'}, ACTIVE:{label:'فعالة',tone:'success'}, SUSPENDED:{label:'معلقة',tone:'critical'}, REJECTED:{label:'مرفوضة',tone:'critical'} },
  user: { ACTIVE:{label:'نشط',tone:'success'}, SUSPENDED:{label:'معلق',tone:'pending'}, BLOCKED:{label:'محظور',tone:'critical'}, DEACTIVATED:{label:'معطل',tone:'neutral'} },
  'feeding-point': { PENDING:{label:'بانتظار المراجعة',tone:'pending'}, ACTIVE:{label:'نشطة',tone:'success'}, INACTIVE:{label:'معطلة',tone:'neutral'}, REJECTED:{label:'مرفوضة',tone:'critical'} },
  donation: { PENDING:{label:'معلقة',tone:'pending'}, COMPLETED:{label:'مكتملة',tone:'success'}, FAILED:{label:'فشلت',tone:'critical'}, REFUNDED:{label:'مستردة',tone:'info'}, CANCELLED:{label:'ملغاة',tone:'neutral'} },
  entity: { PENDING: { label: 'قيد التحقق', tone: 'pending' }, VERIFIED: { label: 'موثّق', tone: 'success' }, SUSPENDED: { label: 'موقوف', tone: 'critical' } },
  support: { NEW:{label:'جديدة',tone:'pending'}, OPEN:{label:'مفتوحة',tone:'info'}, WAITING_FOR_USER:{label:'بانتظار المستخدم',tone:'pending'}, WAITING_FOR_INTERNAL:{label:'بانتظار إجراء داخلي',tone:'pending'}, RESOLVED:{label:'تم الحل',tone:'success'}, CLOSED:{label:'مغلقة',tone:'neutral'} },
  advertisement: { DRAFT: { label: 'مسودة', tone: 'neutral' }, PENDING: { label: 'قيد المراجعة', tone: 'pending' }, PENDING_REVIEW: { label: 'بانتظار المراجعة', tone: 'pending' }, SCHEDULED: { label: 'مجدول', tone: 'info' }, ACTIVE: { label: 'فعال', tone: 'success' }, PAUSED: { label: 'متوقف مؤقتًا', tone: 'pending' }, REJECTED: { label: 'مرفوض', tone: 'critical' }, EXPIRED: { label: 'منتهي', tone: 'neutral' } },
  content: { DRAFT:{label:'مسودة',tone:'neutral'}, IN_REVIEW:{label:'قيد المراجعة',tone:'info'}, SCHEDULED:{label:'مجدول',tone:'pending'}, PUBLISHED:{label:'منشور',tone:'success'}, ARCHIVED:{label:'مؤرشف',tone:'neutral'} },
  notification: { DRAFT:{label:'مسودة',tone:'neutral'}, SCHEDULED:{label:'مجدول',tone:'pending'}, SENDING:{label:'قيد الإرسال',tone:'info'}, SENT:{label:'تم الإرسال',tone:'success'}, PARTIALLY_SENT:{label:'إرسال جزئي',tone:'pending'}, FAILED:{label:'فشل',tone:'critical'}, CANCELLED:{label:'ملغي',tone:'neutral'} },
};

const semanticStatusMap: Record<SemanticStatus, StatusMeta> = {
  'report:EN_ROUTE': statusCatalog.report?.EN_ROUTE ?? { label: 'يتم التوجه لمكان البلاغ', tone: 'info' },
  'report:RECEIVED': statusCatalog.report?.RECEIVED ?? { label: 'تم الاستلام', tone: 'success' },
  'report:NEW': statusCatalog.report?.NEW ?? { label: 'جديد', tone: 'info' },
  'report:UNDER_REVIEW': statusCatalog.report?.UNDER_REVIEW ?? { label: 'قيد المراجعة', tone: 'pending' },
  'report:VERIFIED': statusCatalog.report?.VERIFIED ?? { label: 'تم التحقق', tone: 'success' },
  'report:WAITING_FOR_ORGANIZATION': statusCatalog.report?.WAITING_FOR_ORGANIZATION ?? { label: 'بانتظار جمعية', tone: 'pending' },
  'report:ASSIGNED': statusCatalog.report?.ASSIGNED ?? { label: 'تم الإسناد', tone: 'info' },
  'report:IN_PROGRESS': statusCatalog.report?.IN_PROGRESS ?? { label: 'الإنقاذ جارٍ', tone: 'info' },
  'report:RESCUED': statusCatalog.report?.RESCUED ?? { label: 'تم الإنقاذ', tone: 'success' },
  'report:CLOSED': statusCatalog.report?.CLOSED ?? { label: 'مغلق', tone: 'neutral' },
  'report:REJECTED': statusCatalog.report?.REJECTED ?? { label: 'مرفوض', tone: 'critical' },
  'animal:RESCUED': statusCatalog.animal?.RESCUED ?? { label: 'تم الإنقاذ', tone: 'info' },
  'animal:UNDER_TREATMENT': statusCatalog.animal?.UNDER_TREATMENT ?? { label: 'تحت العلاج', tone: 'pending' },
  'animal:RECOVERING': statusCatalog.animal?.RECOVERING ?? { label: 'في التعافي', tone: 'info' },
  'animal:AVAILABLE_FOR_ADOPTION': statusCatalog.animal?.AVAILABLE_FOR_ADOPTION ?? { label: 'جاهز للتبني', tone: 'success' },
  'animal:RESERVED': statusCatalog.animal?.RESERVED ?? { label: 'محجوز', tone: 'pending' },
  'animal:ADOPTED': statusCatalog.animal?.ADOPTED ?? { label: 'تم تبنيه', tone: 'success' },
  'animal:NOT_AVAILABLE': statusCatalog.animal?.NOT_AVAILABLE ?? { label: 'غير متاح', tone: 'neutral' },
  'animal:DECEASED': statusCatalog.animal?.DECEASED ?? { label: 'متوفى', tone: 'neutral' },
  'animal-health:CRITICAL': statusCatalog['animal-health']?.CRITICAL ?? { label: 'حرجة', tone: 'critical' },
  'animal-health:NEEDS_TREATMENT': statusCatalog['animal-health']?.NEEDS_TREATMENT ?? { label: 'يحتاج علاجاً', tone: 'pending' },
  'animal-health:STABLE': statusCatalog['animal-health']?.STABLE ?? { label: 'مستقرة', tone: 'info' },
  'animal-health:RECOVERING': statusCatalog['animal-health']?.RECOVERING ?? { label: 'يتعافى', tone: 'info' },
  'animal-health:HEALTHY': statusCatalog['animal-health']?.HEALTHY ?? { label: 'سليم', tone: 'success' },
  'mission:PENDING': statusCatalog.mission?.PENDING ?? { label: 'بانتظار الإسناد', tone: 'pending' },
  'mission:ASSIGNED': statusCatalog.mission?.ASSIGNED ?? { label: 'تم الإسناد', tone: 'info' },
  'mission:ACCEPTED': statusCatalog.mission?.ACCEPTED ?? { label: 'تم قبول المهمة', tone: 'info' },
  'mission:ON_THE_WAY': statusCatalog.mission?.ON_THE_WAY ?? { label: 'في الطريق', tone: 'info' },
  'mission:ARRIVED': statusCatalog.mission?.ARRIVED ?? { label: 'وصلت الجمعية', tone: 'success' },
  'mission:RESCUING': statusCatalog.mission?.RESCUING ?? { label: 'جاري الإنقاذ', tone: 'pending' },
  'mission:TRANSPORTING': statusCatalog.mission?.TRANSPORTING ?? { label: 'نقل الحيوان', tone: 'info' },
  'mission:IN_PROGRESS': statusCatalog.mission?.IN_PROGRESS ?? { label: 'قيد التنفيذ', tone: 'info' },
  'mission:COMPLETED': statusCatalog.mission?.COMPLETED ?? { label: 'مكتمل', tone: 'success' },
  'mission:CANCELLED': statusCatalog.mission?.CANCELLED ?? { label: 'ملغي', tone: 'critical' },
  'adoption:PENDING_REVIEW': statusCatalog.adoption?.PENDING_REVIEW ?? { label: 'بانتظار مراجعة النشر', tone: 'pending' },
  'adoption:PUBLISHED': statusCatalog.adoption?.PUBLISHED ?? { label: 'منشور', tone: 'success' },
  'adoption:REJECTED': statusCatalog.adoption?.REJECTED ?? { label: 'مرفوض', tone: 'critical' },
  'adoption:ADOPTED': statusCatalog.adoption?.ADOPTED ?? { label: 'تم التبني', tone: 'success' },
  'organization:PENDING_VERIFICATION': statusCatalog.organization?.PENDING_VERIFICATION ?? { label: 'تنتظر التحقق', tone: 'pending' },
  'organization:ACTIVE': statusCatalog.organization?.ACTIVE ?? { label: 'فعالة', tone: 'success' },
  'organization:SUSPENDED': statusCatalog.organization?.SUSPENDED ?? { label: 'معلقة', tone: 'critical' },
  'organization:REJECTED': statusCatalog.organization?.REJECTED ?? { label: 'مرفوضة', tone: 'critical' },
  'user:ACTIVE': statusCatalog.user?.ACTIVE ?? { label: 'نشط', tone: 'success' },
  'user:SUSPENDED': statusCatalog.user?.SUSPENDED ?? { label: 'معلق', tone: 'pending' },
  'user:BLOCKED': statusCatalog.user?.BLOCKED ?? { label: 'محظور', tone: 'critical' },
  'user:DEACTIVATED': statusCatalog.user?.DEACTIVATED ?? { label: 'معطل', tone: 'neutral' },
  'feeding-point:PENDING': statusCatalog['feeding-point']?.PENDING ?? { label: 'بانتظار المراجعة', tone: 'pending' },
  'feeding-point:ACTIVE': statusCatalog['feeding-point']?.ACTIVE ?? { label: 'نشطة', tone: 'success' },
  'feeding-point:INACTIVE': statusCatalog['feeding-point']?.INACTIVE ?? { label: 'غير نشطة', tone: 'neutral' },
  'feeding-point:REJECTED': statusCatalog['feeding-point']?.REJECTED ?? { label: 'مرفوضة', tone: 'critical' },
  'donation:PENDING': statusCatalog.donation?.PENDING ?? { label: 'معلقة', tone: 'pending' },
  'donation:COMPLETED': statusCatalog.donation?.COMPLETED ?? { label: 'مكتملة', tone: 'success' },
  'donation:FAILED': statusCatalog.donation?.FAILED ?? { label: 'فشلت', tone: 'critical' },
  'donation:REFUNDED': statusCatalog.donation?.REFUNDED ?? { label: 'مستردة', tone: 'info' },
  'donation:CANCELLED': statusCatalog.donation?.CANCELLED ?? { label: 'ملغاة', tone: 'neutral' },
  'entity:PENDING': statusCatalog.entity?.PENDING ?? { label: 'قيد التحقق', tone: 'pending' },
  'entity:VERIFIED': statusCatalog.entity?.VERIFIED ?? { label: 'موثّق', tone: 'success' },
  'entity:SUSPENDED': statusCatalog.entity?.SUSPENDED ?? { label: 'موقوف', tone: 'critical' },
  'support:NEW': statusCatalog.support?.NEW ?? { label: 'جديدة', tone: 'pending' },
  'support:OPEN': statusCatalog.support?.OPEN ?? { label: 'مفتوحة', tone: 'info' },
  'support:WAITING_FOR_USER': statusCatalog.support?.WAITING_FOR_USER ?? { label: 'بانتظار المستخدم', tone: 'pending' },
  'support:WAITING_FOR_INTERNAL': statusCatalog.support?.WAITING_FOR_INTERNAL ?? { label: 'بانتظار إجراء داخلي', tone: 'pending' },
  'support:RESOLVED': statusCatalog.support?.RESOLVED ?? { label: 'تم الحل', tone: 'success' },
  'support:CLOSED': statusCatalog.support?.CLOSED ?? { label: 'مغلقة', tone: 'neutral' },
  'advertisement:DRAFT': statusCatalog.advertisement?.DRAFT ?? { label: 'مسودة', tone: 'neutral' },
  'advertisement:PENDING': statusCatalog.advertisement?.PENDING ?? { label: 'قيد المراجعة', tone: 'pending' },
  'advertisement:PENDING_REVIEW': statusCatalog.advertisement?.PENDING_REVIEW ?? { label: 'بانتظار المراجعة', tone: 'pending' },
  'advertisement:SCHEDULED': statusCatalog.advertisement?.SCHEDULED ?? { label: 'مجدول', tone: 'info' },
  'advertisement:ACTIVE': statusCatalog.advertisement?.ACTIVE ?? { label: 'فعال', tone: 'success' },
  'advertisement:PAUSED': statusCatalog.advertisement?.PAUSED ?? { label: 'متوقف مؤقتًا', tone: 'pending' },
  'advertisement:REJECTED': statusCatalog.advertisement?.REJECTED ?? { label: 'مرفوض', tone: 'critical' },
  'advertisement:EXPIRED': statusCatalog.advertisement?.EXPIRED ?? { label: 'منتهي', tone: 'neutral' },
  'content:DRAFT': statusCatalog.content?.DRAFT ?? { label: 'مسودة', tone: 'neutral' },
  'content:IN_REVIEW': statusCatalog.content?.IN_REVIEW ?? { label: 'قيد المراجعة', tone: 'info' },
  'content:SCHEDULED': statusCatalog.content?.SCHEDULED ?? { label: 'مجدول', tone: 'pending' },
  'content:PUBLISHED': statusCatalog.content?.PUBLISHED ?? { label: 'منشور', tone: 'success' },
  'content:ARCHIVED': statusCatalog.content?.ARCHIVED ?? { label: 'مؤرشف', tone: 'neutral' },
  'notification:DRAFT': statusCatalog.notification?.DRAFT ?? { label: 'مسودة', tone: 'neutral' },
  'notification:SCHEDULED': statusCatalog.notification?.SCHEDULED ?? { label: 'مجدول', tone: 'pending' },
  'notification:SENDING': statusCatalog.notification?.SENDING ?? { label: 'قيد الإرسال', tone: 'info' },
  'notification:SENT': statusCatalog.notification?.SENT ?? { label: 'تم الإرسال', tone: 'success' },
  'notification:PARTIALLY_SENT': statusCatalog.notification?.PARTIALLY_SENT ?? { label: 'إرسال جزئي', tone: 'pending' },
  'notification:FAILED': statusCatalog.notification?.FAILED ?? { label: 'فشل', tone: 'critical' },
  'notification:CANCELLED': statusCatalog.notification?.CANCELLED ?? { label: 'ملغي', tone: 'neutral' },
};

export function getStatusMeta(status: SemanticStatus | string | null | undefined): StatusMeta {
  if (!status) return { label: 'غير معروف', tone: 'neutral' };
  return semanticStatusMap[status as SemanticStatus] ?? { label: 'غير معروف', tone: 'neutral' };
}
