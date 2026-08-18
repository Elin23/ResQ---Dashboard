import { getReports } from '@/features/reports/services/reports.mock';
import { organizationFixtures } from '@/features/organizations/services/organization-fixtures';
import type { Report, ReportSeverity } from '@/features/reports/types';
import type { RescueMissionPriority, RescueMissionStatus } from '../types';

export const missionOrganizations = organizationFixtures
  .filter((organization) => organization.status === 'ACTIVE' && organization.verificationStatus === 'VERIFIED')
  .map((organization) => ({ id: organization.id, name: organization.name, governorate: organization.governorate }));

export interface RescueMissionCompat {
  id: string;
  reportId: string;
  status: RescueMissionStatus;
  priority: RescueMissionPriority;
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

function missionStatus(report: Report): RescueMissionStatus {
  if (report.status === 'CLOSED' || report.status === 'RECEIVED') return 'COMPLETED';
  return report.assignedOrganization ? 'ON_THE_WAY' : 'ASSIGNED';
}

function priority(severity: ReportSeverity): RescueMissionPriority {
  return severity;
}

function toMission(report: Report): RescueMissionCompat | null {
  if (!report.assignedOrganization) return null;
  const assignedAt = report.assignedAt ?? report.createdAt;
  const completed = report.status === 'RECEIVED' || report.status === 'CLOSED';
  const completedAt = report.receivedAt ?? report.closedAt ?? (completed ? report.updatedAt : undefined);
  return {
    id: `CASE-${report.id}`,
    reportId: report.id,
    status: missionStatus(report),
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

export async function getRescueMissions(filters: CompatFilters = {}) {
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
  const rows = result.items.map(toMission).filter((value): value is RescueMissionCompat => value !== null);
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const items = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { items, total, page: safePage, pageSize, pageCount };
}

export async function getMissionDashboardSnapshot() {
  const result = await getRescueMissions({ page: 1, pageSize: 100 });
  const active = result.items.filter((mission) => mission.status !== 'COMPLETED' && mission.status !== 'CANCELLED');
  const overdueCount = active.filter((mission) => Date.now() - new Date(mission.assignedAt).getTime() > 45 * 60_000).length;
  return { activeCount: active.length, overdueCount, active };
}
