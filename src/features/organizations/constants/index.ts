import type { OrganizationDocumentType, OrganizationServiceKey, OrganizationVerificationStatus } from '../types';
export const organizationServiceLabels:Record<OrganizationServiceKey,string>={RESCUE:'إنقاذ الحيوانات',SHELTER:'الإيواء',FOSTER:'الرعاية المؤقتة',ADOPTION:'التبني',AWARENESS:'التوعية',TRANSPORT:'النقل',FOOD_SUPPORT:'الدعم الغذائي'};
export const documentTypeLabels:Record<OrganizationDocumentType,string>={LICENSE:'الترخيص',REGISTRATION:'التسجيل',REPRESENTATIVE_ID:'هوية الممثل',ADDRESS_PROOF:'إثبات العنوان',OTHER:'مستند آخر'};
export const verificationLabels:Record<OrganizationVerificationStatus,string>={NOT_REVIEWED:'لم تُراجع',IN_REVIEW:'قيد المراجعة',VERIFIED:'تم التحقق',REJECTED:'مرفوضة',MORE_INFO_REQUIRED:'معلومات إضافية مطلوبة'};
export const dayLabels={SATURDAY:'السبت',SUNDAY:'الأحد',MONDAY:'الاثنين',TUESDAY:'الثلاثاء',WEDNESDAY:'الأربعاء',THURSDAY:'الخميس',FRIDAY:'الجمعة'} as const;
export const rejectionReasons=['مستندات غير صحيحة','عدم اكتمال متطلبات التسجيل','تعذر التحقق من الجهة','بيانات غير متطابقة','الجهة خارج نطاق المنصة','سبب آخر'] as const;
export const suspensionReasons=['مخالفة سياسات المنصة','شكاوى خطرة قيد التحقيق','بيانات تشغيلية غير صحيحة','إساءة استخدام المنصة','طلب من الجهة','سبب آخر'] as const;
