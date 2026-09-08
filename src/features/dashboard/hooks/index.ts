import { useQuery } from '@tanstack/react-query';
import { getAttentionQueue, getDashboardSummary, getGeographicSnapshot, getRecentActivity } from '../services/dashboard.service';
import type { DashboardRange } from '../types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (range: DashboardRange) => [...dashboardKeys.all, 'summary', range] as const,
  attention: () => [...dashboardKeys.all, 'attention'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  geography: () => [...dashboardKeys.all, 'geography'] as const,
};

export function useDashboardSummary(range: DashboardRange) {
  return useQuery({ queryKey: dashboardKeys.summary(range), queryFn: ({ signal }) => getDashboardSummary(range, signal) });
}
export function useAttentionQueue() {
  return useQuery({ queryKey: dashboardKeys.attention(), queryFn: ({ signal }) => getAttentionQueue(signal) });
}
export function useRecentActivity() {
  return useQuery({ queryKey: dashboardKeys.activity(), queryFn: ({ signal }) => getRecentActivity(signal) });
}
export function useGeographicSnapshot() {
  return useQuery({ queryKey: dashboardKeys.geography(), queryFn: ({ signal }) => getGeographicSnapshot(signal) });
}
