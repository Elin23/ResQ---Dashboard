/**
 * Query keys for operational analytics derived from assigned reports.
 * There is no standalone rescue-mission feature or route.
 */
export const reportOperationKeys = {
  all: ['report-operations'] as const,
  lists: () => ['report-operations', 'list'] as const,
  detail: (id: string) => ['report-operations', 'detail', id] as const,
};
