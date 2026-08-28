import { z } from 'zod';

export const requestInfoSchema = z.object({
  requestedItems: z
    .array(z.string())
    .min(1, 'حدد معلومة أو مستنداً واحداً على الأقل.'),

  message: z
    .string()
    .min(10, 'اكتب رسالة توضح المطلوب.'),

  deadline: z
    .string()
    .optional(),
});

export const rejectOrganizationSchema = z
  .object({
    reason: z
      .string()
      .min(1, 'اختر سبب الرفض.'),

    otherReason: z
      .string()
      .optional(),
  })
  // Require a written explanation when the generic "other reason" option is selected.
  .superRefine((v, c) => {
    if (
      v.reason === 'سبب آخر' &&
      (!v.otherReason || v.otherReason.trim().length < 5)
    ) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherReason'],
        message: 'اكتب سبب الرفض.',
      });
    }
  });

export const suspendOrganizationSchema = z
  .object({
    reason: z
      .string()
      .min(1, 'اختر سبب التعليق.'),

    otherReason: z
      .string()
      .optional(),

    note: z
      .string()
      .optional(),

    acknowledgeActiveReports: z
      .boolean(),
  })
  // Keep custom suspension reasons descriptive enough for audit history.
  .superRefine((v, c) => {
    if (
      v.reason === 'سبب آخر' &&
      (!v.otherReason || v.otherReason.trim().length < 5)
    ) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherReason'],
        message: 'اكتب سبب التعليق.',
      });
    }
  });

export const organizationNoteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, 'اكتب ملاحظة مفيدة.')
    .max(1200, 'الملاحظة طويلة جداً.'),
});