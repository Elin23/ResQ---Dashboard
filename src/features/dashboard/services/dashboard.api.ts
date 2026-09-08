import { apiClient } from '@/services/api/client';
import type { AttentionItem, DashboardRange, DashboardSummary, GeographicSnapshot, RecentActivity } from '../types';

export function getDashboardSummary(range: DashboardRange, signal?: AbortSignal): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>(`/api/dashboard/dashboard/summary?range=${encodeURIComponent(range)}`, signal);
}

export function getAttentionQueue(signal?: AbortSignal): Promise<AttentionItem[]> {
  return apiClient.get<AttentionItem[]>('/api/dashboard/dashboard/attention', signal);
}

export function getRecentActivity(signal?: AbortSignal): Promise<RecentActivity[]> {
  return apiClient.get<RecentActivity[]>('/api/dashboard/dashboard/recent-activity', signal);
}

export function getGeographicSnapshot(signal?: AbortSignal): Promise<GeographicSnapshot> {
  return apiClient.get<GeographicSnapshot>('/api/dashboard/dashboard/geographic-snapshot', signal);
}
