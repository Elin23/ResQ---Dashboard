import { Badge } from '@/components/ui';
import { donationCampaignStatusLabels } from '../constants';
import type { DonationCampaignStatus } from '../types';

export function DonationCampaignStatusBadge({ status }: { status: DonationCampaignStatus }) {
  const tone = status === 'PUBLISHED' ? 'success' : status === 'PENDING_REVIEW' ? 'pending' : status === 'REJECTED' || status === 'DELETED' ? 'critical' : 'neutral';
  return <Badge tone={tone}>{donationCampaignStatusLabels[status]}</Badge>;
}
