import { mockDelay } from './delay';
import type { ApiResponse } from '@/types/api';

export interface FoundationHealth {
  status: 'ok';
  source: 'mock';
}

export async function getFoundationHealth(): Promise<ApiResponse<FoundationHealth>> {
  await mockDelay();
  return { data: { status: 'ok', source: 'mock' } };
}
