import { useQuery } from '@tanstack/react-query';

import type { AuditFilters } from '../types';
import * as service from '../services/audit-log.mock';

export const auditKeys = {
  all: ['audit-log'] as const,
  list: (filters: AuditFilters) => ['audit-log', 'list', filters] as const,
  summary: (filters: Pick<AuditFilters, 'from' | 'to'>) => ['audit-log', 'summary', filters] as const,
  detail: (id: string) => ['audit-log', 'detail', id] as const,
  options: ['audit-log', 'options'] as const,
};

export function useAuditEvents(filters: AuditFilters) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => service.getAuditEvents(filters),

    // Audit data should refresh whenever the page is opened.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useAuditSummary(filters: Pick<AuditFilters, 'from' | 'to'>) {
  return useQuery({
    queryKey: auditKeys.summary(filters),
    queryFn: () => service.getAuditSummary(filters),
  });
}

export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => service.getAuditEvent(id),
    enabled: Boolean(id),
  });
}

export function useAuditFilterOptions() {
  return useQuery({
    queryKey: auditKeys.options,
    queryFn: service.getAuditFilterOptions,
  });
}