import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from '@/features/auth/session';
import { dashboardKeys } from '@/features/dashboard/hooks';

import type { ContentListFilters, ContentStatus, EditorialInput } from '../types';
import * as service from '../services/content.service';

export const contentKeys = {
  all: ['content'] as const,
  overview: ['content', 'overview'] as const,
  articles: (filters: ContentListFilters) => ['content', 'articles', filters] as const,
  stories: (filters: ContentListFilters) => ['content', 'stories', filters] as const,
  awareness: (filters: ContentListFilters) => ['content', 'awareness', filters] as const,
  record: (kind: string, id: string) => ['content', kind, id] as const,
  faq: ['content', 'faq'] as const,
};

export const useContentOverview = () =>
  useQuery({
    queryKey: contentKeys.overview,
    queryFn: ({ signal }) => service.getContentOverview(signal),
  });

export const useArticles = (filters: ContentListFilters) =>
  useQuery({
    queryKey: contentKeys.articles(filters),
    queryFn: ({ signal }) => service.getArticles(filters, signal),
  });

export const useSuccessStories = (filters: ContentListFilters) =>
  useQuery({
    queryKey: contentKeys.stories(filters),
    queryFn: ({ signal }) => service.getStories(filters, signal),
  });

export const useAwarenessContent = (filters: ContentListFilters) =>
  useQuery({
    queryKey: contentKeys.awareness(filters),
    queryFn: ({ signal }) => service.getAwareness(filters, signal),
  });

export const useEditorialRecord = (kind: 'article' | 'story' | 'awareness', id: string) =>
  useQuery({
    queryKey: contentKeys.record(kind, id),
    queryFn: ({ signal }) => service.getEditorialRecord(kind, id, signal),
    enabled: Boolean(id),
  });

export const useFaqItems = () =>
  useQuery({
    queryKey: contentKeys.faq,
    queryFn: ({ signal }) => service.getFaqItems(signal),
  });

// Refresh all content queries after any content update.
function useInvalidate() {
  const queryClient = useQueryClient();

  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: contentKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);
}

export function useSaveEditorial() {
  const { session } = useSession();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ kind, id, input, status }: { kind: 'article' | 'story' | 'awareness'; id?: string; input: EditorialInput; status?: ContentStatus }) => {
      if (!session) {
        throw new Error('NO_SESSION');
      }

      return service.saveEditorial(kind, id, input, session, status);
    },
    onSuccess: () => {
      invalidate();
      toast.success('تم حفظ المحتوى.');
    },
    onError: () => {
      toast.error('تعذر حفظ المحتوى.');
    },
  });
}

export function useChangeContentStatus() {
  const { session } = useSession();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ kind, id, status, scheduledAt }: { kind: 'article' | 'story' | 'awareness'; id: string; status: ContentStatus; scheduledAt?: string }) => {
      if (!session) {
        throw new Error('NO_SESSION');
      }

      return service.changeContentStatus(kind, id, status, session, scheduledAt);
    },
    onSuccess: () => {
      invalidate();
      toast.success('تم تحديث حالة المحتوى.');
    },
    onError: () => {
      toast.error('تعذر تحديث الحالة.');
    },
  });
}

export function useAddEditorialNote() {
  const { session } = useSession();
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ kind, id, note }: { kind: 'article' | 'story' | 'awareness'; id: string; note: string }) => {
      if (!session) {
        throw new Error('NO_SESSION');
      }

      return service.addEditorialNote(kind, id, note, session);
    },
    onSuccess: () => {
      invalidate();
      toast.success('تمت إضافة الملاحظة.');
    },
  });
}

export function useSaveFaq() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: service.saveFaq,
    onSuccess: () => {
      invalidate();
      toast.success('تم حفظ السؤال الشائع.');
    },
  });
}

export function useToggleFaq() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      service.toggleFaq(id, active),
    onSuccess: invalidate,
  });
}

export function useMoveFaq() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      service.moveFaq(id, direction),
    onSuccess: invalidate,
  });
}