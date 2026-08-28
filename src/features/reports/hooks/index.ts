import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session';
import { dashboardKeys } from '@/features/dashboard/hooks';

import { addReportNote, adminOverrideReportStatus, assignReport, deleteReport, getEligibleOrganizations, getReportById, getReportSummary, getReports } from '../services/reports.mock';
import type { AdminStatusOverrideInput, DeleteReportInput, ReportFilters } from '../types';

export const reportKeys = {
  all: ['reports'] as const,

  lists: () =>
    [...reportKeys.all, 'list'] as const,

  list: (filters: ReportFilters) =>
    [...reportKeys.lists(), filters] as const,

  summary: () =>
    [...reportKeys.all, 'summary'] as const,

  details: () =>
    [...reportKeys.all, 'detail'] as const,

  detail: (reportId: string) =>
    [...reportKeys.details(), reportId] as const,

  organizations: (search: string) =>
    [...reportKeys.all, 'eligible-organizations', search] as const,
};

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => getReports(filters),
    placeholderData: (previous) => previous,
  });
}

export function useReportsSummary() {
  return useQuery({
    queryKey: reportKeys.summary(),
    queryFn: getReportSummary,
  });
}

export function useReport(reportId: string) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => getReportById(reportId),
    enabled: Boolean(reportId),
  });
}

export function useEligibleOrganizations(search: string) {
  return useQuery({
    queryKey: reportKeys.organizations(search),
    queryFn: () => getEligibleOrganizations(search),
  });
}

function useReportMutationInvalidation(reportId?: string) {
  const queryClient = useQueryClient();

  // Report changes affect the list, summary, dashboard, and sometimes the active detail view.
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: reportKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: reportKeys.summary(),
      }),
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      }),
      ...(reportId
        ? [
            queryClient.invalidateQueries({
              queryKey: reportKeys.detail(reportId),
            }),
          ]
        : []),
    ]);
  };
}

export function useAssignReport(reportId: string) {
  const { session } = useSession();
  const invalidate = useReportMutationInvalidation(reportId);

  return useMutation({
    mutationFn: (organizationId: string) => {
      if (!session) {
        throw new Error('SESSION_REQUIRED');
      }

      return assignReport(
        reportId,
        organizationId,
        session,
      );
    },
    onSuccess: invalidate,
  });
}

/**
 * Admin status changes are intentionally an override, not the normal workflow.
 * The organization handling the report should update the status in normal operation.
 */
export function useAdminOverrideReportStatus(reportId: string) {
  const { session } = useSession();
  const invalidate = useReportMutationInvalidation(reportId);

  return useMutation({
    mutationFn: (input: AdminStatusOverrideInput) => {
      if (!session) {
        throw new Error('SESSION_REQUIRED');
      }

      return adminOverrideReportStatus(
        reportId,
        input,
        session,
      );
    },
    onSuccess: invalidate,
  });
}

export function useDeleteReport(reportId: string) {
  const { session } = useSession();
  const invalidate = useReportMutationInvalidation();

  return useMutation({
    mutationFn: (input: DeleteReportInput) => {
      if (!session) {
        throw new Error('SESSION_REQUIRED');
      }

      return deleteReport(
        reportId,
        input,
        session,
      );
    },
    onSuccess: invalidate,
  });
}

export function useAddReportNote(reportId: string) {
  const { session } = useSession();
  const invalidate = useReportMutationInvalidation(reportId);

  return useMutation({
    mutationFn: (note: string) => {
      if (!session) {
        throw new Error('SESSION_REQUIRED');
      }

      return addReportNote(
        reportId,
        note,
        session,
      );
    },
    onSuccess: invalidate,
  });
}