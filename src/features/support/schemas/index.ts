import { z } from 'zod';

export const replySchema = z.object({
  body: z.string().trim().min(2, 'اكتب ردًا واضحًا قبل الإرسال.').max(3000, 'الرد طويل جدًا.'),
  waitForUser: z.boolean(),
});

export const noteSchema = z.object({
  body: z.string().trim().min(2, 'اكتب الملاحظة الداخلية.').max(2000, 'الملاحظة طويلة جدًا.'),
});

export const assignmentSchema = z.object({
  assigneeId: z.string().min(1, 'اختر المسؤول.'),
});

// Urgent priority requires an explicit escalation reason.
export const prioritySchema = z
  .object({
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    reason: z.string().trim().max(500, 'السبب طويل جدًا.').optional(),
  })
  .superRefine((v, c) => {
    if (v.priority === 'URGENT' && !v.reason) {
      c.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'أضف سبب التصعيد إلى عاجلة.',
      });
    }
  });

export const escalationSchema = z.object({
  targetTeam: z.enum(['OPERATIONS', 'FINANCE', 'CONTENT', 'ADMIN']),
  reason: z.string().trim().min(3, 'اكتب سبب التصعيد.').max(1000, 'سبب التصعيد طويل جدًا.'),
});

export const resolutionSchema = z.object({
  summary: z.string().trim().min(5, 'اكتب ملخص الحل.').max(1500, 'ملخص الحل طويل جدًا.'),
});

export const reopenSchema = z.object({
  reason: z.string().trim().min(5, 'اكتب سبب إعادة الفتح.').max(1000, 'السبب طويل جدًا.'),
});