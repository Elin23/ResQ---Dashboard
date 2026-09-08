import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type {
  DeactivateFeedingPointInput,
  FeedingPointFilters,
  RejectFeedingPointInput,
  RejectIssueInput,
  ResolveIssueInput,
  ReviewRefillInput,
} from '../types';
import * as api from './feeding-points.api';
import * as mock from './feeding-points.mock';

export const getFeedingPoints = (filters: FeedingPointFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getFeedingPoints(filters, signal) : mock.getFeedingPoints(filters);
export const getFeedingPointSummary = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getFeedingPointSummary(signal) : mock.getFeedingPointSummary();
export const getFeedingPointById = (id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getFeedingPointById(id, signal) : mock.getFeedingPointById(id);

async function afterMockMutation(pointId: string, mutation: () => Promise<unknown>) {
  await mutation();
  return mock.getFeedingPointById(pointId);
}

export const approveFeedingPoint = (id: string, actor: AdminSession) => env.dataSource === 'api' ? api.approveFeedingPoint(id) : afterMockMutation(id, () => mock.approveFeedingPoint(id, actor));
export const rejectFeedingPoint = (id: string, input: RejectFeedingPointInput, actor: AdminSession) => env.dataSource === 'api' ? api.rejectFeedingPoint(id, input) : afterMockMutation(id, () => mock.rejectFeedingPoint(id, input, actor));
export const deactivateFeedingPoint = (id: string, input: DeactivateFeedingPointInput, actor: AdminSession) => env.dataSource === 'api' ? api.deactivateFeedingPoint(id, input) : afterMockMutation(id, () => mock.deactivateFeedingPoint(id, input, actor));
export const reactivateFeedingPoint = (id: string, actor: AdminSession) => env.dataSource === 'api' ? api.reactivateFeedingPoint(id) : afterMockMutation(id, () => mock.reactivateFeedingPoint(id, actor));
export const reviewFeedingPointRefill = (pointId: string, refillId: string, input: ReviewRefillInput, actor: AdminSession) => env.dataSource === 'api' ? api.reviewFeedingPointRefill(pointId, refillId, input) : afterMockMutation(pointId, () => mock.reviewFeedingPointRefill(pointId, refillId, input, actor));
export const startIssueReview = (pointId: string, issueId: string, actor: AdminSession) => env.dataSource === 'api' ? api.startIssueReview(pointId, issueId) : afterMockMutation(pointId, () => mock.startIssueReview(pointId, issueId, actor));
export const resolveIssue = (pointId: string, issueId: string, input: ResolveIssueInput, actor: AdminSession) => env.dataSource === 'api' ? api.resolveIssue(pointId, issueId, input) : afterMockMutation(pointId, () => mock.resolveIssue(pointId, issueId, input, actor));
export const rejectIssue = (pointId: string, issueId: string, input: RejectIssueInput, actor: AdminSession) => env.dataSource === 'api' ? api.rejectIssue(pointId, issueId, input) : afterMockMutation(pointId, () => mock.rejectIssue(pointId, issueId, input, actor));
export const addFeedingPointNote = (id: string, note: string, actor: AdminSession) => env.dataSource === 'api' ? api.addFeedingPointNote(id, note) : mock.addFeedingPointNote(id, note, actor);
