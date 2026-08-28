import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from '@/features/auth/session';
import * as s from '../services/support.mock';
import type { AssignTicketInput, ChangePriorityInput, EscalateTicketInput, ReplyTicketInput, ReopenTicketInput, ResolveTicketInput, SupportFilters, SupportTicketStatus } from '../types';

export const supportKeys = {
  all: ['support'] as const,
  list: (f: SupportFilters) => ['support', 'list', f] as const,
  summary: ['support', 'summary'] as const,
  detail: (id: string) => ['support', 'detail', id] as const,
  user: (id: string) => ['support', 'user', id] as const,
  canned: ['support', 'canned'] as const,
};

export function useSupportTickets(f: SupportFilters) {
  return useQuery({
    queryKey: supportKeys.list(f),
    queryFn: () => s.getSupportTickets(f),
  });
}

export function useSupportSummary() {
  return useQuery({
    queryKey: supportKeys.summary,
    queryFn: s.getSupportSummary,
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: supportKeys.detail(id),
    queryFn: () => s.getSupportTicket(id),
    enabled: Boolean(id),
  });
}

export function useUserSupportSummary(id: string) {
  return useQuery({
    queryKey: supportKeys.user(id),
    queryFn: () => s.getUserSupportSummary(id),
    enabled: Boolean(id),
  });
}

export function useCannedResponses() {
  return useQuery({
    queryKey: supportKeys.canned,
    queryFn: s.getSupportCannedResponses,
  });
}

function actor() {
  const { session } = useSession();

  if (!session) {
    throw new Error('SESSION_REQUIRED');
  }

  return session;
}

// Support mutations can affect dashboard and user-level summaries too.
function useInvalidate(id: string) {
  const q = useQueryClient();

  return () => {
    void q.invalidateQueries({ queryKey: supportKeys.all });
    void q.invalidateQueries({ queryKey: supportKeys.detail(id) });
    void q.invalidateQueries({ queryKey: ['dashboard'] });
    void q.invalidateQueries({ queryKey: ['users'] });
  };
}

export function useAssignSupportTicket(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: AssignTicketInput) => s.assignSupportTicket(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تم إسناد التذكرة.');
    },
    onError: () => toast.error('تعذر إسناد التذكرة.'),
  });
}

export function useChangeTicketPriority(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: ChangePriorityInput) => s.changeSupportPriority(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تم تحديث الأولوية.');
    },
    onError: () => toast.error('تعذر تحديث الأولوية.'),
  });
}

export function useChangeTicketStatus(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: SupportTicketStatus) => s.changeSupportStatus(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تم تحديث الحالة.');
    },
    onError: () => toast.error('تعذر تحديث الحالة.'),
  });
}

export function useReplyToTicket(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: ReplyTicketInput) => s.replyToSupportTicket(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تم إرسال الرد.');
    },
    onError: () => toast.error('تعذر إرسال الرد.'),
  });
}

export function useAddSupportInternalNote(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (body: string) => s.addSupportInternalNote(id, body, a),
    onSuccess: () => {
      done();
      toast.success('تمت إضافة الملاحظة الداخلية.');
    },
    onError: () => toast.error('تعذر إضافة الملاحظة.'),
  });
}

export function useEscalateTicket(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: EscalateTicketInput) => s.escalateSupportTicket(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تم تصعيد التذكرة.');
    },
    onError: () => toast.error('تعذر تصعيد التذكرة.'),
  });
}

export function useResolveTicket(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: ResolveTicketInput) => s.resolveSupportTicket(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تم حل التذكرة.');
    },
    onError: () => toast.error('تعذر حل التذكرة.'),
  });
}

export function useCloseTicket(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: () => s.closeSupportTicket(id, a),
    onSuccess: () => {
      done();
      toast.success('تم إغلاق التذكرة.');
    },
    onError: () => toast.error('يجب حل التذكرة قبل إغلاقها.'),
  });
}

export function useReopenTicket(id: string) {
  const a = actor();
  const done = useInvalidate(id);

  return useMutation({
    mutationFn: (v: ReopenTicketInput) => s.reopenSupportTicket(id, v, a),
    onSuccess: () => {
      done();
      toast.success('تمت إعادة فتح التذكرة.');
    },
    onError: () => toast.error('تعذر إعادة فتح التذكرة.'),
  });
}