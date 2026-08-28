import { Badge } from '@/components/ui';

import { donationCampaignStatusLabels } from '../constants';
import type { DonationCampaignStatus } from '../types';

// Map each campaign status to the visual tone used by the shared badge.
export function DonationCampaignStatusBadge({ status }: { status: DonationCampaignStatus }) {
  const tone =
    status === 'PUBLISHED'
      ? 'success'
      : status === 'PENDING_REVIEW'
        ? 'pending'
        : status === 'REJECTED' || status === 'DELETED'
          ? 'critical'
          : 'neutral';

  return <Badge tone={tone}>{donationCampaignStatusLabels[status]}</Badge>;
}