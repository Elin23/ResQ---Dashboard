import { z } from 'zod';

export const rejectionSchema = z
  .object({
    reason: z.string().min(1, 'اختر سبب رفض النشر'),
    otherReason: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.reason === 'سبب آخر' && !value.otherReason) {
      ctx.addIssue({ code: 'custom', path: ['otherReason'], message: 'اكتب سبب رفض النشر' });
    }
  });

export const noteSchema = z.object({
  note: z.string().trim().min(3, 'اكتب ملاحظة واضحة').max(1000, 'الملاحظة طويلة جداً'),
});
