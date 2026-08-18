import type { LucideIcon } from 'lucide-react';
import type { SemanticStatus, StatusTone } from '@/lib/statuses';

export type DashboardRange = 'TODAY' | '7D' | '30D';

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  context: string;
  tone: StatusTone;
  target: string;
  iconKey: 'reports' | 'critical' | 'waiting' | 'adoptions' | 'organizations' | 'donations';
}

export type AttentionSeverity = 'critical' | 'pending' | 'info';

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  severity: AttentionSeverity;
  waitingMinutes: number;
  target: string;
  actionLabel: string;
}

export interface ActiveMission {
  id: string;
  animal: string;
  location: string;
  organization: string;
  stage: SemanticStatus;
  progress: number;
  startedAt: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CriticalReport {
  id: string;
  animal: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH';
  status: SemanticStatus;
  submittedAt: string;
}

export interface WeeklyReportPoint {
  day: string;
  received: number;
  closed: number;
}

export interface OperationalSummaryPoint {
  label: string;
  value: number;
}

export interface DashboardSummary {
  generatedAt: string;
  metrics: DashboardMetric[];
  activeMissions: ActiveMission[];
  criticalReports: CriticalReport[];
  weeklyReports: WeeklyReportPoint[];
  operationalSummary: OperationalSummaryPoint[];
}

export type ActivityKind = 'organization-approved' | 'mission-assigned' | 'mission-completed' | 'adoption-approved' | 'advertisement-suspended';

export interface RecentActivity {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  resource: string;
  occurredAt: string;
  target: string;
}

export interface GeographicLayer {
  key: 'waiting-reports' | 'critical-reports' | 'organizations' | 'missions';
  label: string;
  count: number;
  tone: StatusTone;
}

export interface GeographicSnapshot {
  coverageLabel: string;
  lastSyncedAt: string;
  layers: GeographicLayer[];
}

export interface QuickActionDefinition {
  label: string;
  description: string;
  target: string;
  permission: import('@/features/auth/permissions').Permission;
  icon: LucideIcon;
}
