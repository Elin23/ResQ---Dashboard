import{permissions}from'@/features/auth/permissions';
import{z}from'zod';
export const inviteAdminSchema=z.object({fullName:z.string().trim().min(3,'الاسم مطلوب.'),email:z.string().trim().email('أدخل بريدًا إلكترونيًا صحيحًا.'),roleIds:z.array(z.string()).min(1,'اختر دورًا واحدًا على الأقل.')});
export const suspendAdminSchema=z.object({reason:z.string().trim().min(5,'سبب التعليق مطلوب.')});
export const roleSchema=z.object({name:z.string().trim().min(3,'اسم الدور مطلوب.'),description:z.string().trim().min(8,'أضف وصفًا واضحًا للدور.'),permissions:z.array(z.enum(permissions)).min(1,'اختر صلاحية واحدة على الأقل.')});
export const targetsSchema=z.object({reportReviewMinutes:z.number().int().min(1).max(1440),missionAcceptanceMinutes:z.number().int().min(1).max(1440),missionArrivalMinutes:z.number().int().min(1).max(1440),supportFirstResponseMinutes:z.number().int().min(1).max(1440),adoptionReviewHours:z.number().int().min(1).max(720)});
