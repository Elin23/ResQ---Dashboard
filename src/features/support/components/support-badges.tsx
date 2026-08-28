import { Badge, StatusBadge } from '@/components/ui';

import { supportPriorityLabels, supportPriorityTone } from '../constants';
import type { SupportTicketPriority, SupportTicketStatus } from '../types';

export function SupportStatusBadge({ status }: { status: SupportTicketStatus }) {
  return <StatusBadge status={`support:${status}`} />;
}

// Keep priority styling centralized through the shared constants.
export function SupportPriorityBadge({ priority }: { priority: SupportTicketPriority }) {
  return (
    <Badge tone={supportPriorityTone[priority]}>
      {supportPriorityLabels[priority]}
    </Badge>
  );
}