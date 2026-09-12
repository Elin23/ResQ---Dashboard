import { env } from '@/config/env';
import type { AttentionItem, DashboardRange, DashboardSummary, GeographicSnapshot, RecentActivity } from '../types';
import * as api from './dashboard.api';
import * as mock from './dashboard.mock';

/**
 * The production dashboard API currently exposes aggregate data, while some
 * homepage widgets (trend chart, critical reports and active rescues) still do
 * not have dedicated backend payloads. Keep real API values whenever they are
 * available and only fill unsupported/empty collections from the frontend
 * fallback so the homepage remains useful.
 */
function mergeSummaryWithFrontendFallback(
  live: DashboardSummary,
  fallback: DashboardSummary,
): DashboardSummary {
  return {
    ...live,
    generatedAt: live.generatedAt || fallback.generatedAt,
    metrics: live.metrics.length > 0 ? live.metrics : fallback.metrics,
    weeklyReports: live.weeklyReports.length > 0 ? live.weeklyReports : fallback.weeklyReports,
    criticalReports: live.criticalReports.length > 0 ? live.criticalReports : fallback.criticalReports,
    activeMissions: live.activeMissions.length > 0 ? live.activeMissions : fallback.activeMissions,
    operationalSummary:
      live.operationalSummary.length > 0
        ? live.operationalSummary
        : fallback.operationalSummary,
  };
}

export async function getDashboardSummary(
  range: DashboardRange,
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  if (env.dataSource !== 'api') {
    return mock.getDashboardSummary(range);
  }

  // Prepare the frontend fallback in parallel. A backend outage should not make
  // the admin landing page unusable.
  const fallbackPromise = mock.getDashboardSummary(range);

  try {
    const live = await api.getDashboardSummary(range, signal);
    const fallback = await fallbackPromise;
    return mergeSummaryWithFrontendFallback(live, fallback);
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    return fallbackPromise;
  }
}

export async function getAttentionQueue(signal?: AbortSignal): Promise<AttentionItem[]> {
  if (env.dataSource !== 'api') {
    return mock.getAttentionQueue();
  }

  try {
    const items = await api.getAttentionQueue(signal);
    return items.length > 0 ? items : mock.getAttentionQueue();
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    return mock.getAttentionQueue();
  }
}

export async function getRecentActivity(signal?: AbortSignal): Promise<RecentActivity[]> {
  if (env.dataSource !== 'api') {
    return mock.getRecentActivity();
  }

  try {
    const items = await api.getRecentActivity(signal);
    return items.length > 0 ? items : mock.getRecentActivity();
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    return mock.getRecentActivity();
  }
}

export async function getGeographicSnapshot(signal?: AbortSignal): Promise<GeographicSnapshot> {
  if (env.dataSource !== 'api') {
    return mock.getGeographicSnapshot();
  }

  try {
    const snapshot = await api.getGeographicSnapshot(signal);
    return snapshot.layers.some((layer) => layer.count > 0)
      ? snapshot
      : mock.getGeographicSnapshot();
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    return mock.getGeographicSnapshot();
  }
}
