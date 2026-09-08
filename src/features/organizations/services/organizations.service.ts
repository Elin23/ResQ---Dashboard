import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { OrganizationFilters, RejectOrganizationInput, RequestInfoInput, ReviewDocumentInput, SuspendOrganizationInput } from '../types';
import * as api from './organizations.api';
import * as mock from './organizations.mock';

export const getOrganizations = (filters: OrganizationFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getOrganizations(filters, signal) : mock.getOrganizations(filters);
export const getOrganizationSummary = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getOrganizationSummary(signal) : mock.getOrganizationSummary();
export const getOrganizationById = (id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getOrganizationById(id, signal) : mock.getOrganizationById(id);
export const getAssignableOrganizations = (search = '', signal?: AbortSignal) => env.dataSource === 'api' ? api.getAssignableOrganizations(search, signal) : mock.getAssignableOrganizations(search);
export const startOrganizationReview = (id: string, actor: AdminSession) => env.dataSource === 'api' ? api.startOrganizationReview(id) : mock.startOrganizationReview(id, actor);
export const approveOrganization = (id: string, actor: AdminSession) => env.dataSource === 'api' ? api.approveOrganization(id) : mock.approveOrganization(id, actor);
export const rejectOrganization = (id: string, input: RejectOrganizationInput, actor: AdminSession) => env.dataSource === 'api' ? api.rejectOrganization(id, input) : mock.rejectOrganization(id, input, actor);
export const requestOrganizationInfo = (id: string, input: RequestInfoInput, actor: AdminSession) => env.dataSource === 'api' ? api.requestOrganizationInfo(id, input) : mock.requestOrganizationInfo(id, input, actor);
export const suspendOrganization = (id: string, input: SuspendOrganizationInput, actor: AdminSession) => env.dataSource === 'api' ? api.suspendOrganization(id, input) : mock.suspendOrganization(id, input, actor);
export const reactivateOrganization = (id: string, note: string | undefined, actor: AdminSession) => env.dataSource === 'api' ? api.reactivateOrganization(id) : mock.reactivateOrganization(id, note, actor);
export const reviewOrganizationDocument = (id: string, documentId: string, input: ReviewDocumentInput, actor: AdminSession) => env.dataSource === 'api' ? api.reviewOrganizationDocument(id, documentId, input) : mock.reviewOrganizationDocument(id, documentId, input, actor);
export const addOrganizationNote = (id: string, note: string, actor: AdminSession) => env.dataSource === 'api' ? api.addOrganizationNote(id, note) : mock.addOrganizationNote(id, note, actor);
