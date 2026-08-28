export const reportOperationKeys = {
  all: ['report-operations'] as const,

  lists: () =>
    ['report-operations', 'list'] as const,

  // Keep each report operation detail isolated in the query cache.
  detail: (id: string) =>
    ['report-operations', 'detail', id] as const,
};