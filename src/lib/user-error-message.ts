import { ApiClientError } from '@/services/api/client';

const codeMessages: Record<string, string> = {
  NETWORK_ERROR: 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.',
  REQUEST_TIMEOUT: 'استغرق الطلب وقتًا أطول من المتوقع. حاول مرة أخرى.',
  HTTP_ERROR: 'تعذر إتمام الطلب حاليًا. حاول مرة أخرى.',
  SESSION_REQUIRED: 'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى للمتابعة.',
  NO_SESSION: 'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى للمتابعة.',
  USER_NOT_FOUND: 'تعذر العثور على المستخدم المطلوب.',
  REPORT_NOT_FOUND: 'تعذر العثور على البلاغ المطلوب.',
  FEEDING_POINT_NOT_FOUND: 'تعذر العثور على نقطة الإطعام المطلوبة.',
  NOT_FOUND: 'تعذر العثور على العنصر المطلوب.',
  INVALID_USER_TRANSITION: 'لا يمكن تنفيذ هذا الإجراء على حالة المستخدم الحالية.',
  INVALID_REPORT_STATE: 'لا يمكن تنفيذ هذا الإجراء على حالة البلاغ الحالية.',
  INVALID_POINT_TRANSITION: 'لا يمكن تنفيذ هذا الإجراء على حالة نقطة الإطعام الحالية.',
  INVALID_REFILL_TRANSITION: 'لا يمكن تنفيذ هذا الإجراء على حالة التعبئة الحالية.',
  INVALID_ISSUE_TRANSITION: 'لا يمكن تنفيذ هذا الإجراء على حالة المشكلة الحالية.',
  ORGANIZATION_NOT_AVAILABLE: 'الجمعية المحددة غير متاحة حاليًا لهذا الإجراء.',
  PAYMENT_NOT_CONFIRMED: 'يجب تأكيد التسديد قبل نشر الإعلان.',
  INVALID_DEEP_LINK: 'رابط الانتقال داخل الإشعار غير صالح. تحقق منه ثم حاول مرة أخرى.',
  SLUG_EXISTS: 'الرابط المختصر مستخدم مسبقًا. اختر رابطًا آخر.',
};

function statusMessage(status: number): string | null {
  switch (status) {
    case 0:
      return codeMessages.NETWORK_ERROR ?? 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
    case 400:
      return 'بعض البيانات المدخلة غير صحيحة. راجع الحقول وحاول مرة أخرى.';
    case 401:
      return 'انتهت جلسة تسجيل الدخول أو لم تعد صالحة. سجّل الدخول مرة أخرى.';
    case 403:
      return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
    case 404:
      return 'تعذر العثور على البيانات المطلوبة.';
    case 409:
      return 'تعذر تنفيذ العملية بسبب تعارض مع البيانات الحالية. حدّث الصفحة وحاول مرة أخرى.';
    case 422:
      return 'تعذر قبول البيانات المدخلة. راجع الحقول المطلوبة وحاول مرة أخرى.';
    case 429:
      return 'تم إرسال طلبات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.';
    case 500:
      return 'حدث خطأ داخلي في الخادم. حاول مرة أخرى بعد قليل.';
    case 502:
    case 503:
      return 'الخدمة غير متاحة مؤقتًا. حاول مرة أخرى بعد قليل.';
    case 504:
      return 'تأخر الخادم في الاستجابة. حاول مرة أخرى بعد قليل.';
    default:
      return null;
  }
}

function containsArabic(value: string): boolean {
  return /[\u0600-\u06FF]/u.test(value);
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[\s.-]+/gu, '_');
}

export function getUserErrorMessage(
  error: unknown,
  fallback = 'حدث خطأ غير متوقع. حاول مرة أخرى.',
): string {
  if (error instanceof ApiClientError) {
    const byCode = codeMessages[normalizeCode(error.code)];
    if (byCode) return byCode;

    const byStatus = statusMessage(error.status);
    if (byStatus) return byStatus;

    if (error.message && containsArabic(error.message)) return error.message;
    return fallback;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'تم إلغاء الطلب قبل اكتماله.';
  }

  if (error instanceof Error) {
    const byCode = codeMessages[normalizeCode(error.message)];
    if (byCode) return byCode;
    if (containsArabic(error.message)) return error.message;
  }

  return fallback;
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 401) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }

  return getUserErrorMessage(error, 'تعذر تسجيل الدخول حاليًا. حاول مرة أخرى.');
}
