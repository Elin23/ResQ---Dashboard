/**
 * Compatibility query keys kept after removing the standalone rescue-missions pages.
 * Operational rescue state now comes from reports; no rescue-mission UI/routes depend on this module.
 */
export const missionKeys = {
  all: ['report-operations'] as const,
  lists: () => ['report-operations', 'list'] as const,
  detail: (id: string) => ['report-operations', 'detail', id] as const,
};
