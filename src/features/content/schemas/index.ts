import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const editorialSchema = z
  .object({
    title: z.string().trim().min(3, 'العنوان مطلوب ويجب أن يكون واضحًا.'),
    slug: z
      .string()
      .trim()
      .regex(
        slugPattern,
        'الرابط المختصر يجب أن يحتوي أحرفًا إنجليزية صغيرة وأرقامًا وشرطات فقط.',
      ),
    summary: z.string().trim().min(10, 'الملخص مطلوب.'),
    content: z.string().trim().min(30, 'المحتوى قصير جدًا.'),
    coverImageUrl: z
      .string()
      .url('رابط الصورة غير صالح.')
      .optional()
      .or(z.literal('')),
    coverAltText: z.string().trim().optional(),
    category: z
      .enum([
        'ANIMAL_CARE',
        'HEALTH',
        'NUTRITION',
        'BEHAVIOR',
        'SAFETY',
        'ADOPTION',
        'OTHER',
      ])
      .optional(),
    tags: z.array(z.string()),
    scheduledAt: z.string().optional(),
    metaTitle: z
      .string()
      .max(
        60,
        'يفضل ألا يتجاوز عنوان محركات البحث 60 حرفًا.',
      )
      .optional(),
    metaDescription: z
      .string()
      .max(
        160,
        'يفضل ألا يتجاوز وصف محركات البحث 160 حرفًا.',
      )
      .optional(),
    reportId: z.string().optional(),
    organizationId: z.string().optional(),
    audience: z
      .array(
        z.enum([
          'ALL',
          'USERS',
          'ORGANIZATIONS',
        ]),
      )
      .optional(),
  })
  // Scheduled content must always use a future publish date.
  .refine(
    (value) =>
      !value.scheduledAt ||
      +new Date(value.scheduledAt) > Date.now(),
    {
      message: 'موعد النشر المجدول يجب أن يكون في المستقبل.',
      path: ['scheduledAt'],
    },
  );

export const faqSchema = z.object({
  question: z.string().trim().min(5, 'السؤال مطلوب.'),
  answer: z.string().trim().min(10, 'الإجابة مطلوبة.'),
  category: z.string().trim().min(1, 'التصنيف مطلوب.'),
});

// Internal notes still require a short meaningful message.
export const noteSchema = z.object({
  note: z.string().trim().min(3, 'اكتب ملاحظة واضحة.'),
});