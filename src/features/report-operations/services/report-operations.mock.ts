import { getReports } from '@/features/reports/services/reports.mock';
import { organizationFixtures } from '@/features/organizations/services/organization-fixtures';
import type { Report, ReportSeverity } from '@/features/reports/types';
import type { ReportOperationPriority, ReportOperationStatus } from '../types';

export const reportOperationOrganizations = organizationFixtures
  .filter((organization) => organization.status === 'ACTIVE' && organization.verificationStatus === 'VERIFIED')
  .map((organization) => ({ id: organization.id, name: organization.name, governorate: organization.governorate }));

export interface ReportOperationRecord {
  id: string;
  reportId: string;
  status: ReportOperationStatus;
  priority: ReportOperationPriority;
  animal: { type: string; description?: string };
  location: { governorate: string; city?: string; address: string; latitude: number; longitude: number };
  organization: { id: string; name: string };
  assignedAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  completion?: { destinationType?: 'SHELTER' | 'OTHER'; destinationId?: string; destinationName?: string; completedAt: string };
}

type CompatFilters = {
  search?: string;
  organizationId?: string;
  governorate?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortDirection?: 'asc' | 'desc';
};

function operationStatus(report: Report): ReportOperationStatus {
  if (report.status === 'CLOSED' || report.status === 'RECEIVED') return 'COMPLETED';
  return report.assignedOrganization ? 'ON_THE_WAY' : 'ASSIGNED';
}

function priority(severity: ReportSeverity): ReportOperationPriority {
  return severity;
}

function toOperation(report: Report): ReportOperationRecord | null {
  if (!report.assignedOrganization) return null;
  const assignedAt = report.assignedAt ?? report.createdAt;
  const completed = report.status === 'RECEIVED' || report.status === 'CLOSED';
  const completedAt = report.receivedAt ?? report.closedAt ?? (completed ? report.updatedAt : undefined);
  return {
    id: `CASE-${report.id}`,
    reportId: report.id,
    status: operationStatus(report),
    priority: priority(report.severity),
    animal: { type: report.animalType, description: report.animalDescription },
    location: { governorate: report.governorate, city: report.city, address: report.address, latitude: report.latitude, longitude: report.longitude },
    organization: report.assignedOrganization,
    assignedAt,
    acceptedAt: assignedAt,
    arrivedAt: completedAt,
    startedAt: assignedAt,
    completedAt,
    updatedAt: report.updatedAt,
    completion: completedAt ? { completedAt } : undefined,
  };
}

export async function getReportOperations(filters: CompatFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, filters.pageSize ?? 50);
  const result = await getReports({
    search: filters.search ?? '',
    organizationId: filters.organizationId,
    governorate: filters.governorate,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: 1,
    pageSize: 500,
    sortBy: 'updatedAt',
    sortDirection: filters.sortDirection ?? 'desc',
  });
  const rows = result.items.map(toOperation).filter((value): value is ReportOperationRecord => value !== null);
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const items = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { items, total, page: safePage, pageSize, pageCount };
}

export async function getReportOperationDashboardSnapshot() {
  const result = await getReportOperations({ page: 1, pageSize: 100 });
  const active = result.items.filter((operation) => operation.status !== 'COMPLETED' && operation.status !== 'CANCELLED');
  const overdueCount = active.filter((operation) => Date.now() - new Date(operation.assignedAt).getTime() > 45 * 60_000).length;
  return { activeCount: active.length, overdueCount, active };
}
