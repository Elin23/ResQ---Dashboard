import { z } from 'zod';
import { bodyMaxLength,titleMaxLength } from '../constants';
import { isValidNotificationDeepLink } from '../utils';
export const broadcastComposeSchema=z.object({title:z.string().trim().min(3,'العنوان مطلوب').max(titleMaxLength,`الحد الأقصى ${titleMaxLength} حرفًا`),body:z.string().trim().min(5,'نص الإشعار مطلوب').max(bodyMaxLength,`الحد الأقصى ${bodyMaxLength} حرفًا`),deepLink:z.string().trim().refine(isValidNotificationDeepLink,'الرابط الداخلي غير مدعوم أو غير آمن'),imageUrl:z.union([z.literal(''),z.string().trim().url('رابط الصورة غير صالح')]),channels:z.array(z.enum(['IN_APP','PUSH'])).min(1,'اختر قناة واحدة على الأقل')});
export const scheduleSchema=z.object({scheduledAt:z.string().min(1,'وقت الجدولة مطلوب')}).refine((v)=>new Date(v.scheduledAt).getTime()>Date.now(),{message:'يجب أن يكون وقت الإرسال في المستقبل',path:['scheduledAt']});
export const templateSchema=z.object({titleTemplate:z.string().trim().min(2,'عنوان القالب مطلوب').max(titleMaxLength),bodyTemplate:z.string().trim().min(4,'نص القالب مطلوب').max(bodyMaxLength)});
