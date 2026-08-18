import type{AdminAccountStatus,LookupType}from'../types';
export const adminStatusLabels:Record<AdminAccountStatus,string>={ACTIVE:'نشط',SUSPENDED:'معلق',INVITED:'دعوة معلقة',DISABLED:'معطل'};
export const lookupLabels:Record<LookupType,string>={REPORT_REJECTION_REASONS:'أسباب رفض البلاغ',ADOPTION_REJECTION_REASONS:'أسباب رفض طلب التبني',ORGANIZATION_REASONS:'أسباب مراجعة الجمعيات',ORGANIZATION_SERVICES:'خدمات الجمعيات',ANIMAL_TYPES:'أنواع الحيوانات',GOVERNORATES:'المحافظات'};
export const emergencyCategoryLabels={VETERINARY:'بيطري',RESCUE:'إنقاذ',OTHER:'أخرى'}as const;
