import type { AdoptionAnimalSpecies } from '@/features/adoption-requests/types';
import type { ReportSeverity } from '@/features/reports/types';

export type AnalyticsRangePreset = 'today' | '7d' | '30d' | 'month' | '3m' | 'year' | 'custom';
export type ManagementReportKey = 'reports' | 'rescue' | 'adoption' | 'organizations' | 'donations';

export interface AnalyticsFilters {
  range: AnalyticsRangePreset;
  from: string;
  to: string;
  governorate?: string;
  organizationId?: string;
  species?: AdoptionAnimalSpecies;
  severity?: ReportSeverity;
}

export type TrendDirectionMeaning = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | 'NEUTRAL';

export interface ComparisonMetric {
  value: number;
  previousValue?: number;
  percentageChange?: number;
  meaning: TrendDirectionMeaning;
}

export interface TimeSeriesPoint {
  date: string;
  primary: number;
  secondary?: number;
}

export interface NamedValue {
  key: string;
  label: string;
  value: number;
}

export interface MoneyAnalyticsValue {
  currency: 'SYP';
  amountMinor: number;
  operations: number;
  averageMinor: number;
}

export interface OrganizationPerformanceRow {
  id: string;
  name: string;
  governorate: string;
  completedMissions: number;
  activeMissions: number;
  averageAcceptanceMinutes?: number;
  averageArrivalMinutes?: number;
  completionRate: number;
}

export interface CoverageGap {
  governorate: string;
  reports: number;
  criticalReports: number;
  activeOrganizations: number;
  averageArrivalMinutes?: number;
  note: string;
}

export interface OperationalQuality {
  reportReviewOverTarget: number;
  missionAcceptanceOverTarget: number;
  missionArrivalOverTarget: number;
  adoptionReviewOverTarget: number;
  supportFirstResponseOverTarget: number;
}

export interface AnalyticsOverview {
  reports: ComparisonMetric;
  reportCompletionRate: ComparisonMetric;
  averageArrivalMinutes: ComparisonMetric;
  completedMissions: ComparisonMetric;
  completedAdoptions: ComparisonMetric;
  activeOrganizations: ComparisonMetric;
  newUsers: ComparisonMetric;
}

export interface ReportAnalytics {
  total: number;
  critical: number;
  completed: number;
  rejected: number;
  averagePerDay: number;
  trend: TimeSeriesPoint[];
  byStatus: NamedValue[];
  bySeverity: NamedValue[];
  bySpecies: NamedValue[];
  byGovernorate: NamedValue[];
  funnel: NamedValue[];
}

export interface RescueAnalytics {
  total: number;
  completed: number;
  cancelled: number;
  averageAcceptanceMinutes?: number;
  averageArrivalMinutes?: number;
  averageDurationMinutes?: number;
  completionRate: number;
  trend: TimeSeriesPoint[];
  organizations: OrganizationPerformanceRow[];
}

export interface AdoptionAnalytics {
  total: number;
  underReview: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  funnel: NamedValue[];
  completedBySpecies: NamedValue[];
  averageWaitingDays?: number;
  medianWaitingDays?: number;
}

export interface UserAnalytics {
  total: number;
  newUsers: number;
  activeUsers: number;
  suspended: number;
  reportedUsers: number;
  adoptionUsers: number;
  completedAdoptionUsers: number;
  growth: TimeSeriesPoint[];
}

export interface DonationAnalytics {
  totals: MoneyAnalyticsValue[];
  byPurpose: NamedValue[];
  byBeneficiary: NamedValue[];
  trend: Array<{ date: string; SYP: number }>;
}

export interface GeographyAnalytics {
  reports: NamedValue[];
  missions: NamedValue[];
  organizations: NamedValue[];
  feedingPoints: NamedValue[];
  gaps: CoverageGap[];
}

export interface AnalyticsResponse {
  filters: AnalyticsFilters;
  overview: AnalyticsOverview;
  reports: ReportAnalytics;
  rescue: RescueAnalytics;
  adoption: AdoptionAnalytics;
  users: UserAnalytics;
  donations?: DonationAnalytics;
  geography: GeographyAnalytics;
  quality: OperationalQuality;
  generatedAt: string;
}

export interface AdvertisementReportRow {
  id: string;
  title: string;
  advertiser: string;
  placement: string;
  status: string;
  impressions?: number;
  clicks?: number;
  clickThroughRate?: number;
}

export interface AdvertisementManagementReport {
  total: number;
  pendingReview: number;
  scheduled: number;
  active: number;
  paused: number;
  rejected: number;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate?: number;
  byPlacement: NamedValue[];
  rows: AdvertisementReportRow[];
}

export interface SupportManagementReport {
  total: number;
  newCount: number;
  openCount: number;
  urgentCount: number;
  waitingForUser: number;
  waitingForInternal: number;
  resolved: number;
  closed: number;
  averageFirstResponseMinutes?: number;
  byCategory: NamedValue[];
}

export interface SupplementalManagementReports {
  advertisements?: AdvertisementManagementReport;
  support?: SupportManagementReport;
}
