import { env } from '@/config/env';
import type { AttentionItem, DashboardRange, DashboardSummary, GeographicSnapshot, RecentActivity } from '../types';
import * as api from './dashboard.api';
import * as mock from './dashboard.mock';

export function getDashboardSummary(range: DashboardRange, signal?: AbortSignal): Promise<DashboardSummary> {
  return env.dataSource === 'api' ? api.getDashboardSummary(range, signal) : mock.getDashboardSummary(range);
}

export function getAttentionQueue(signal?: AbortSignal): Promise<AttentionItem[]> {
  return env.dataSource === 'api' ? api.getAttentionQueue(signal) : mock.getAttentionQueue();
}

export function getRecentActivity(signal?: AbortSignal): Promise<RecentActivity[]> {
  return env.dataSource === 'api' ? api.getRecentActivity(signal) : mock.getRecentActivity();
}

export function getGeographicSnapshot(signal?: AbortSignal): Promise<GeographicSnapshot> {
  return env.dataSource === 'api' ? api.getGeographicSnapshot(signal) : mock.getGeographicSnapshot();
}
