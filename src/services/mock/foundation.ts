import type { ApiResponse } from '@/types/api';

import { mockDelay } from './delay';

export interface FoundationHealth {
  status: 'ok';
  source: 'mock';
}

// Simple mock health check used to verify that the foundation service is reachable.
export async function getFoundationHealth(): Promise<ApiResponse<FoundationHealth>> {
  await mockDelay();

  return {
    data: {
      status: 'ok',
      source: 'mock',
    },
  };
}