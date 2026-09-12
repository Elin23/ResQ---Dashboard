export type DataSourceMode = 'mock' | 'api';

const DEFAULT_API_BASE_URL = 'https://resqback.runasp.net';
const DEFAULT_MEDIA_BASE_URL = 'https://resqmob.runasp.net';

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return (trimmed || fallback).replace(/\/+$/, '');
}

function normalizeNonNegativeNumber(value: string | undefined): number {
  const parsed = Number(value ?? '0');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

const requestedDataSource = import.meta.env.VITE_DATA_SOURCE?.trim().toLowerCase();

export const env = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
  mediaBaseUrl: normalizeBaseUrl(import.meta.env.VITE_MEDIA_BASE_URL, DEFAULT_MEDIA_BASE_URL),
  dataSource: (requestedDataSource === 'mock' ? 'mock' : 'api') as DataSourceMode,
  mockLatencyMs: normalizeNonNegativeNumber(import.meta.env.VITE_MOCK_LATENCY_MS),
  mapTileUrl: import.meta.env.VITE_MAP_TILE_URL?.trim() || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapPublicToken: import.meta.env.VITE_MAP_PUBLIC_TOKEN?.trim() || undefined,
} as const;
