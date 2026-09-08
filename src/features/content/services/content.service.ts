import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { ContentListFilters, ContentStatus, EditorialInput } from '../types';
import * as api from './content.api';
import * as mock from './content.mock';

type EditorialKind = 'article' | 'story' | 'awareness';

export const getContentOverview = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getContentOverview(signal) : mock.getContentOverview();
export const getArticles = (filters: ContentListFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getArticles(filters, signal) : mock.getArticles(filters);
export const getStories = (filters: ContentListFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getStories(filters, signal) : mock.getStories(filters);
export const getAwareness = (filters: ContentListFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getAwareness(filters, signal) : mock.getAwareness(filters);
export const getEditorialRecord = (kind: EditorialKind, id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getEditorialRecord(kind, id, signal) : mock.getEditorialRecord(kind, id);
export const saveEditorial = (kind: EditorialKind, id: string | undefined, input: EditorialInput, actor: AdminSession, status?: ContentStatus) => env.dataSource === 'api' ? api.saveEditorial(kind, id, input, actor, status) : mock.saveEditorial(kind, id, input, actor, status);
export const changeContentStatus = (kind: EditorialKind, id: string, status: ContentStatus, actor: AdminSession, scheduledAt?: string) => env.dataSource === 'api' ? api.changeContentStatus(kind, id, status, actor, scheduledAt) : mock.changeContentStatus(kind, id, status, actor, scheduledAt);
export const addEditorialNote = (kind: EditorialKind, id: string, note: string, actor: AdminSession) => env.dataSource === 'api' ? api.addEditorialNote(kind, id, note, actor) : mock.addEditorialNote(id, note, actor);
export const getFaqItems = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getFaqItems(signal) : mock.getFaqItems();
export const saveFaq = (input: { id?: string; question: string; answer: string; category: string }) => env.dataSource === 'api' ? api.saveFaq(input) : mock.saveFaq(input);
export const toggleFaq = (id: string, active: boolean) => env.dataSource === 'api' ? api.toggleFaq(id, active) : mock.toggleFaq(id, active);
export const moveFaq = (id: string, direction: 'up' | 'down') => env.dataSource === 'api' ? api.moveFaq(id, direction) : mock.moveFaq(id, direction);
