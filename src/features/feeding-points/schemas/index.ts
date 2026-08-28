import { z } from 'zod';

export const noteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, 'أدخل ملاحظة واضحة')
    .max(1000, 'الملاحظة طويلة جدًا'),
});

export const reasonSchema = z
  .object({
    reason: z.string().min(1, 'اختر السبب'),
    otherReason: z.string().trim().max(500).optional(),
  })
  // Require extra details when the generic "other reason" option is selected.
  .superRefine((value, context) => {
    if (value.reason === 'سبب آخر' && !value.otherReason) {
      context.addIssue({
        code: 'custom',
        path: ['otherReason'],
        message: 'اكتب السبب',
      });
    }
  });

export const refillReviewSchema = z
  .object({
    decision: z.enum(['VERIFY', 'REJECT']),
    reason: z.string().trim().max(500).optional(),
  })
  // Rejected refill reports must include a clear reason.
  .superRefine((value, context) => {
    if (
      value.decision === 'REJECT' &&
      (!value.reason || value.reason.length < 3)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'اكتب سبب رفض واضح',
      });
    }
  });

export const resolveIssueSchema = z.object({
  resolutionNote: z
    .string()
    .trim()
    .min(5, 'اكتب ملاحظة الحل')
    .max(800),
});