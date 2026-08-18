import { env } from '@/config/env';

/**
 * Optional mock latency used only when explicitly enabled for loading-state QA.
 * The default is zero so normal development navigation behaves like an in-memory app
 * and does not introduce artificial route-to-route skeleton flashes.
 */
export function mockDelay(requestedMs = 180): Promise<void> {
  const configured = env.mockLatencyMs;
  if (configured <= 0) return Promise.resolve();
  const duration = Math.min(Math.max(0, requestedMs), configured, 2_000);
  return new Promise((resolve) => globalThis.setTimeout(resolve, duration));
}
