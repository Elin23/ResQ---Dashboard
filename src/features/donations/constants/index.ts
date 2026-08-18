import type { DonationCampaignStatus } from '../types';

export const donationCampaignStatusLabels: Record<DonationCampaignStatus, string> = {
  PENDING_REVIEW: 'بانتظار المراجعة',
  PUBLISHED: 'منشورة',
  REJECTED: 'مرفوضة',
  CLOSED: 'مغلقة',
  DELETED: 'محذوفة',
};

export const donationPurposeLabels = { GENERAL: 'حملات دعم الجمعيات' } as const;
export const donationBeneficiaryLabels = { ORGANIZATION: 'جمعية' } as const;
