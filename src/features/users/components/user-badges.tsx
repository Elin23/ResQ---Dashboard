import { Badge, StatusBadge } from '@/components/ui';

import { verificationLabels } from '../constants';
import type { UserAccountStatus, UserVerificationStatus } from '../types';

export const UserAccountStatusBadge = ({ status }: { status: UserAccountStatus }) => (
  <StatusBadge status={`user:${status}`} />
);

// Verification tone follows the level of completed identity checks.
export function UserVerificationBadge({ status }: { status: UserVerificationStatus }) {
  const tone = status === 'VERIFIED' ? 'success' : status === 'PHONE_VERIFIED' ? 'info' : 'neutral';

  return <Badge tone={tone}>{verificationLabels[status]}</Badge>;
}