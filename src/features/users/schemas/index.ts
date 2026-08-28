import { z } from 'zod';

export const userNoteSchema = z.object({
  note: z.string().trim().min(3, 'أدخل ملاحظة لا تقل عن 3 أحرف').max(1000, 'الملاحظة طويلة جدًا'),
});

export type UserNoteValues = z.infer<typeof userNoteSchema>;

// Custom moderation reasons require a short explanation.
export const moderationSchema = z
  .object({
    reason: z.string().min(1, 'اختر السبب'),
    otherReason: z.string().trim().max(500).optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.reason === 'سبب آخر' && (!value.otherReason || value.otherReason.length < 3)) {
      ctx.addIssue({
        code: 'custom',
        path: ['otherReason'],
        message: 'اكتب السبب بشكل واضح',
      });
    }
  });

export type ModerationValues = z.infer<typeof moderationSchema>;