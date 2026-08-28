import { z } from 'zod';

export const noteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, 'أدخل ملاحظة واضحة من 3 أحرف على الأقل.')
    .max(1000, 'الملاحظة طويلة جدًا.'),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const assignmentSchema = z.object({
  organizationId: z
    .string()
    .min(1, 'اختر الجمعية.'),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const statusOverrideSchema = z.object({
  status: z.enum([
    'EN_ROUTE',
    'RECEIVED',
    'CLOSED',
  ]),

  // Administrative overrides always require an audit-friendly reason.
  reason: z
    .string()
    .trim()
    .min(3, 'اذكر سبب التجاوز الإداري.')
    .max(500, 'السبب طويل جدًا.'),
});

export type StatusOverrideFormValues = z.infer<typeof statusOverrideSchema>;

export const deleteReportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'اذكر سبب حذف البلاغ.')
    .max(500, 'السبب طويل جدًا.'),
});

export type DeleteReportFormValues = z.infer<typeof deleteReportSchema>;