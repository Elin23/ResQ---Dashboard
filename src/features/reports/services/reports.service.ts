import { env } from '@/config/env';
import type { AdminSession } from '@/features/auth/session';
import type { AdminStatusOverrideInput, DeleteReportInput, ReportFilters } from '../types';
import * as api from './reports.api';
import * as mock from './reports.mock';

export const getReports = (filters: ReportFilters, signal?: AbortSignal) => env.dataSource === 'api' ? api.getReports(filters, signal) : mock.getReports(filters);
export const getReportSummary = (signal?: AbortSignal) => env.dataSource === 'api' ? api.getReportSummary(signal) : mock.getReportSummary();
export const getReportById = (id: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getReportById(id, signal) : mock.getReportById(id);
export const getEligibleOrganizations = (search: string, signal?: AbortSignal) => env.dataSource === 'api' ? api.getEligibleOrganizations(search, signal) : mock.getEligibleOrganizations(search);

export async function assignReport(id: string, organizationId: string, actor: AdminSession) {
  if (env.dataSource === 'api') return api.assignReport(id, organizationId);
  await mock.assignReport(id, organizationId, actor);
  return mock.getReportById(id);
}

export async function adminOverrideReportStatus(id: string, input: AdminStatusOverrideInput, actor: AdminSession) {
  if (env.dataSource === 'api') return api.adminOverrideReportStatus(id, input);
  await mock.adminOverrideReportStatus(id, input, actor);
  return mock.getReportById(id);
}

export const deleteReport = (id: string, input: DeleteReportInput, actor: AdminSession) => env.dataSource === 'api' ? api.deleteReport(id, input) : mock.deleteReport(id, input, actor);
export const addReportNote = (id: string, note: string, actor: AdminSession) => env.dataSource === 'api' ? api.addReportNote(id, note) : mock.addReportNote(id, note, actor);
