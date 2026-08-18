export const donationCampaignStatuses = ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'CLOSED', 'DELETED'] as const;
export type DonationCampaignStatus = (typeof donationCampaignStatuses)[number];

export const donationCurrencies = ['SYP'] as const;
export type DonationCurrency = (typeof donationCurrencies)[number];

export interface DonationCampaignPublisher {
  id: string;
  name: string;
}

export interface DonationCampaignBeneficiary {
  id: string;
  name: string;
}

export interface DonationCampaignMedia {
  id: string;
  type: 'IMAGE';
  url: string;
  alt: string;
}

export interface DonationArchiveEntry {
  id: string;
  displayName: string;
  anonymous: boolean;
  amountMinor: number;
  currency: DonationCurrency;
  donatedAt: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  publisher: DonationCampaignPublisher;
  beneficiaryOrganization: DonationCampaignBeneficiary;
  media: DonationCampaignMedia[];
  status: DonationCampaignStatus;
  targetAmountMinor?: number;
  raisedAmountMinor: number;
  currency: DonationCurrency;
  donorCount: number;
  submittedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  closedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCampaignTimelineEvent {
  id: string;
  title: string;
  actor?: string;
  timestamp: string;
  details?: string;
  tone?: 'neutral' | 'success' | 'pending' | 'critical' | 'info';
}

export interface DonationCampaignDetails {
  campaign: DonationCampaign;
  donors: DonationArchiveEntry[];
  timeline: DonationCampaignTimelineEvent[];
}

export interface DonationCampaignFilters {
  search: string;
  status?: DonationCampaignStatus;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  sortBy?: 'submittedAt' | 'updatedAt' | 'raisedAmountMinor' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface DonationCampaignListResult {
  items: DonationCampaign[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface MoneyTotal {
  currency: DonationCurrency;
  amountMinor: number;
}

export interface DonationSummary {
  total: MoneyTotal[];
  thisMonth: MoneyTotal[];
  completed: number;
  pending: number;
  publishedCampaigns: number;
  donorCount: number;
}

// Read-only analytics compatibility. These records intentionally exclude payment and contact data.
export type DonationPurpose = 'GENERAL';
export type DonationBeneficiaryType = 'ORGANIZATION';
export interface DonationArchiveAnalyticsRecord {
  id: string;
  amountMinor: number;
  currency: DonationCurrency;
  status: 'COMPLETED';
  purpose: DonationPurpose;
  beneficiary: { type: DonationBeneficiaryType; id: string; name: string };
  createdAt: string;
}
export interface DonationArchiveAnalyticsFilters {
  search?: string;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}
